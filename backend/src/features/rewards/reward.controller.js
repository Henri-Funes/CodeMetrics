import {
  createReward,
  getRewardById,
  listRewardCatalog,
  listRewards,
  setRewardActiveStatus,
  updateReward
} from './reward.service.js';

export async function listRewardsHandler(req, res, next) {
  try {
    const rewards = await listRewards(req.query);
    res.json({ data: rewards });
  } catch (error) {
    next(error);
  }
}

export async function listRewardCatalogHandler(req, res, next) {
  try {
    const rewards = await listRewardCatalog(req.query);
    res.json({ data: rewards });
  } catch (error) {
    next(error);
  }
}

export async function getRewardHandler(req, res, next) {
  try {
    const reward = await getRewardById(req.params.rewardId);
    res.json({ data: reward });
  } catch (error) {
    next(error);
  }
}

export async function createRewardHandler(req, res, next) {
  try {
    const reward = await createReward(req.body);
    res.status(201).json({ data: reward });
  } catch (error) {
    next(error);
  }
}

export async function updateRewardHandler(req, res, next) {
  try {
    const reward = await updateReward(req.params.rewardId, req.body);
    res.json({ data: reward });
  } catch (error) {
    next(error);
  }
}

export async function activateRewardHandler(req, res, next) {
  try {
    const reward = await setRewardActiveStatus(req.params.rewardId, true);
    res.json({ data: reward });
  } catch (error) {
    next(error);
  }
}

export async function deactivateRewardHandler(req, res, next) {
  try {
    const reward = await setRewardActiveStatus(req.params.rewardId, false);
    res.json({ data: reward });
  } catch (error) {
    next(error);
  }
}
