import { faker } from '@faker-js/faker';

import { connectDatabase } from '../config/database.js';
import { EMPLOYEE_ROLES } from '../features/employees/employee.constants.js';
import { Employee } from '../features/employees/employee.model.js';
import {
  PERFORMANCE_PERIOD_STATUS,
  PERFORMANCE_REVIEW_STATUS
} from '../features/performance/performance.constants.js';
import { PerformancePeriod } from '../features/performance/performance-period.model.js';
import { PerformanceReview } from '../features/performance/performance-review.model.js';
import { calculatePerformanceResult } from '../features/performance/performance.scoring.js';
import { REDEMPTION_STATUS } from '../features/redemptions/redemption.constants.js';
import { Redemption } from '../features/redemptions/redemption.model.js';
import {
  approveRedemption,
  markRedemptionDelivered,
  rejectRedemption,
  requestRedemption
} from '../features/redemptions/redemption.service.js';
import { REWARD_CATEGORIES } from '../features/rewards/reward.constants.js';
import { Reward } from '../features/rewards/reward.model.js';
import { MeritTransaction } from '../features/wallet/merit-transaction.model.js';
import {
  MERIT_TRANSACTION_SOURCE_TYPES,
  MERIT_TRANSACTION_TYPES
} from '../features/wallet/wallet.constants.js';

const departments = [
  'Desarrollo de Software',
  'Infraestructura',
  'Calidad QA',
  'Data Analytics',
  'Soporte Tecnico',
  'Ciberseguridad'
];

const developerPositions = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'QA Automation Engineer',
  'DevOps Engineer',
  'Data Engineer',
  'Cybersecurity Analyst'
];

const adminPositions = ['RRHH Analyst', 'RRHH Manager', 'Technical Lead'];

