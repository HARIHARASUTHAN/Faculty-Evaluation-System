import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Faculty ID is required"],
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Evaluator ID is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    scores: {
      type: Map,
      of: Number,
      default: {},
    },
    comments: {
      type: String,
      default: "",
    },
    finalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "under-review", "evaluated"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Ensure one evaluation per faculty per evaluator per academic year
evaluationSchema.index(
  { facultyId: 1, evaluatorId: 1, academicYear: 1 },
  { unique: true }
);

const Evaluation = mongoose.model("Evaluation", evaluationSchema);
export default Evaluation;
