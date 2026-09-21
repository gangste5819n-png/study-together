import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required for check-in'],
      index: true,
    },
    partnerConnection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PartnerConnection',
      default: null,
      index: true,
    },
    mood: {
      type: String,
      enum: ['ready', 'good', 'neutral', 'tired', 'stressed', 'great', 'unfocused'],
      default: 'ready',
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    reaction: {
      type: String,
      default: '✨',
      trim: true,
    },
    statusMessage: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
  },
  {
    timestamps: true,
  }
);

checkInSchema.index({ user: 1, createdAt: -1 });

export const CheckIn = mongoose.model('CheckIn', checkInSchema);

