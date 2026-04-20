const mongoose = require('mongoose');

/**
 * SupervisorFeedback Model
 * Stores feedback the supervisor provides for a specific member report.
 * A single cycle can accumulate multiple feedback records (one per review round).
 */
const supervisorFeedbackSchema = new mongoose.Schema({
    cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FortnightCycle', required: true },
    memberReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'MemberReport', required: true },
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    comment: { type: String, required: true },   // Written feedback text

    action: {
        type: String,
        enum: ['feedback', 'approved', 'resubmission_requested'],
        required: true
        // feedback              → informational comment only, no status change
        // approved              → member report is approved
        // resubmission_requested → member must correct and resubmit
    }

}, { timestamps: true });

module.exports = mongoose.model('SupervisorFeedback', supervisorFeedbackSchema);
