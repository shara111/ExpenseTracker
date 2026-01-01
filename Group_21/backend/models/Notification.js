import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: ["budget_alert", "income_alert"],
      index: true,
    },
    data: {
      title: { type: String, required: true },
      message: { type: String, required: true },
      amount: { type: Number, default: null },
      timeAgo: { type: String },
    },
    readAt: { type: Date, default: null },
    category: { type: String },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

NotificationSchema.index({ user: 1, readAt: 1 });

export default mongoose.model("Notification", NotificationSchema);
