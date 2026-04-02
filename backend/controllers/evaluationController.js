const Evaluation = require('../models/Evaluation');
const Document = require('../models/Document');
const GroupMember = require('../models/GroupMember');

// Submit an evaluation for a document
exports.submitEvaluation = async (req, res) => {
    try {
        const { documentId, groupId, evaluatorId, evaluatorName, criteria, generalFeedback, individualMarks } = req.body;

        // Calculate total mark from weighted criteria
        let totalMark = 0;
        if (criteria && criteria.length > 0) {
            criteria.forEach(c => {
                totalMark += (c.score * c.weight) / 100;
            });
        }
        totalMark = Math.round(totalMark * 100) / 100;

        // Calculate individual marks based on contribution
        let computedIndividualMarks = [];
        if (individualMarks && individualMarks.length > 0) {
            computedIndividualMarks = individualMarks.map(im => ({
                ...im,
                individualMark: Math.round((totalMark * im.contribution / 100) * 100) / 100
            }));
        }

        // Check if evaluation already exists for this document
        let evaluation = await Evaluation.findOne({ documentId });

        if (evaluation) {
            // Update existing evaluation
            evaluation.criteria = criteria;
            evaluation.totalMark = totalMark;
            evaluation.generalFeedback = generalFeedback;
            evaluation.individualMarks = computedIndividualMarks;
            evaluation.evaluatorId = evaluatorId;
            evaluation.evaluatorName = evaluatorName;
            evaluation.evaluatedAt = new Date();
            await evaluation.save();
        } else {
            evaluation = new Evaluation({
                documentId,
                groupId,
                evaluatorId,
                evaluatorName,
                criteria,
                totalMark,
                generalFeedback,
                individualMarks: computedIndividualMarks,
                evaluatedAt: new Date()
            });
            await evaluation.save();
        }

        // Update document status to Evaluated
        await Document.findByIdAndUpdate(documentId, { status: 'Evaluated' });

        res.status(201).json(evaluation);
    } catch (err) {
        console.error('Submit evaluation error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Get evaluation for a specific document
exports.getEvaluationByDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const evaluation = await Evaluation.findOne({ documentId });
        if (!evaluation) return res.status(404).json({ error: 'No evaluation found' });
        res.json(evaluation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all evaluations for a group
exports.getEvaluationsByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const evaluations = await Evaluation.find({ groupId }).populate('documentId');
        res.json(evaluations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all evaluations (for supervisor)
exports.getAllEvaluations = async (req, res) => {
    try {
        const evaluations = await Evaluation.find().populate('documentId');
        res.json(evaluations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Generate evaluation summary data
exports.getEvaluationSummary = async (req, res) => {
    try {
        const { documentId } = req.params;
        const evaluation = await Evaluation.findOne({ documentId }).populate('documentId');
        if (!evaluation) return res.status(404).json({ error: 'No evaluation found' });

        const doc = await Document.findById(documentId);
        const members = await GroupMember.find({ groupId: evaluation.groupId });

        const summary = {
            documentTitle: doc?.title || 'Unknown',
            documentType: doc?.documentType || 'Unknown',
            groupId: evaluation.groupId,
            evaluator: evaluation.evaluatorName || evaluation.evaluatorId,
            evaluatedAt: evaluation.evaluatedAt,
            criteria: evaluation.criteria,
            totalMark: evaluation.totalMark,
            generalFeedback: evaluation.generalFeedback,
            individualMarks: evaluation.individualMarks,
            groupMembers: members.map(m => ({ studentName: m.studentName, studentId: m.studentId }))
        };

        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
