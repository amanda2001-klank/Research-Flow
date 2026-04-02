const mongoose = require('mongoose');

/**
 * MemberReport Model
 * Individual progress report for one group member within a fortnight cycle.
 * Each FortnightCycle must contain exactly 4 MemberReports (one per member).
 *
 * Status flow:
 *   draft → submitted → approved
 *                    ↘ needs_resubmission → submitted → approved
 */
const memberReportSchema = new mongoose.Schema({
    cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FortnightCycle', required: true },
    groupMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupMember', required: true },

    // Auto-filled from GroupMember when creating the report
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },

    // Core research progress fields
    researchDescription: { type: String, default: '' },  // What research work was done this fortnight
    timeSpent: { type: Number, default: 0 },             // Total hours spent on research

    // Evidence of work: GitHub links, Google Drive, documents, etc.
    evidenceLinks: [{ type: String }],

    // Optional file/document attachment (stored as a URL path)
    fileAttachment: { type: String, default: '' },
    fileAttachmentName: { type: String, default: '' },

    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'needs_resubmission'],
        default: 'draft'
    }

}, { timestamps: true });

module.exports = mongoose.model('MemberReport', memberReportSchema);
