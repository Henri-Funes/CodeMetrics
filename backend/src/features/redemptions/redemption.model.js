import mongoose from 'mongoose';

import { REDEMPTION_STATUS, REDEMPTION_STATUS_VALUES } from './redemption.constants.js';

const rewardSnapshotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    costInPoints: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const redemptionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      required: true
    },
    rewardSnapshot: {
      type: rewardSnapshotSchema,
      required: true
    },
    pointsSpent: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: REDEMPTION_STATUS_VALUES,
      default: REDEMPTION_STATUS.PENDING,
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    requestNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    decisionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

redemptionSchema.index({ employeeId: 1, requestedAt: -1 });
redemptionSchema.index({ status: 1, requestedAt: -1 });
redemptionSchema.index({ rewardId: 1, status: 1 });

export const Redemption = mongoose.model('Redemption', redemptionSchema);
