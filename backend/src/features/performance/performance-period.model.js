import mongoose from 'mongoose';

import {
  PERFORMANCE_PERIOD_STATUS,
  PERFORMANCE_PERIOD_STATUS_VALUES
} from './performance.constants.js';

const performancePeriodSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
      max: 2100
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: PERFORMANCE_PERIOD_STATUS_VALUES,
      default: PERFORMANCE_PERIOD_STATUS.DRAFT,
      required: true
    },
    calculatedAt: {
      type: Date,
      default: null
    },
    closedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

performancePeriodSchema.index({ year: 1, month: 1 }, { unique: true });
performancePeriodSchema.index({ status: 1, year: -1, month: -1 });

export const PerformancePeriod = mongoose.model('PerformancePeriod', performancePeriodSchema);
