const mongoose = require('mongoose');

const rubricCriterionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    weight: { type: Number, required: true },   // percentage weight (e.g. 20 means 20%)
    score: { type: Number, required: true, min: 0, max: 100 }, // score out of 100
    feedback: { type: String, default: '' }
});

const evaluationSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    groupId: { type: String, required: true },
    evaluatorId: { type: String, required: true },    // username of the supervisor
    evaluatorName: { type: String, default: '' },
    criteria: [rubricCriterionSchema],
    totalMark: { type: Number, default: 0 },          // auto-calculated weighted total
    generalFeedback: { type: String, default: '' },
    individualMarks: [{
        studentName: { type: String },
        studentId: { type: String },
        contribution: { type: Number, min: 0, max: 100, default: 100 },
        individualMark: { type: Number, default: 0 }
    }],
    evaluatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
