import mongoose, { Schema } from 'mongoose';

export interface INotificationDocument {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  linkTab?: string;
  linkId?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      default: 'SYSTEM',
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    linkTab: String,
    linkId: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ createdAt: -1 });

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);
