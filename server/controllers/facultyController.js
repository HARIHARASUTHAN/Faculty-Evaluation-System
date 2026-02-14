import SelfEvaluation from "../models/SelfEvaluation.js";
import Evaluation from "../models/Evaluation.js";
import Criteria from "../models/Criteria.js";

/**
 * @desc    Submit self-evaluation
 * @route   POST /api/faculty/self-evaluation
 * @access  Faculty
 */
export const submitSelfEvaluation = async (req, res) => {
  try {
    const { academicYear, answers } = req.body;

    // Check if already submitted for this year
    const existing = await SelfEvaluation.findOne({
      facultyId: req.user._id,
      academicYear,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Self-evaluation already submitted for this academic year",
      });
    }

    const selfEvaluation = await SelfEvaluation.create({
      facultyId: req.user._id,
      academicYear,
      answers,
      status: "submitted",
    });

    res.status(201).json({ success: true, data: selfEvaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Upload supporting documents
 * @route   POST /api/faculty/upload-documents/:selfEvaluationId
 * @access  Faculty
 */
export const uploadDocuments = async (req, res) => {
  try {
    const selfEvaluation = await SelfEvaluation.findOne({
      _id: req.params.selfEvaluationId,
      facultyId: req.user._id,
    });

    if (!selfEvaluation) {
      return res.status(404).json({
        success: false,
        message: "Self-evaluation not found",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const documents = req.files.map((file) => ({
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
    }));

    selfEvaluation.documents.push(...documents);
    await selfEvaluation.save();

    res.status(200).json({
      success: true,
      message: `${documents.length} document(s) uploaded successfully`,
      data: selfEvaluation.documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get evaluation status for current faculty
 * @route   GET /api/faculty/evaluation-status
 * @access  Faculty
 */
export const getEvaluationStatus = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = { facultyId: req.user._id };
    if (academicYear) filter.academicYear = academicYear;

    // Get self-evaluation status
    const selfEvaluation = await SelfEvaluation.findOne(filter);

    // Get evaluator evaluation status
    const evaluation = await Evaluation.findOne(filter)
      .populate("evaluatorId", "name email");

    res.status(200).json({
      success: true,
      data: {
        selfEvaluation: selfEvaluation
          ? {
              status: selfEvaluation.status,
              submittedAt: selfEvaluation.createdAt,
              documentsCount: selfEvaluation.documents.length,
            }
          : null,
        evaluation: evaluation
          ? {
              status: evaluation.status,
              evaluator: evaluation.evaluatorId,
              finalScore: evaluation.finalScore,
              submittedAt: evaluation.submittedAt,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get feedback & scores for current faculty
 * @route   GET /api/faculty/feedback
 * @access  Faculty
 */
export const getFeedback = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({
      facultyId: req.user._id,
      status: "evaluated",
    }).populate("evaluatorId", "name email");

    const criteria = await Criteria.find();

    // Enrich evaluation scores with criteria names
    const enrichedEvaluations = evaluations.map((evaluation) => {
      const scoresWithNames = {};
      for (const [criteriaId, score] of evaluation.scores.entries()) {
        const criterion = criteria.find((c) => c._id.toString() === criteriaId);
        scoresWithNames[criterion ? criterion.title : criteriaId] = score;
      }
      return {
        _id: evaluation._id,
        evaluator: evaluation.evaluatorId,
        academicYear: evaluation.academicYear,
        scores: scoresWithNames,
        finalScore: evaluation.finalScore,
        comments: evaluation.comments,
        submittedAt: evaluation.submittedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedEvaluations.length,
      data: enrichedEvaluations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all self-evaluations for current faculty
 * @route   GET /api/faculty/self-evaluations
 * @access  Faculty
 */
export const getMySelfEvaluations = async (req, res) => {
  try {
    const selfEvaluations = await SelfEvaluation.find({
      facultyId: req.user._id,
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
