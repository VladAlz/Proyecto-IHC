/**
 * Utilidad de puertos para el entorno de desarrollo.
 *   node scripts/dev-ports.mjs check  → falla con un mensaje claro si 3000 (API) o 5173 (web) están ocupados
 *   node scripts/dev-ports.mjs stop   → cierra SOLO los procesos de este proyecto que escuchan en esos puertos
 *
 * Motivo: en Windows, al cerrar una terminal a veces quedan procesos node huérfanos; el nuevo backend falla con
 * EADDRINUSE y la app sigue hablando con la instancia vieja (p. ej. sin la API key recién configurada).
 */
import net from 'node:net';
import { execFileSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORTS = [
  { port: 3000, name: 'API NestJS' },
  { port: 5173, name: 'Frontend Vite' },
];
const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const isBusy = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => resolve(err.code === 'EADDRINUSE'));
    server.once('listening', () => server.close(() => resolve(false)));
    server.listen(port);
  });

/** Devuelve [{ pid, command }] de los procesos que escuchan en el puerto */
function listeners(port) {
  try {
    if (process.platform === 'win32') {
      const ps =
        `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ` +
        `ForEach-Object { $p = Get-CimInstance Win32_Process -Filter "ProcessId=$($_.OwningProcess)"; "$($_.OwningProcess)|$($p.CommandLine)" }`;
      // execFileSync evita que cmd.exe interprete los $ del script de PowerShell
      const out = execFileSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' });
      return parse(out);
    }
    const out = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -Fp`, { encoding: 'utf8' });
    return [...new Set(out.split('\n').filter((l) => l.startsWith('p')).map((l) => l.slice(1)))].map((pid) => ({
      pid,
      command: execSync(`ps -o command= -p ${pid}`, { encoding: 'utf8' }).trim(),
    }));
  } catch {
    return [];
  }
}

const parse = (out) =>
  [...new Set(out.split(/\r?\n/).filter(Boolean))].map((line) => {
    const [pid, ...rest] = line.split('|');
    return { pid: pid.trim(), command: rest.join('|').trim() };
  });

const belongsToProject = (command) => command.toLowerCase().includes(projectDir.toLowerCase());

async function check() {
  const busy = [];
  for (const p of PORTS) if (await isBusy(p.port)) busy.push(p);
  if (!busy.length) return;
  console.error('\n✖ No se puede iniciar: puertos ocupados');
  for (const p of busy) {
    const procs = listeners(p.port);
    const who = procs.map((x) => `PID ${x.pid}${belongsToProject(x.command) ? ' (otra instancia de este proyecto: ¿ya hay un npm run dev abierto?)' : ''}`).join(', ');
    console.error(`  • ${p.port} (${p.name}) → ${who || 'proceso desconocido'}`);
  }
  console.error('\n  Solución: ejecuta  npm run stop  y luego  npm run dev\n');
  process.exit(1);
}

function stop() {
  let stopped = 0;
  for (const p of PORTS) {
    for (const proc of listeners(p.port)) {
      if (!belongsToProject(proc.command)) {
        console.log(`  • ${p.port}: PID ${proc.pid} no pertenece a este proyecto; no se cierra (${proc.command.slice(0, 80)})`);
        continue;
      }
      try {
        execSync(process.platform === 'win32' ? `taskkill /PID ${proc.pid} /T /F` : `kill ${proc.pid}`, { stdio: 'ignore' });
        console.log(`  ✔ ${p.port} (${p.name}): proceso ${proc.pid} cerrado`);
        stopped += 1;
      } catch {
        console.log(`  ✖ No se pudo cerrar el PID ${proc.pid}`);
      }
    }
  }
  console.log(stopped ? '\nPuertos liberados. Ahora ejecuta: npm run dev\n' : '\nNo había procesos de este proyecto en ejecución.\n');
}

const mode = process.argv[2];
if (mode === 'check') await check();
else if (mode === 'stop') stop();
else console.log('Uso: node scripts/dev-ports.mjs check|stop');
