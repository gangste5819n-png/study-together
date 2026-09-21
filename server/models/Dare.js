import mongoose from 'mongoose';

const dareSchema = new mongoose.Schema(
  {
    partnerConnectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PartnerConnection',
      required: true,
      index: true,
    },
    pactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TomorrowPact',
      default: null,
    },
    commitmentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUserName: {
      type: String,
      default: '',
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposedByName: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: [true, 'Dare title is required'],
      trim: true,
    },
    instruction: {
      type: String,
      default: '',
      trim: true,
    },
    reason: {
      type: String,
      default: 'Missed commitment dare',
      trim: true,
    },
    categoryTag: {
      type: String,
      default: 'Silly',
    },
    status: {
      type: String,
      enum: ['proposed', 'accepted', 'skipped', 'completed'],
      default: 'proposed',
      index: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Dare = mongoose.model('Dare', dareSchema);
