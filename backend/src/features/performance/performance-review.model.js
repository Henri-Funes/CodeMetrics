import mongoose from 'mongoose';

const kpiSchema = new mongoose.Schema(
  {
    qualityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    deliveryScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    bugFixRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    collaborationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    innovationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
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
      required: true
    },
    finalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    pointsAwarded: {
      type: Number,
      required: true,
      min: 0
    },
    notes: {
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

performanceReviewSchema.index({ employeeId: 1, periodId: 1 }, { unique: true });
performanceReviewSchema.index({ periodId: 1, finalScore: -1 });

export const PerformanceReview = mongoose.model('PerformanceReview', performanceReviewSchema);
