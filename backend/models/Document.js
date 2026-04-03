const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema({
    versionNumber: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    uploadedBy: { type: String, required: true }, // username
    uploadedAt: { type: Date, default: Date.now },
    comments: { type: String, default: '' }
});

const feedbackActionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: {
        type: String,
        enum: ['open', 'resolved'],
        default: 'open'
    },
    resolutionNote: { type: String, default: '' },
    resolvedBy: { type: String, default: '' },
    resolvedAt: { type: Date, default: null }
}, { timestamps: true });

const documentSchema = new mongoose.Schema({
    groupId: { type: String, required: true },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Supervisor who has access
    title: { type: String, required: true },
    documentType: {
        type: String,
        enum: ['Proposal', 'Progress Report', 'Final Report', 'Presentation', 'Other'],
        required: true
    },
    description: { type: String, default: '' },
    versions: [documentVersionSchema],
    currentVersion: { type: Number, default: 1 },
    uploadedBy: { type: String, required: true }, // username of original uploader
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Evaluated', 'Revision Requested'],
        default: 'Pending'
    },
    revisionRequestNote: { type: String, default: '' },
    revisionRequestedBy: { type: String, default: '' },
    revisionRequestedAt: { type: Date, default: null },
    feedbackActions: [feedbackActionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
