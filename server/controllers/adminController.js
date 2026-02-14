import User from "../models/User.js";
import Department from "../models/Department.js";
import Criteria from "../models/Criteria.js";
import Evaluation from "../models/Evaluation.js";
import SelfEvaluation from "../models/SelfEvaluation.js";

// ─── DEPARTMENTS ──────────────────────────────────────────

/**
 * @desc    Get all departments
 * @route   GET /api/admin/departments
 */
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate("hodId", "name email");
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create department
 * @route   POST /api/admin/departments
 */
export const createDepartment = async (req, res) => {
  try {
    const { departmentName, hodId } = req.body;
    const existing = await Department.findOne({ departmentName });
    if (existing) {
      return res.status(400).json({ success: false, message: "Department already exists" });
    }
    const department = await Department.create({ departmentName, hodId });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update department
 * @route   PUT /api/admin/departments/:id
 */
export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete department
 * @route   DELETE /api/admin/departments/:id
 */
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    res.status(200).json({ success: true, message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── FACULTY MANAGEMENT ───────────────────────────────────

/**
 * @desc    Get all faculty users
 * @route   GET /api/admin/faculty
 */
export const getAllFaculty = async (req, res) => {
  try {
    const { department, search } = req.query;
    const filter = { role: "faculty" };

    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const faculty = await User.find(filter).select("-password");
    res.status(200).json({ success: true, count: faculty.length, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a faculty user
 * @route   POST /api/admin/faculty
 */
export const createFaculty = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const faculty = await User.create({
      name,
      email,
      password: password || "defaultPass123",
      role: "faculty",
      department,
    });

    // Increment department faculty count
    await Department.findOneAndUpdate(
      { departmentName: department },
      { $inc: { facultyCount: 1 } }
    );

    res.status(201).json({
      success: true,
      data: {
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update faculty user
 * @route   PUT /api/admin/faculty/:id
 */
export const updateFaculty = async (req, res) => {
  try {
    // Prevent password update through this route
    const { password, ...updateData } = req.body;

    const faculty = await User.findOneAndUpdate(
      { _id: req.params.id, role: "faculty" },
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete faculty user
 * @route   DELETE /api/admin/faculty/:id
 */
export const deleteFaculty = async (req, res) => {
  try {
    const faculty = await User.findOneAndDelete({ _id: req.params.id, role: "faculty" });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    // Decrement department faculty count
    await Department.findOneAndUpdate(
      { departmentName: faculty.department },
      { $inc: { facultyCount: -1 } }
    );

    res.status(200).json({ success: true, message: "Faculty deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CRITERIA ─────────────────────────────────────────────

/**
 * @desc    Get all evaluation criteria
 * @route   GET /api/admin/criteria
 */
export const getCriteria = async (req, res) => {
  try {
    const criteria = await Criteria.find();
    res.status(200).json({ success: true, count: criteria.length, data: criteria });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create evaluation criteria
 * @route   POST /api/admin/criteria
 */
export const createCriteria = async (req, res) => {
  try {
    const criteria = await Criteria.create(req.body);
    res.status(201).json({ success: true, data: criteria });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update criteria
 * @route   PUT /api/admin/criteria/:id
 */
export const updateCriteria = async (req, res) => {
  try {
    const criteria = await Criteria.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!criteria) {
      return res.status(404).json({ success: false, message: "Criteria not found" });
    }
    res.status(200).json({ success: true, data: criteria });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete criteria
 * @route   DELETE /api/admin/criteria/:id
 */
export const deleteCriteria = async (req, res) => {
  try {
    const criteria = await Criteria.findByIdAndDelete(req.params.id);
    if (!criteria) {
      return res.status(404).json({ success: false, message: "Criteria not found" });
    }
    res.status(200).json({ success: true, message: "Criteria deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── EVALUATOR ASSIGNMENT ─────────────────────────────────

/**
 * @desc    Assign evaluator to faculty
 * @route   POST /api/admin/assign-evaluator
 */
export const assignEvaluator = async (req, res) => {
  try {
    const { facultyId, evaluatorId, academicYear } = req.body;

    // Validate faculty exists
    const faculty = await User.findOne({ _id: facultyId, role: "faculty" });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    // Validate evaluator exists
    const evaluator = await User.findOne({ _id: evaluatorId, role: "evaluator" });
    if (!evaluator) {
      return res.status(404).json({ success: false, message: "Evaluator not found" });
    }

    // Check if assignment already exists
    const existing = await Evaluation.findOne({ facultyId, evaluatorId, academicYear });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This evaluator is already assigned to this faculty for this academic year",
      });
    }

    const evaluation = await Evaluation.create({
      facultyId,
      evaluatorId,
      academicYear,
      status: "pending",
    });

    res.status(201).json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REPORTS ──────────────────────────────────────────────

/**
 * @desc    Get all evaluations (reports view)
 * @route   GET /api/admin/reports
 */
export const getReports = async (req, res) => {
  try {
    const { academicYear, department, status } = req.query;
    const filter = {};

    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    let evaluations = await Evaluation.find(filter)
      .populate("facultyId", "name email department")
      .populate("evaluatorId", "name email");

    // Filter by department if specified (post-populate)
    if (department) {
      evaluations = evaluations.filter(
        (e) => e.facultyId && e.facultyId.department === department
      );
    }

    // Calculate department-wise statistics
    const departmentStats = {};
    evaluations.forEach((evaluation) => {
      if (evaluation.facultyId) {
        const dept = evaluation.facultyId.department;
        if (!departmentStats[dept]) {
          departmentStats[dept] = { totalScore: 0, count: 0, evaluated: 0 };
        }
        if (evaluation.status === "evaluated" && evaluation.finalScore > 0) {
          departmentStats[dept].totalScore += evaluation.finalScore;
          departmentStats[dept].evaluated += 1;
        }
        departmentStats[dept].count += 1;
      }
    });

    const stats = Object.entries(departmentStats).map(([dept, data]) => ({
      department: dept,
      avgScore: data.evaluated > 0 ? Math.round(data.totalScore / data.evaluated) : 0,
      total: data.count,
      evaluated: data.evaluated,
    }));

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations,
      departmentStats: stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all evaluators
 * @route   GET /api/admin/evaluators
 */
export const getAllEvaluators = async (req, res) => {
  try {
    const evaluators = await User.find({ role: "evaluator" }).select("-password");
    res.status(200).json({ success: true, count: evaluators.length, data: evaluators });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
