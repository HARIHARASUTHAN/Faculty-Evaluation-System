import mongoose from "mongoose";

const selfEvaluationSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Faculty ID is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    documents: [
      {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["submitted", "under_review", "evaluated"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

// Ensure one self-evaluation per faculty per academic year
selfEvaluationSchema.index({ facultyId: 1, academicYear: 1 }, { unique: true });

const SelfEvaluation = mongoose.model("SelfEvaluation", selfEvaluationSchema);
export default SelfEvaluation;
