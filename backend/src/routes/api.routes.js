import { healthRoutes } from '../features/health/health.routes.js';
import { employeeRoutes } from '../features/employees/employee.routes.js';
import { performanceRoutes } from '../features/performance/performance.routes.js';
import { rewardRoutes } from '../features/rewards/reward.routes.js';
import { redemptionRoutes } from '../features/redemptions/redemption.routes.js';
import { walletRoutes } from '../features/wallet/wallet.routes.js';

export function registerApiRoutes(app) {
  app.use('/api/health', healthRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/performance', performanceRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/rewards', rewardRoutes);
  app.use('/api/redemptions', redemptionRoutes);
}
