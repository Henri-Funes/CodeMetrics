import mongoose from 'mongoose';

import {
  PERFORMANCE_REVIEW_STATUS,
  PERFORMANCE_REVIEW_STATUS_VALUES
} from './performance.constants.js';

const kpiSchema = new mongoose.Schema(
  {
    qualityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    deliveryScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    bugFixRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    collaborationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    innovationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    _id: false
  }
);

const selfEvaluationSchema = new mongoose.Schema(
  {
    technicalAchievements: {
      type: String,
      trim: true,
      maxlength: 800,
      default: ''
    },
    blockers: {
      type: String,
      trim: true,
      maxlength: 800,
      default: ''
    },
    collaborationNotes: {
      type: String,
      trim: true,
      maxlength: 800,
      default: ''
    },
    learningNotes: {
      type: String,
      trim: true,
      maxlength: 800,
      default: ''
    },
    selfScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    submittedAt: {
      type: Date,
      default: null
    }
  },
  {
    _id: false
  }
);

const supervisorEvaluationSchema = new mongoose.Schema(
  {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    deliveryScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    bugFixRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    collaborationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    innovationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    comments: {
      type: String,
      trim: true,
      maxlength: 800,
      default: ''
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    _id: false
  }
);

const performanceReviewSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    periodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PerformancePeriod',
      required: true
    },
    kpis: {
      type: kpiSchema,
      default: () => ({})
    },
    finalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    pointsAwarded: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: PERFORMANCE_REVIEW_STATUS_VALUES,
      default: PERFORMANCE_REVIEW_STATUS.DRAFT,
      required: true
    },
    selfEvaluation: {
      type: selfEvaluationSchema,
      default: () => ({})
    },
    supervisorEvaluation: {
      type: supervisorEvaluationSchema,
      default: () => ({})
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    finalizedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

performanceReviewSchema.index({ employeeId: 1, periodId: 1 }, { unique: true });
performanceReviewSchema.index({ periodId: 1, finalScore: -1 });
performanceReviewSchema.index({ status: 1, periodId: 1, updatedAt: -1 });

export const PerformanceReview = mongoose.model('PerformanceReview', performanceReviewSchema);
