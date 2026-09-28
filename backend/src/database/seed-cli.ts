import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { UsabilityTest } from '../tests/entities/usability-test.entity';
import { UsabilityFinding } from '../dashboard/entities/usability-finding.entity';
import * as seedData from './seed-data.json';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgrespassword',
  database: process.env.DB_DATABASE || 'usability_db',
  entities: [UsabilityTest, UsabilityFinding],
  synchronize: true,
});

async function runSeed() {
  console.log('Conectando a la base de datos...');
  await AppDataSource.initialize();
  console.log('Conexión establecida.\n');

  const testRepository = AppDataSource.getRepository(UsabilityTest);
  const findingRepository = AppDataSource.getRepository(UsabilityFinding);

  const testCount = await testRepository.count();
  if (testCount === 0 && seedData.tests && seedData.tests.length > 0) {
    console.log(`Sembrando ${seedData.tests.length} pruebas iniciales...`);
    for (const t of seedData.tests) {
      const test = testRepository.create({
        id: t.id,
        evaluatorName: t.evaluatorName,
        taskDescription: t.taskDescription,
        timeOnTask: t.timeOnTask,
        errorsCount: t.errorsCount,
        satisfactionScore: t.satisfactionScore,
        taskResult: t.taskResult as 'success' | 'failure',
        observations: t.observations,
        createdAt: new Date(t.createdAt),
      });
      await testRepository.save(test);
    }
    console.log('Pruebas sembradas con exito.');
  } else {
    console.log(`Ya existen ${testCount} pruebas en la base de datos. Omitiendo seed de pruebas.`);
  }

  const findingCount = await findingRepository.count();
  if (findingCount === 0 && seedData.findings && seedData.findings.length > 0) {
    console.log(`Sembrando ${seedData.findings.length} hallazgos heuristicos...`);
    for (const f of seedData.findings) {
      const finding = findingRepository.create({
        id: f.id,
        severity: f.severity as 1 | 2 | 3 | 4,
        heuristicViolated: f.heuristicViolated,
        location: f.location,
        description: f.description,
        recommendation: f.recommendation,
        theoreticalBasis: f.theoreticalBasis,
      });
      await findingRepository.save(finding);
    }
    console.log('Hallazgos sembrados con exito.');
  } else {
    console.log(`Ya existen ${findingCount} hallazgos en la base de datos. Omitiendo seed de hallazgos.`);
  }

  await AppDataSource.destroy();
  console.log('\nSeed completado. Conexion cerrada.');
}

runSeed().catch((error) => {
  console.error('Error durante el seed:', error);
  process.exit(1);
});
