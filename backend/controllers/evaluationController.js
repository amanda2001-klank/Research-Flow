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

// Get trend analytics for a group
exports.getEvaluationTrends = async (req, res) => {
    try {
        const { groupId } = req.params;
        const evaluations = await Evaluation.find({ groupId })
            .sort({ evaluatedAt: 1 })
            .populate('documentId', 'title documentType');

        const timeline = [];
        const criteriaMap = new Map();
        const typeMap = new Map();

        evaluations.forEach((evaluation) => {
            const totalMark = Number(evaluation.totalMark || 0);
            const documentTitle = evaluation.documentId?.title || 'Untitled';
            const documentType = evaluation.documentId?.documentType || 'Other';

            timeline.push({
                evaluatedAt: evaluation.evaluatedAt,
                totalMark,
                documentTitle,
                documentType
            });

            const typeEntry = typeMap.get(documentType) || { total: 0, count: 0 };
            typeEntry.total += totalMark;
            typeEntry.count += 1;
            typeMap.set(documentType, typeEntry);

            (evaluation.criteria || []).forEach((criterion) => {
                const name = criterion.name || 'Unnamed Criterion';
                const score = Number(criterion.score || 0);
                const current = criteriaMap.get(name) || {
                    total: 0,
                    count: 0,
                    min: score,
                    max: score,
                    lastScore: score
                };

                current.total += score;
                current.count += 1;
                current.min = Math.min(current.min, score);
                current.max = Math.max(current.max, score);
                current.lastScore = score;

                criteriaMap.set(name, current);
            });
        });

        const evaluationCount = timeline.length;
        const averageTotal = evaluationCount > 0
            ? Math.round((timeline.reduce((sum, t) => sum + t.totalMark, 0) / evaluationCount) * 100) / 100
            : 0;

        const first = timeline[0] || null;
        const last = timeline[evaluationCount - 1] || null;
        const trendDelta = first && last
            ? Math.round((last.totalMark - first.totalMark) * 100) / 100
            : 0;

        const criteria = [...criteriaMap.entries()].map(([name, value]) => ({
            name,
            average: value.count > 0 ? Math.round((value.total / value.count) * 100) / 100 : 0,
            min: Math.round(value.min * 100) / 100,
            max: Math.round(value.max * 100) / 100,
            lastScore: Math.round(value.lastScore * 100) / 100,
            count: value.count
        }));

        const documentTypes = [...typeMap.entries()].map(([documentType, value]) => ({
            documentType,
            average: value.count > 0 ? Math.round((value.total / value.count) * 100) / 100 : 0,
            count: value.count
        }));

        res.json({
            groupId,
            summary: {
                evaluationCount,
                averageTotal,
                firstTotal: first?.totalMark || null,
                lastTotal: last?.totalMark || null,
                trendDelta
            },
            timeline,
            criteria,
            documentTypes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
