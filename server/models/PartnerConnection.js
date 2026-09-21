import mongoose from 'mongoose';

const partnerConnectionSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'First user is required for partner connection'],
      index: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'paused', 'disconnected'],
      default: 'pending',
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    activeSession: {
      status: {
        type: String,
        enum: ['idle', 'active', 'paused', 'ended'],
        default: 'idle',
      },
      mode: {
        type: String,
        enum: ['focus', 'break'],
        default: 'focus',
      },
      durationMins: {
        type: Number,
        default: 50,
      },
      startedAt: {
        type: Date,
        default: null,
      },
      pausedAt: {
        type: Date,
        default: null,
      },
      elapsedSeconds: {
        type: Number,
        default: 0,
      },
      ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      ownerName: {
        type: String,
        default: '',
      },
      subject: {
        type: String,
        default: 'General Focus Target',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Helper to check if a user is part of this connection
partnerConnectionSchema.methods.hasUser = function (userId) {
  const uid = userId.toString();
  return (
    (this.user1 && this.user1.toString() === uid) ||
    (this.user2 && this.user2.toString() === uid)
  );
};

// Helper to get partner ID given current user ID
partnerConnectionSchema.methods.getPartnerId = function (myUserId) {
  const uid = myUserId.toString();
  if (this.user1 && this.user1.toString() === uid) {
    return this.user2;
  }
  if (this.user2 && this.user2.toString() === uid) {
    return this.user1;
  }
  return null;
};

export const PartnerConnection = mongoose.model('PartnerConnection', partnerConnectionSchema);
