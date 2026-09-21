import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    taskReminders: {
      type: Boolean,
      default: true,
    },
    taskOverdue: {
      type: Boolean,
      default: true,
    },
    partnerActivity: {
      type: Boolean,
      default: true,
    },
    studySession: {
      type: Boolean,
      default: true,
    },
    pactReminders: {
      type: Boolean,
      default: true,
    },
    wellnessReminders: {
      type: Boolean,
      default: true,
    },
    dareNotifications: {
      type: Boolean,
      default: true,
    },
    streakReminders: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationPreference = mongoose.model(
  'NotificationPreference',
  notificationPreferenceSchema
);
