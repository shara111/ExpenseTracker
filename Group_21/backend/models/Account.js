import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["personal", "shared"], required: true },
    name: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

AccountSchema.index({ owner: 1, type: 1 });
AccountSchema.index({ members: 1 });

export default mongoose.model("Account", AccountSchema);
