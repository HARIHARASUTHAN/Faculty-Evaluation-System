import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAssignedFaculty,
  getSubmissions,
  submitScores,
  finalizeEvaluation,
} from "../controllers/evaluatorController.js";

const router = Router();

// All evaluator routes are protected and require evaluator role
router.use(protect, authorize("evaluator"));

// ─── Assigned Faculty ─────────────────
router.get("/assigned-faculty", getAssignedFaculty);

// ─── Review Submissions ───────────────
router.get("/submissions/:facultyId", getSubmissions);

// ─── Scoring & Finalization ───────────
router.put("/evaluate/:evaluationId", submitScores);
router.put("/finalize/:evaluationId", finalizeEvaluation);

export default router;
