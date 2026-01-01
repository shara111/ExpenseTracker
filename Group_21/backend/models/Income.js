import mongoose from "mongoose";

const IncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    icon: { type: String },
    source: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
    // Recurring support
    recurring: { type: String },
    endDate: { type: mongoose.Schema.Types.Mixed, required: false },
    head: { type: Boolean, default: true },
    // Shared accounts
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
export default mongoose.model("Income", IncomeSchema);
