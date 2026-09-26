/**
 * Servidor Mock HTTP Standalone (Puerto 3000)
 * Simula el comportamiento del backend NestJS de Pedro Acaro (EDT 1.3).
 * No requiere librerías externas (usa módulos nativos de Node.js).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const SEED_FILE = path.join(__dirname, 'seed-data.json');

let db = { tests: [], findings: [] };

try {
  const seedRaw = fs.readFileSync(SEED_FILE, 'utf-8');
  db = JSON.parse(seedRaw);
} catch (e) {
  console.warn('No se pudo cargar seed-data.json, iniciando memoria vacía');
}

function calculateSummary(tests) {
  if (tests.length === 0) {
    return {
      totalTests: 0,
      successRate: 0,
      avgTime: 0,
      avgSatisfaction: 0,
      trends: { totalTestsDiff: 0, successRateDiff: 0, avgTimeDiff: 0, avgSatisfactionDiff: 0 },
    };
  }
  const totalTests = tests.length;
  const successCount = tests.filter((t) => t.taskResult === 'success').length;
  const successRate = Math.round((successCount / totalTests) * 1000) / 10;
  const totalTime = tests.reduce((sum, t) => sum + Number(t.timeOnTask || 0), 0);
  const avgTime = Math.round((totalTime / totalTests) * 10) / 10;
  const totalSat = tests.reduce((sum, t) => sum + Number(t.satisfactionScore || 0), 0);
  const avgSatisfaction = Math.round((totalSat / totalTests) * 10) / 10;

  return {
    totalTests,
    successRate,
    avgTime,
    avgSatisfaction,
    trends: {
      totalTestsDiff: +2,
      successRateDiff: +5.5,
      avgTimeDiff: -12.3,
      avgSatisfactionDiff: +0.4,
    },
  };
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    let parsedBody = {};
    if (body) {
      try {
        parsedBody = JSON.parse(body);
      } catch (e) {}
    }

    res.setHeader('Content-Type', 'application/json');

    // GET /api/tests o /tests
    if ((pathname === '/api/tests' || pathname === '/tests') && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(db.tests));
      return;
    }

    // POST /api/tests o /tests
    if ((pathname === '/api/tests' || pathname === '/tests') && req.method === 'POST') {
      const newTest = {
        ...parsedBody,
        id: `test-uuid-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      db.tests.unshift(newTest);
      res.writeHead(201);
      res.end(JSON.stringify(newTest));
      return;
    }

    // DELETE /api/tests/:id
    if (pathname.startsWith('/api/tests/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/tests/', '');
      db.tests = db.tests.filter((t) => t.id !== id);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // GET /api/dashboard/summary
    if (pathname === '/api/dashboard/summary' || pathname === '/dashboard/summary') {
      res.writeHead(200);
      res.end(JSON.stringify(calculateSummary(db.tests)));
      return;
    }

    // GET /api/dashboard/findings
    if (pathname === '/api/dashboard/findings' || pathname === '/dashboard/findings') {
      res.writeHead(200);
      res.end(JSON.stringify(db.findings));
      return;
    }

    // POST /api/ai/analyze
    if (pathname === '/api/ai/analyze' || pathname === '/ai/analyze') {
      const note = parsedBody.observations || '';
      const response = {
        hallazgos_clave: [
          note ? `Observación analizada: "${note.slice(0, 100)}..."` : 'Se identificó alta variabilidad en el tiempo de resolución.',
          'Los evaluadores prefieren el componente StarRating sobre campos numéricos.',
          'La retroalimentación visual clara elimina el abismo de evaluación de Norman.',
        ],
        historias_usuario: [
          {
            titulo: 'Mejorar visibilidad de feedback y estados de carga',
            criterio_aceptacion: 'El usuario observa un spinner y mensaje explicativo durante operaciones asíncronas.',
            prioridad: 'alta',
          },
          {
            titulo: 'Filtrar métricas por severidad en el Dashboard',
            criterio_aceptacion: 'Hacer clic en una categoría de severidad filtra la tabla y recalcula los KPIs.',
            prioridad: 'media',
          },
        ],
        recomendaciones_diseno: [
          'Aplicar Ley de Fitts: CTAs con mínimo 44×44px.',
          'Garantizar contraste WCAG 2.1 AA (mínimo 4.5:1).',
          'Agrupar campos por afinidad según la Ley Gestalt de Proximidad.',
        ],
      };
      res.writeHead(200);
      res.end(JSON.stringify(response));
      return;
    }

    // 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint no encontrado', path: pathname }));
  });
});

server.listen(PORT, () => {
  console.log(`\n🟢 Servidor Mock NestJS activo en http://localhost:${PORT}`);
  console.log(`Endpoints disponibles:`);
  console.log(`- GET    http://localhost:${PORT}/api/tests`);
  console.log(`- POST   http://localhost:${PORT}/api/tests`);
  console.log(`- GET    http://localhost:${PORT}/api/dashboard/summary`);
  console.log(`- GET    http://localhost:${PORT}/api/dashboard/findings`);
  console.log(`- POST   http://localhost:${PORT}/api/ai/analyze\n`);
});
