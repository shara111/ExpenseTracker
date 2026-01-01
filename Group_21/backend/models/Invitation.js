import mongoose from "mongoose";

const InvitationSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    inviter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteeEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "canceled"],
      default: "pending",
    },
    message: { type: String },
    respondedAt: { type: Date },
  },
  { timestamps: true },
);

InvitationSchema.index({ invitee: 1, status: 1 });
InvitationSchema.index({ account: 1, status: 1 });

export default mongoose.model("Invitation", InvitationSchema);
