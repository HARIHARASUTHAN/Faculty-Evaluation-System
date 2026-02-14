import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getCriteria,
  createCriteria,
  updateCriteria,
  deleteCriteria,
  assignEvaluator,
  getReports,
  getAllEvaluators,
} from "../controllers/adminController.js";

const router = Router();

// All admin routes are protected and require admin role
router.use(protect, authorize("admin"));

// ─── Departments ──────────────────────
router.route("/departments").get(getDepartments).post(createDepartment);
router.route("/departments/:id").put(updateDepartment).delete(deleteDepartment);

// ─── Faculty ──────────────────────────
router.route("/faculty").get(getAllFaculty).post(createFaculty);
router.route("/faculty/:id").put(updateFaculty).delete(deleteFaculty);

// ─── Criteria ─────────────────────────
router.route("/criteria").get(getCriteria).post(createCriteria);
router.route("/criteria/:id").put(updateCriteria).delete(deleteCriteria);

// ─── Evaluators ───────────────────────
router.get("/evaluators", getAllEvaluators);

// ─── Assignment ───────────────────────
router.post("/assign-evaluator", assignEvaluator);

// ─── Reports ──────────────────────────
router.get("/reports", getReports);

export default router;
