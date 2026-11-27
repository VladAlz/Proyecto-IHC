import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { FindingsService } from '../findings/findings.service';
import { ScrumService } from '../scrum/scrum.service';
import { AiAnalysis } from './entities/ai-analysis.entity';
import { AnalyzeRequestDto, ApplyAnalysisDto, UpdateAnalysisDto } from './dto/ai.dto';
import { AiAnalysisInput, AiAnalysisMeta, AiAnalysisResult } from './ai.types';
import { buildUsabilityAnalysisPrompt, USABILITY_ANALYSIS_SYSTEM_PROMPT } from './prompts/usability-analysis.prompt';
import { createProvider, DEFAULT_MODELS, LlmProvider } from './providers/llm-providers';
import { normalizeAnalysis, parseJsonLoose } from './ai-normalizer';
import { generateHeuristicAnalysis } from './heuristic-engine';

export interface AiStatus {
  primary: string;
  chain: { provider: string; model: string; configured: boolean }[];
  mode: 'llm' | 'local';
}

const SUPPORTED = ['gemini', 'groq', 'openrouter'];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(UsabilityTest) private readonly tests: Repository<UsabilityTest>,
    @InjectRepository(AiAnalysis) private readonly analyses: Repository<AiAnalysis>,
    private readonly findingsService: FindingsService,
    private readonly scrumService: ScrumService,
  ) {}

  /** Orden de proveedores: AI_PROVIDER y luego AI_FALLBACK_PROVIDERS (sin duplicados) */
  private providerOrder(): string[] {
    const primary = (this.config.get<string>('AI_PROVIDER') || 'gemini').trim().toLowerCase();
    const fallbacks = (this.config.get<string>('AI_FALLBACK_PROVIDERS') || 'groq,openrouter')
      .split(',')
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);
    if (primary === 'local') return [];
    return [...new Set([primary, ...fallbacks])].filter((p) => SUPPORTED.includes(p));
  }

  getProviderChain(): LlmProvider[] {
    const env = { get: (k: string) => this.config.get<string>(k) };
    return this.providerOrder()
      .map((name) => createProvider(name, env))
      .filter((p): p is LlmProvider => p !== null);
  }

  getStatus(): AiStatus {
    const env = { get: (k: string) => this.config.get<string>(k) };
    const chain = this.providerOrder().map((provider) => {
      const p = createProvider(provider, env);
      return { provider, model: p?.model || DEFAULT_MODELS[provider], configured: Boolean(p) };
    });
    chain.push({ provider: 'local', model: 'motor-heuristico-ihc', configured: true });
    const firstConfigured = chain.find((c) => c.configured)!;
    return { primary: firstConfigured.provider, chain, mode: firstConfigured.provider === 'local' ? 'local' : 'llm' };
  }

  /** Reúne la evidencia: sesiones seleccionadas, sesiones de un plan y texto libre */
  async buildInput(dto: AnalyzeRequestDto): Promise<{ input: AiAnalysisInput; testIds: string[] }> {
    const ids = new Set<string>([...(dto.testIds || []), ...(dto.testId ? [dto.testId] : [])]);
    let sessions: UsabilityTest[] = [];
    if (ids.size) sessions = await this.tests.find({ where: { id: In([...ids]) } });
    if (dto.planId) {
      const fromPlan = await this.tests.find({ where: { planId: dto.planId } });
      sessions = [...sessions, ...fromPlan.filter((t) => !ids.has(t.id))];
    }
    sessions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const input: AiAnalysisInput = {
      sessions: sessions.map((s) => ({
        evaluatorName: s.evaluatorName,
        taskDescription: s.taskDescription,
        taskCode: s.taskCode,
        taskResult: s.taskResult,
        timeOnTask: Number(s.timeOnTask),
        errorsCount: Number(s.errorsCount),
        satisfactionScore: Number(s.satisfactionScore),
        observations: s.observations,
        appVersion: s.appVersion,
      })),
      freeText: dto.observations,
      context: dto.context,
    };

    const hasEvidence = input.sessions.length > 0 || Boolean(dto.observations?.trim());
    if (!hasEvidence) {
      throw new BadRequestException('Selecciona al menos una sesión, un plan con sesiones o escribe observaciones para analizar');
    }
    return { input, testIds: sessions.map((s) => s.id) };
  }

  /**
   * Ejecuta el análisis recorriendo la cadena de proveedores. Si ninguno responde con un
   * JSON válido, usa el motor heurístico local, de modo que el módulo nunca queda inutilizable.
   */
  async runAnalysis(input: AiAnalysisInput): Promise<{ result: AiAnalysisResult; meta: AiAnalysisMeta }> {
    const started = Date.now();
    const warnings: string[] = [];
    const chain = this.getProviderChain();
    const userPrompt = buildUsabilityAnalysisPrompt(input);

    for (const [index, provider] of chain.entries()) {
      try {
        const raw = await provider.complete({ system: USABILITY_ANALYSIS_SYSTEM_PROMPT, user: userPrompt });
        const result = normalizeAnalysis(parseJsonLoose(raw));
        return {
          result,
          meta: {
            provider: provider.name,
            model: provider.model,
            fallback: index > 0,
            durationMs: Date.now() - started,
            sessions: input.sessions.length,
            warnings,
          },
        };
      } catch (err) {
        const message = `${provider.name}: ${(err as Error).message}`;
        this.logger.warn(`Proveedor IA falló → ${message}`);
        warnings.push(message);
      }
    }

    if (!chain.length) warnings.push('No hay API key configurada; se usó el motor heurístico local.');
    return {
      result: generateHeuristicAnalysis(input),
      meta: {
        provider: 'local',
        model: 'motor-heuristico-ihc',
        fallback: chain.length > 0,
        durationMs: Date.now() - started,
        sessions: input.sessions.length,
        warnings,
      },
    };
  }

  async analyze(dto: AnalyzeRequestDto): Promise<AiAnalysis> {
    const { input, testIds } = await this.buildInput(dto);
    const { result, meta } = await this.runAnalysis(input);
    const title =
      dto.title?.trim() ||
      `Análisis ${new Date().toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })} · ${input.sessions.length} sesión(es)`;
    return this.analyses.save(
      this.analyses.create({ title, testIds, planId: dto.planId, freeText: dto.observations, result, meta, edited: false }),
    );
  }

  listAnalyses() {
    return this.analyses.find({ order: { createdAt: 'DESC' }, take: 50 });
  }

  async getAnalysis(id: string) {
    const row = await this.analyses.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Análisis "${id}" no encontrado`);
    return row;
  }

  async updateAnalysis(id: string, dto: UpdateAnalysisDto) {
    const row = await this.getAnalysis(id);
    row.result = normalizeAnalysis(dto.result);
    if (dto.title?.trim()) row.title = dto.title.trim();
    row.edited = true;
    return this.analyses.save(row);
  }

  async removeAnalysis(id: string) {
    const row = await this.getAnalysis(id);
    await this.analyses.remove(row);
    return { success: true, id };
  }

  /**
   * Lleva la salida (revisada por el investigador) al sistema:
   * hallazgos → matriz de hallazgos; historias → Product Backlog (enlazadas a su hallazgo).
   */
  async apply(dto: ApplyAnalysisDto) {
    const createdFindings = await this.findingsService.createMany(
      (dto.findings || []).map((f) => ({
        severity: f.severidad,
        heuristicViolated: f.heuristica,
        category: f.categoria,
        location: f.pantalla || 'General',
        description: f.descripcion || f.titulo,
        evidence: f.evidencia,
        frequency: f.frecuencia,
        recommendation: f.recomendacion || 'Por definir en refinamiento',
        theoreticalBasis: f.fundamento,
        source: 'ia' as const,
        status: 'pendiente' as const,
      })),
    );

    const createdStories = [];
    for (const s of dto.stories || []) {
      const finding = s.findingIndex !== undefined ? createdFindings[s.findingIndex] : undefined;
      const criteria = s.tareas?.length
        ? `${s.criterio_aceptacion}\n\nTareas sugeridas:\n${s.tareas.map((t) => `- ${t}`).join('\n')}`
        : s.criterio_aceptacion;
      createdStories.push(
        await this.scrumService.createStory({
          title: s.titulo,
          acceptanceCriteria: criteria,
          priority: s.prioridad,
          module: s.modulo || 'UI',
          businessValue: s.valor_negocio ?? 5,
          storyPoints: s.story_points ?? 3,
          source: finding ? 'hallazgo' : 'ia',
          findingId: finding?.id ?? null,
        }),
      );
    }

    return { findings: createdFindings, stories: createdStories };
  }
}
