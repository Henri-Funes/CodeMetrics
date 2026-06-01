import mongoose from 'mongoose';

import {
  MERIT_TRANSACTION_SOURCE_TYPE_VALUES,
  MERIT_TRANSACTION_TYPES,
  MERIT_TRANSACTION_TYPE_VALUES
} from './wallet.constants.js';

const meritTransactionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    type: {
      type: String,
      enum: MERIT_TRANSACTION_TYPE_VALUES,
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    balanceBefore: {
      type: Number,
      required: true,
      min: 0
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280
    },
    sourceType: {
      type: String,
      enum: MERIT_TRANSACTION_SOURCE_TYPE_VALUES,
      required: true
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

meritTransactionSchema.index({ employeeId: 1, createdAt: -1 });
meritTransactionSchema.index({ type: 1, createdAt: -1 });
meritTransactionSchema.index(
  { sourceType: 1, sourceId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sourceId: { $type: 'objectId' },
      type: MERIT_TRANSACTION_TYPES.PERFORMANCE_BONUS
    }
  }
);

export const MeritTransaction = mongoose.model('MeritTransaction', meritTransactionSchema);
