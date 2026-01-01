import mongoose from "mongoose";

const MonthSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true, min: 0, max: 11 },
    incomes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Income" }],
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
  },
  { timestamps: true },
);
export default mongoose.model("Month", MonthSchema);
