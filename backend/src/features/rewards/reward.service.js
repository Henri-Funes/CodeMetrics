import mongoose from 'mongoose';

import { Reward } from './reward.model.js';

const editableFields = ['name', 'description', 'category', 'costInPoints', 'stock', 'isActive'];

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function ensureValidObjectId(id, label = 'id') {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(`Invalid ${label}.`, 400);
  }
}

function pickEditableFields(payload) {
  return editableFields.reduce((fields, key) => {
    if (payload[key] !== undefined) {
      fields[key] = payload[key];
    }

    return fields;
  }, {});
}

function buildRewardFilters(query = {}) {
  const filters = {};

  if (query.category) {
    filters.category = query.category;
  }

  if (query.includeInactive !== 'true') {
    filters.isActive = true;
  }

  if (query.availableOnly === 'true') {
    filters.stock = { $gt: 0 };
  }

  if (query.search) {
    filters.$text = { $search: query.search };
  }

  return filters;
}

export async function listRewards(query = {}) {
  const filters = buildRewardFilters(query);

  return Reward.find(filters).sort({ category: 1, costInPoints: 1, name: 1 }).lean();
}

export async function listRewardCatalog(query = {}) {
  return listRewards({
    ...query,
    includeInactive: 'false',
    availableOnly: 'true'
  });
}

export async function getRewardById(rewardId) {
  ensureValidObjectId(rewardId, 'reward id');

  const reward = await Reward.findById(rewardId).lean();

  if (!reward) {
    throw createHttpError('Reward not found.', 404);
  }

  return reward;
}

export async function createReward(payload) {
  try {
    const reward = await Reward.create(payload);
    return reward.toObject();
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError('Reward name already exists.', 409);
    }

    throw error;
  }
}

export async function updateReward(rewardId, payload) {
  ensureValidObjectId(rewardId, 'reward id');

  const reward = await Reward.findByIdAndUpdate(rewardId, pickEditableFields(payload), {
    returnDocument: 'after',
    runValidators: true
  }).lean();

  if (!reward) {
    throw createHttpError('Reward not found.', 404);
  }

  return reward;
}

export async function setRewardActiveStatus(rewardId, isActive) {
  return updateReward(rewardId, { isActive });
}
