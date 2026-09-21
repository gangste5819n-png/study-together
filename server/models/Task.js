import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task owner is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    category: {
      type: String,
      enum: ['CDS', 'MBBS', 'General', 'Revision', 'Mock Exam', 'Wellness'],
      default: 'CDS',
    },
    subject: {
      type: String,
      default: 'General',
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    estimatedMinutes: {
      type: Number,
      default: 45,
      min: [0, 'Estimated minutes cannot be negative'],
    },
    dueDate: {
      type: String,
      default: null,
    },
    mandatory: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['study', 'wellness'],
      default: 'study',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user queries and scheduler checks
taskSchema.index({ owner: 1, completed: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });

export const Task = mongoose.model('Task', taskSchema);