const rewardFixtures = [
  {
    name: 'GitHub Copilot Pro Anual',
    description: 'Suscripcion anual a GitHub Copilot Pro para acelerar desarrollo asistido.',
    category: REWARD_CATEGORIES.LICENSES,
    costInPoints: 1200,
    stock: 12
  },
  {
    name: 'Windsurf Pro Anual',
    description: 'Licencia anual de IDE con capacidades avanzadas de IA.',
    category: REWARD_CATEGORIES.LICENSES,
    costInPoints: 1100,
    stock: 10
  },
  {
    name: 'Curso Tecnico Especializado',
    description: 'Pago de un curso tecnico avanzado en plataforma educativa.',
    category: REWARD_CATEGORIES.TRAINING,
    costInPoints: 900,
    stock: 18
  },
  {
    name: 'Voucher Examen AWS',
    description: 'Voucher para examen de certificacion cloud AWS.',
    category: REWARD_CATEGORIES.TRAINING,
    costInPoints: 1800,
    stock: 8
  },
  {
    name: 'Teclado Mecanico',
    description: 'Teclado mecanico para mejorar productividad y confort.',
    category: REWARD_CATEGORIES.HARDWARE,
    costInPoints: 950,
    stock: 15
  },
  {
    name: 'Monitor Adicional',
    description: 'Monitor extra para setup de desarrollo.',
    category: REWARD_CATEGORIES.HARDWARE,
    costInPoints: 2200,
    stock: 6
  },
  {
    name: 'Silla Ergonomica',
    description: 'Silla ergonomica para home office.',
    category: REWARD_CATEGORIES.HARDWARE,
    costInPoints: 3000,
    stock: 4
  },
  {
    name: 'Viernes Corto',
    description: 'Salida a mediodia un viernes coordinado con RRHH.',
    category: REWARD_CATEGORIES.TIME,
    costInPoints: 800,
    stock: 25
  },
  {
    name: 'Dia Libre Completo',
    description: 'Dia libre sujeto a aprobacion de RRHH y lider tecnico.',
    category: REWARD_CATEGORIES.TIME,
    costInPoints: 1600,
    stock: 15
  },
  {
    name: 'Bono Bienestar',
    description: 'Apoyo para actividad de bienestar o salud.',
    category: REWARD_CATEGORIES.WELLNESS,
    costInPoints: 700,
    stock: 20
  },
  {
    name: 'Audifonos Profesionales',
    description: 'Audifonos con cancelacion de ruido para concentracion.',
    category: REWARD_CATEGORIES.HARDWARE,
    costInPoints: 1400,
    stock: 9
  },
  {
    name: 'Libro Tecnico Premium',
    description: 'Compra de libro tecnico especializado.',
    category: REWARD_CATEGORIES.TRAINING,
    costInPoints: 450,
    stock: 30
  },
  {
    name: 'JetBrains Toolbox Anual',
    description: 'Licencia anual para suite JetBrains.',
    category: REWARD_CATEGORIES.LICENSES,
    costInPoints: 1300,
    stock: 10
  },
  {
    name: 'Stand de Laptop',
    description: 'Soporte ergonomico para laptop.',
    category: REWARD_CATEGORIES.HARDWARE,
    costInPoints: 500,
    stock: 25
  },
  {
    name: 'Mentoria Tecnica Externa',
    description: 'Sesion de mentoria con especialista externo.',
    category: REWARD_CATEGORIES.TRAINING,
    costInPoints: 1000,
    stock: 12
  },
  {
    name: 'Tarjeta Cafe Equipo',
    description: 'Tarjeta de consumo para cafe o snacks.',
    category: REWARD_CATEGORIES.WELLNESS,
    costInPoints: 350,
    stock: 40
  },
  {
    name: 'Upgrade Mouse Ergonomico',
    description: 'Mouse ergonomico para jornada prolongada.',
    category: REWARD_CATEGORIES.HARDWARE,
    costInPoints: 650,
    stock: 18
  },
  {
    name: 'Semana Sin Guardias',
    description: 'Exencion de guardias por una semana laboral.',
    category: REWARD_CATEGORIES.TIME,
    costInPoints: 1400,
    stock: 10
  },
  {
    name: 'Licencia Postman Pro',
    description: 'Licencia anual para testing y documentacion de APIs.',
    category: REWARD_CATEGORIES.LICENSES,
    costInPoints: 850,
    stock: 14
  },
  {
    name: 'Workshop Seguridad Aplicativa',
    description: 'Taller practico de seguridad para aplicaciones web.',
    category: REWARD_CATEGORIES.TRAINING,
    costInPoints: 1250,
    stock: 0,
    isActive: false
  }
];

function getPastMonths(totalMonths) {
  const now = new Date();

  return Array.from({ length: totalMonths }, (_item, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return {
      month,
      year,
      label: `${year}-${String(month).padStart(2, '0')}`,
      status: index === 0 ? PERFORMANCE_PERIOD_STATUS.CALCULATED : PERFORMANCE_PERIOD_STATUS.CLOSED,
      calculatedAt: date,
      closedAt: index === 0 ? null : new Date(year, month, 0)
    };
  });
}

function createDemoKpis() {
  const baseScore = faker.number.float({ min: 58, max: 98, fractionDigits: 2 });

  return {
    qualityScore: baseScore + faker.number.float({ min: -5, max: 6, fractionDigits: 2 }),
    deliveryScore: baseScore + faker.number.float({ min: -7, max: 7, fractionDigits: 2 }),
    bugFixRate: baseScore + faker.number.float({ min: -8, max: 8, fractionDigits: 2 }),
    collaborationScore: baseScore + faker.number.float({ min: -6, max: 8, fractionDigits: 2 }),
    innovationScore: baseScore + faker.number.float({ min: -10, max: 10, fractionDigits: 2 })
  };
}

