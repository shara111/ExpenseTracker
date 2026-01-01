import mongoose from "mongoose";

const YearSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    months: [{ type: mongoose.Schema.Types.ObjectId, ref: "Month" }],
  },
  { timestamps: true },
);

export default mongoose.model("Year", YearSchema);
