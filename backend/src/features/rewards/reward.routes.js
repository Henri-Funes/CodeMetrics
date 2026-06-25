import { Router } from 'express';

import {
  activateRewardHandler,
  createRewardHandler,
  deleteRewardHandler,
  deactivateRewardHandler,
  getRewardHandler,
  listRewardCatalogHandler,
  listRewardsHandler,
  updateRewardHandler
} from './reward.controller.js';

export const rewardRoutes = Router();

rewardRoutes.get('/', listRewardsHandler);
rewardRoutes.get('/catalog', listRewardCatalogHandler);
rewardRoutes.get('/:rewardId', getRewardHandler);
rewardRoutes.post('/', createRewardHandler);
rewardRoutes.patch('/:rewardId', updateRewardHandler);
rewardRoutes.patch('/:rewardId/activate', activateRewardHandler);
rewardRoutes.patch('/:rewardId/deactivate', deactivateRewardHandler);
rewardRoutes.delete('/:rewardId', deleteRewardHandler);
