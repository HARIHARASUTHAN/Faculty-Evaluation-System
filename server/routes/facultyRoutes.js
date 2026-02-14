import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  submitSelfEvaluation,
  uploadDocuments,
  getEvaluationStatus,
  getFeedback,
  getMySelfEvaluations,
} from "../controllers/facultyController.js";

const router = Router();

// All faculty routes are protected and require faculty role
router.use(protect, authorize("faculty"));

// ─── Self Evaluation ──────────────────
router.post("/self-evaluation", submitSelfEvaluation);
router.get("/self-evaluations", getMySelfEvaluations);

// ─── Document Upload ──────────────────
router.post(
  "/upload-documents/:selfEvaluationId",
  upload.array("documents", 10),
  uploadDocuments
);

// ─── Status & Feedback ────────────────
router.get("/evaluation-status", getEvaluationStatus);
router.get("/feedback", getFeedback);

export default router;
