const mongoose = require('mongoose');

/**
 * FortnightCycle Model
 * Represents one 15-day research cycle.
 * A group has exactly 24 cycles spanning the full research year.
 *
 * Status flow:
 *   PENDING → IN_PROGRESS → SUBMITTED → NEEDS_RESUBMISSION → SUBMITTED → COMPLETED
 */
const fortnightCycleSchema = new mongoose.Schema({
    cycleNumber: { type: Number, required: true },      // 1 through 24
    groupId: { type: String, required: true },           // Links to GroupMember.groupId

    // Supervisor assigned to review this group's submissions
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Group leader's User account (receives notifications, submits reports)
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    startDate: { type: Date, required: true },           // First day of the 15-day cycle
    endDate: { type: Date, required: true },             // Last day of the 15-day cycle

    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'NEEDS_RESUBMISSION', 'COMPLETED'],
        default: 'PENDING'
    },

    // Array of 4 MemberReport references (populated as reports are created/updated)
    memberReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MemberReport' }],

    // Tracks whether the "new cycle open" notification was sent to the leader
    notificationSent: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('FortnightCycle', fortnightCycleSchema);
