import mongoose from 'mongoose';

import {
  DEFAULT_EMPLOYEE_POINT_BALANCE,
  EMPLOYEE_ROLE_VALUES,
  EMPLOYEE_ROLES
} from './employee.constants.js';

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 160
    },
    role: {
      type: String,
      enum: EMPLOYEE_ROLE_VALUES,
      default: EMPLOYEE_ROLES.EMPLOYEE,
      required: true
    },
    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    pointBalance: {
      type: Number,
      default: DEFAULT_EMPLOYEE_POINT_BALANCE,
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

employeeSchema.index({ role: 1, isActive: 1 });
employeeSchema.index({ name: 'text', email: 'text', department: 'text', position: 'text' });

export const Employee = mongoose.model('Employee', employeeSchema);
