import Evaluation from "../models/Evaluation.js";
import SelfEvaluation from "../models/SelfEvaluation.js";
import Criteria from "../models/Criteria.js";

/**
 * @desc    Get faculty assigned to current evaluator
 * @route   GET /api/evaluator/assigned-faculty
 * @access  Evaluator
 */
export const getAssignedFaculty = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = { evaluatorId: req.user._id };
    if (academicYear) filter.academicYear = academicYear;

    const evaluations = await Evaluation.find(filter)
      .populate("facultyId", "name email department")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get self-evaluation submissions for review
 * @route   GET /api/evaluator/submissions/:facultyId
 * @access  Evaluator
 */
export const getSubmissions = async (req, res) => {
  try {
    // Verify evaluator is assigned to this faculty
    const assignment = await Evaluation.findOne({
      evaluatorId: req.user._id,
      facultyId: req.params.facultyId,
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to evaluate this faculty member",
      });
    }

    const selfEvaluations = await SelfEvaluation.find({
      facultyId: req.params.facultyId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: selfEvaluations.length,
      data: selfEvaluations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Submit scores and comments for a faculty
 * @route   PUT /api/evaluator/evaluate/:evaluationId
 * @access  Evaluator
 */
export const submitScores = async (req, res) => {
  try {
    const { scores, comments } = req.body;

    const evaluation = await Evaluation.findOne({
      _id: req.params.evaluationId,
      evaluatorId: req.user._id,
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found or you are not the assigned evaluator",
      });
    }

    if (evaluation.status === "evaluated") {
      return res.status(400).json({
        success: false,
        message: "This evaluation has already been finalized",
      });
    }

    // Calculate weighted final score
    const criteria = await Criteria.find();
    let totalWeightedScore = 0;
    let totalWeightage = 0;

    for (const [criteriaId, score] of Object.entries(scores)) {
      const criterion = criteria.find((c) => c._id.toString() === criteriaId);
      if (criterion) {
        totalWeightedScore += (score * criterion.weightage) / 100;
        totalWeightage += criterion.weightage;
      }
    }

    const finalScore =
      totalWeightage > 0
        ? Math.round((totalWeightedScore / totalWeightage) * 100)
        : 0;

    evaluation.scores = scores;
    evaluation.comments = comments || "";
    evaluation.finalScore = finalScore;
    evaluation.status = "under-review";
    await evaluation.save();

    // Update self-evaluation status
    await SelfEvaluation.findOneAndUpdate(
      { facultyId: evaluation.facultyId, academicYear: evaluation.academicYear },
      { status: "under_review" }
    );

    res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Finalize evaluation
 * @route   PUT /api/evaluator/finalize/:evaluationId
 * @access  Evaluator
 */
export const finalizeEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({
      _id: req.params.evaluationId,
      evaluatorId: req.user._id,
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found or you are not the assigned evaluator",
      });
    }

    if (evaluation.status === "evaluated") {
      return res.status(400).json({
        success: false,
        message: "This evaluation is already finalized",
      });
    }

    if (!evaluation.scores || evaluation.scores.size === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot finalize evaluation without scores",
      });
    }

    evaluation.status = "evaluated";
    evaluation.submittedAt = new Date();
    await evaluation.save();

    // Update self-evaluation status
    await SelfEvaluation.findOneAndUpdate(
      { facultyId: evaluation.facultyId, academicYear: evaluation.academicYear },
      { status: "evaluated" }
    );

    res.status(200).json({
      success: true,
      message: "Evaluation finalized successfully",
      data: evaluation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
