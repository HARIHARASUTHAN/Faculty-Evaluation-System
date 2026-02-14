import mongoose from "mongoose";

const criteriaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Criteria title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    weightage: {
      type: Number,
      required: [true, "Weightage is required"],
      min: [0, "Weightage cannot be negative"],
      max: [100, "Weightage cannot exceed 100"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Teaching", "Research", "Academic", "General"],
    },
  },
  { timestamps: true }
);

const Criteria = mongoose.model("Criteria", criteriaSchema);
export default Criteria;
