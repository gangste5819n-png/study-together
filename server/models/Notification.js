import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = [
  'TASK_REMINDER',
  'TASK_DUE',
  'TASK_COMPLETED',
  'PARTNER_CHECKIN',
  'PARTNER_TASK_COMPLETED',
  'STUDY_SESSION',
  'PACT_REMINDER',
  'PACT_LOCKED',
  'PACT_ACTIVE',
  'PACT_MISSED',
  'WELLNESS_REMINDER',
  'DARE_RECEIVED',
  'STREAK_REMINDER',
  'SYSTEM',
];

export const NOTIFICATION_CATEGORIES = [
  'task',
  'study',
  'wellness',
  'pact',
  'partner',
  'dare',
  'system',
];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    partnerConnectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PartnerConnection',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: NOTIFICATION_CATEGORIES,
      default: 'system',
    },
    relatedEntityId: {
      type: String,
      default: null,
    },
    relatedEntityType: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-speed queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ partnerConnectionId: 1, createdAt: -1 });
notificationSchema.index({ 'metadata.dedupeKey': 1 });

// Optional TTL index for auto-expiring temporary notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Notification = mongoose.model('Notification', notificationSchema);
