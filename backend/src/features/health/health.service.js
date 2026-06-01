import { getDatabaseStatus } from '../../config/database.js';

export function getHealthStatus() {
  return {
    status: 'ok',
    service: 'codemetrics-backend',
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString()
  };
}
