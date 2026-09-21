import mongoose from 'mongoose';

const commitmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Commitment title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: ['CDS', 'MBBS', 'Revision', 'Practice', 'Wellness', 'Personal', 'Other'],
      default: 'CDS',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy ID is required'],
    },
    estimatedMinutes: {
      type: Number,
      default: 45,
      min: [0, 'Estimated minutes cannot be negative'],
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    mandatory: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'missed'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
      default: null,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
  },
  { _id: true, timestamps: true }
);

const confirmationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      default: '',
    },
    confirmedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const tomorrowPactSchema = new mongoose.Schema(
  {
    partnerConnectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PartnerConnection',
      required: [true, 'PartnerConnection ID is required'],
      index: true,
    },
    date: {
      type: String, // Target calendar date 'YYYY-MM-DD'
      required: [true, 'Date is required for pact'],
      index: true,
    },
    commitments: [commitmentSchema],
    confirmations: [confirmationSchema],
    status: {
      type: String,
      enum: ['draft', 'locked', 'active', 'completed'],
      default: 'draft',
      index: true,
    },
    finalizedAt: {
      type: Date,
      default: null,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Unique index to ensure one pact per partner connection per calendar date
tomorrowPactSchema.index({ partnerConnectionId: 1, date: 1 }, { unique: true });

export const TomorrowPact = mongoose.model('TomorrowPact', tomorrowPactSchema);
