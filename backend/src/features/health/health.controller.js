import { getHealthStatus } from './health.service.js';

export function getHealth(_req, res) {
  res.json(getHealthStatus());
}
