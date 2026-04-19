const mongoose = require('mongoose');

const milestoneRuleSchema = new mongoose.Schema({
    key: { type: String, required: true },
    title: { type: String, required: true },
    documentType: {
        type: String,
        enum: ['Proposal', 'Progress Report', 'Final Report', 'Presentation', 'Other'],
        required: true
    },
    required: { type: Boolean, default: true },
    dueDate: { type: Date, default: null },
    allowedExtensions: {
        type: [String],
        default: ['pdf', 'doc', 'docx', 'ppt', 'pptx']
    },
    maxSizeMb: { type: Number, default: 50, min: 1 },
    minDescriptionLength: { type: Number, default: 0, min: 0 },
    requiresVersionNotes: { type: Boolean, default: false },
    enforceDeadline: { type: Boolean, default: false },
    notes: { type: String, default: '' }
}, { _id: false });

const documentRuleSchema = new mongoose.Schema({
    groupId: { type: String, required: true, unique: true },
    milestones: { type: [milestoneRuleSchema], default: [] },
    updatedBy: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('DocumentRule', documentRuleSchema);
