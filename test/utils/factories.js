import { EMPLOYEE_ROLES } from '../../src/features/employees/employee.constants.js';
import { Employee } from '../../src/features/employees/employee.model.js';
import { PerformancePeriod } from '../../src/features/performance/performance-period.model.js';
import { PerformanceReview } from '../../src/features/performance/performance-review.model.js';
import { calculatePerformanceResult } from '../../src/features/performance/performance.scoring.js';
import { REWARD_CATEGORIES } from '../../src/features/rewards/reward.constants.js';
import { Reward } from '../../src/features/rewards/reward.model.js';

let sequence = 0;

function nextId() {
  sequence += 1;
  return `${Date.now()}-${sequence}`;
}

export function employeePayload(overrides = {}) {
  return {
    name: 'Ada Developer',
    email: `developer-${nextId()}@codemetrics.test`,
    role: EMPLOYEE_ROLES.EMPLOYEE,
    department: 'Desarrollo de Software',
    position: 'Backend Developer',
    pointBalance: 0,
    isActive: true,
    ...overrides
  };
}

export function adminPayload(overrides = {}) {
  return employeePayload({
    name: 'RRHH Admin',
    email: `admin-${nextId()}@codemetrics.test`,
    role: EMPLOYEE_ROLES.ADMIN,
    department: 'Recursos Humanos',
    position: 'RRHH Analyst',
    pointBalance: 0,
    ...overrides
  });
}

export async function createEmployee(overrides = {}) {
  return Employee.create(employeePayload(overrides));
}

export async function createAdmin(overrides = {}) {
  return Employee.create(adminPayload(overrides));
}

export async function createPerformancePeriod(overrides = {}) {
  return PerformancePeriod.create({
    month: 5,
    year: 2026,
    label: '2026-05',
    status: 'draft',
    ...overrides
  });
}

export function kpiPayload(overrides = {}) {
  return {
    qualityScore: 90,
    deliveryScore: 85,
    bugFixRate: 80,
    collaborationScore: 95,
    innovationScore: 75,
    ...overrides
  };
}

export async function createPerformanceReview(employeeId, periodId, overrides = {}) {
  const result = calculatePerformanceResult(overrides.kpis ?? kpiPayload());

  return PerformanceReview.create({
    employeeId,
    periodId,
    kpis: result.kpis,
    finalScore: result.finalScore,
    pointsAwarded: result.pointsAwarded,
    notes: 'Test performance review.',
    ...overrides
  });
}

export function rewardPayload(overrides = {}) {
  return {
    name: `Reward ${nextId()}`,
    description: 'Reward for integration testing.',
    category: REWARD_CATEGORIES.TIME,
    costInPoints: 500,
    stock: 3,
    isActive: true,
    ...overrides
  };
}

export async function createReward(overrides = {}) {
  return Reward.create(rewardPayload(overrides));
}
