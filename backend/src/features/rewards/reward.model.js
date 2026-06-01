import mongoose from 'mongoose';

import { REWARD_CATEGORIES, REWARD_CATEGORY_VALUES } from './reward.constants.js';

const rewardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600
    },
    category: {
      type: String,
      enum: REWARD_CATEGORY_VALUES,
      default: REWARD_CATEGORIES.LICENSES,
      required: true
    },
    costInPoints: {
      type: Number,
      required: true,
      min: 1
    },
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

rewardSchema.index({ category: 1, isActive: 1 });
rewardSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Reward = mongoose.model('Reward', rewardSchema);
