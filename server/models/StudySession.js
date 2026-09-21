import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema(
  {
    partnerConnectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PartnerConnection',
      required: [true, 'Partner connection ID is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    userName: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      enum: ['focus', 'break'],
      default: 'focus',
    },
    durationMins: {
      type: Number,
      default: 50,
      min: 0,
    },
    completedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    elapsedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    subject: {
      type: String,
      default: 'General Focus Target',
      trim: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast date-range queries per partner connection and user
studySessionSchema.index({ partnerConnectionId: 1, createdAt: -1 });
studySessionSchema.index({ user: 1, createdAt: -1 });

export const StudySession = mongoose.model('StudySession', studySessionSchema);