function createDemoSelfEvaluation(result) {
  return {
    technicalAchievements: faker.helpers.arrayElement([
      'Complete entregables tecnicos priorizados y documente decisiones importantes.',
      'Resolvi incidencias criticas y mejore estabilidad del modulo asignado.',
      'Aporte mejoras de calidad y mantuve comunicacion activa con el equipo.'
    ]),
    blockers: faker.helpers.arrayElement([
      'Dependencias externas retrasaron parte del trabajo.',
      'Se requirio coordinacion adicional con QA y producto.',
      'No se presentaron bloqueos criticos durante el periodo.'
    ]),
    collaborationNotes: faker.helpers.arrayElement([
      'Participe en revisiones de codigo y apoye a companeros del equipo.',
      'Coordine entregas con backend, frontend y QA.',
      'Mantuve comunicacion clara durante el sprint.'
    ]),
    learningNotes: faker.helpers.arrayElement([
      'Profundice en buenas practicas de testing.',
      'Mejore mi entendimiento del dominio de negocio.',
      'Refuerce practicas de observabilidad y debugging.'
    ]),
    selfScore: Math.min(100, Math.max(0, Math.round(result.finalScore + faker.number.int({ min: -5, max: 5 })))),
    submittedAt: faker.date.recent({ days: 25 })
  };
}

function createDemoSupervisorEvaluation(result, reviewerId) {
  return {
    ...result.kpis,
    reviewedBy: reviewerId,
    comments: faker.helpers.arrayElement([
      'Evaluacion demo: desempeno alineado a objetivos del periodo.',
      'Evaluacion demo: buen balance entre entrega, calidad y colaboracion.',
      'Evaluacion demo: se identifican avances claros y oportunidades de mejora.'
    ]),
    reviewedAt: faker.date.recent({ days: 12 })
  };
}

function createAdmin(index) {
  const name = faker.person.fullName();

  return {
    name,
    email: `rrhh.admin${index + 1}@codemetrics.test`,
    role: EMPLOYEE_ROLES.ADMIN,
    department: 'Recursos Humanos',
    position: adminPositions[index % adminPositions.length],
    pointBalance: 0,
    isActive: true
  };
}

function createEmployee(index) {
  const name = faker.person.fullName();

  return {
    name,
    email: `developer${String(index + 1).padStart(3, '0')}@codemetrics.test`,
    role: EMPLOYEE_ROLES.EMPLOYEE,
    department: faker.helpers.arrayElement(departments),
    position: faker.helpers.arrayElement(developerPositions),
    pointBalance: 0,
    isActive: faker.datatype.boolean({ probability: 0.94 })
  };
}

