import mongoose from "mongoose";

const FinanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      unique: true,
      sparse: true,
    },
    years: [{ type: mongoose.Schema.Types.ObjectId, ref: "Year" }],
  },
  { timestamps: true },
);

export default mongoose.model("Finance", FinanceSchema);
