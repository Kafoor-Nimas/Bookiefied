import { IVoiceSession } from "@/type";
import { Schema, model, models } from "mongoose";

const VoiceSessionSchema = new Schema<IVoiceSession>(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
      required: true,
      default: 0,
    },
    billingPeriodStart: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Useful for billing/usage queries: sessions per user within a billing period
VoiceSessionSchema.index({ clerkId: 1, billingPeriodStart: 1 });

export const VoiceSession =
  models.VoiceSession ||
  model<IVoiceSession>("VoiceSession", VoiceSessionSchema);

export default VoiceSession;