async function seed() {
  const connection = await connectDatabase();
  const admins = Array.from({ length: 3 }, (_item, index) => createAdmin(index));
  const employees = Array.from({ length: 100 }, (_item, index) => createEmployee(index));

  await Redemption.deleteMany({});
  await Reward.deleteMany({});
  await MeritTransaction.deleteMany({});
  await PerformanceReview.deleteMany({});
  await PerformancePeriod.deleteMany({});
  await Employee.deleteMany({});
  const insertedEmployees = await Employee.insertMany([...admins, ...employees]);
  const adminReviewer = insertedEmployees.find((employee) => employee.role === EMPLOYEE_ROLES.ADMIN);

  const periods = await PerformancePeriod.insertMany(getPastMonths(6));
  const reviewEmployees = insertedEmployees.filter(
    (employee) => employee.role === EMPLOYEE_ROLES.EMPLOYEE && employee.isActive
  );
  const periodsForReviews = [...periods].reverse();
  const reviews = periodsForReviews.flatMap((period) =>
    reviewEmployees.map((employee) => {
      const result = calculatePerformanceResult(createDemoKpis());

      return {
        employeeId: employee._id,
        periodId: period._id,
        kpis: result.kpis,
        finalScore: result.finalScore,
        pointsAwarded: result.pointsAwarded,
        notes: 'Seeded monthly performance review.',
        status: PERFORMANCE_REVIEW_STATUS.FINALIZED,
        selfEvaluation: createDemoSelfEvaluation(result),
        supervisorEvaluation: createDemoSupervisorEvaluation(result, adminReviewer?._id ?? null),
        finalizedAt: faker.date.recent({ days: 8 })
      };
    })
  );

  const insertedReviews = await PerformanceReview.insertMany(reviews);
  const balanceByEmployeeId = new Map(
    reviewEmployees.map((employee) => [employee._id.toString(), 0])
  );
  const performanceTransactions = insertedReviews
    .filter((review) => review.pointsAwarded > 0)
    .map((review) => {
      const employeeId = review.employeeId.toString();
      const balanceBefore = balanceByEmployeeId.get(employeeId) ?? 0;
      const balanceAfter = balanceBefore + review.pointsAwarded;
      balanceByEmployeeId.set(employeeId, balanceAfter);

      return {
        employeeId: review.employeeId,
        type: MERIT_TRANSACTION_TYPES.PERFORMANCE_BONUS,
        points: review.pointsAwarded,
        balanceBefore,
        balanceAfter,
        reason: 'Seeded monthly performance bonus.',
        sourceType: MERIT_TRANSACTION_SOURCE_TYPES.PERFORMANCE_REVIEW,
        sourceId: review._id,
        metadata: {
          periodId: review.periodId,
          finalScore: review.finalScore
        }
      };
    });

  await MeritTransaction.insertMany(performanceTransactions);

  await Employee.bulkWrite(
    [...balanceByEmployeeId.entries()].map(([employeeId, balance]) => ({
      updateOne: {
        filter: { _id: employeeId },
        update: { $set: { pointBalance: balance } }
      }
    }))
  );

  const rewards = await Reward.insertMany(rewardFixtures);
  const createdRedemptions = [];

  for (let index = 0; index < 18; index += 1) {
    const employee = await Employee.findOne({
      role: EMPLOYEE_ROLES.EMPLOYEE,
      isActive: true,
      pointBalance: { $gte: 350 }
    })
      .sort({ pointBalance: -1, name: 1 })
      .skip(index)
      .lean();

    if (!employee) {
      break;
    }

    const availableRewards = await Reward.find({
      isActive: true,
      stock: { $gt: 0 },
      costInPoints: { $lte: employee.pointBalance }
    }).lean();

    if (availableRewards.length === 0) {
      continue;
    }

    const reward = faker.helpers.arrayElement(availableRewards);
    const result = await requestRedemption({
      employeeId: employee._id,
      rewardId: reward._id,
      requestNote: faker.helpers.arrayElement([
        'Canje solicitado desde tienda demo.',
        'Solicitud para beneficio del proximo mes.',
        'Premio seleccionado por rendimiento destacado.'
      ])
    });

    const redemptionId = result.redemption._id;

    if (index % 6 === 0) {
      const rejected = await rejectRedemption(redemptionId, {
        reviewedBy: adminReviewer._id,
        decisionReason: 'Seed demo: solicitud rechazada por calendario.'
      });
      createdRedemptions.push(rejected.redemption);
      continue;
    }

    if (index % 3 === 0) {
      const approved = await approveRedemption(redemptionId, {
        reviewedBy: adminReviewer._id,
        decisionReason: 'Seed demo: aprobado por RRHH.'
      });
      const delivered = await markRedemptionDelivered(approved._id, {
        reviewedBy: adminReviewer._id,
        decisionReason: 'Seed demo: premio entregado.'
      });
      createdRedemptions.push(delivered);
      continue;
    }

    if (index % 2 === 0) {
      const approved = await approveRedemption(redemptionId, {
        reviewedBy: adminReviewer._id,
        decisionReason: 'Seed demo: aprobado por RRHH.'
      });
      createdRedemptions.push(approved);
      continue;
    }

    createdRedemptions.push(result.redemption);
  }

  console.log(
    `Seed complete: ${admins.length} admins, ${employees.length} employees, ${periods.length} periods, ${reviews.length} performance reviews, ${performanceTransactions.length} merit transactions, ${rewards.length} rewards and ${createdRedemptions.length} redemptions created.`
  );
  await connection.close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
