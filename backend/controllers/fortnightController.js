const FortnightCycle = require('../models/FortnightCycle');
const MemberReport = require('../models/MemberReport');
const GroupMember = require('../models/GroupMember');
const SupervisorFeedback = require('../models/SupervisorFeedback');
const ProgressVerification = require('../models/ProgressVerification');
const {
    createNotification,
    generateCycles,
    getActiveCycle,
    activatePendingCycles,
    allReportsHaveStatus
} = require('../services/fortnightService');

// ─────────────────────────────────────────────────────────────────────────────
// GROUP SETUP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/fortnight/setup-group
 *
 * Registers the 4 group members and generates all 24 fortnight cycles.
 * Must be called once by the group leader before the research year begins.
 *
 * Body:
 *  {
 *    groupId: string,
 *    supervisorId: ObjectId,
 *    leaderId: ObjectId,
 *    startDate: ISO date string (defaults to today),
 *    members: [
 *      { studentId, studentName, email?, userId?, isLeader? },  // exactly 4
 *      ...
 *    ]
 *  }
 */
const setupGroup = async (req, res) => {
    try {
        const { groupId, supervisorId, leaderId, startDate, members } = req.body;

        // Validate exactly 4 members
        if (!members || members.length !== 4) {
            return res.status(400).json({ message: 'Exactly 4 group members are required.' });
        }

        // Prevent duplicate setup for the same groupId
        const existing = await GroupMember.findOne({ groupId });
        if (existing) {
            return res.status(400).json({ message: 'Group members already registered for this groupId.' });
        }

        // Persist all 4 GroupMember documents
        const savedMembers = [];
        for (const member of members) {
            const gm = new GroupMember({
                studentId: member.studentId,
                studentName: member.studentName,
                email: member.email || '',
                groupId,
                userId: member.userId || null,
                isLeader: member.isLeader || false
            });
            await gm.save();
            savedMembers.push(gm);
        }

        // Generate 24 FortnightCycle documents starting from startDate
        const researchStartDate = startDate ? new Date(startDate) : new Date();
        const cycles = await generateCycles(groupId, supervisorId, leaderId, researchStartDate);

        // Notify group leader that Cycle 1 is now open
        if (leaderId) {
            const firstCycle = cycles[0];
            const notification = await createNotification(
                leaderId,
                `Your research group "${groupId}" has been set up. Fortnight Cycle 1 is now open!`,
                `/fortnight/cycle/${firstCycle._id}`
            );
            if (req.io && notification) {
                req.io.to(leaderId.toString()).emit('getNotification', notification);
            }
        }

        res.status(201).json({
            message: 'Group setup successful. 24 fortnight cycles created.',
            members: savedMembers,
            cyclesCreated: cycles.length,
            firstCycle: cycles[0]
        });
    } catch (error) {
        console.error('[setupGroup]', error);
        res.status(500).json({ message: 'Server error during group setup.', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/fortnight/members/:groupId
 * Returns all 4 registered GroupMember documents for the group.
 */
const getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const members = await GroupMember.find({ groupId });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CYCLE RETRIEVAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/fortnight/current/:groupId
 * Returns the currently active cycle for the group.
 * Also auto-activates any PENDING cycles whose startDate has passed.
 */
const getCurrentCycle = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Auto-activate any cycles that are now due
        await activatePendingCycles(groupId, req.io);

        const cycle = await getActiveCycle(groupId);
        if (!cycle) {
            return res.status(404).json({ message: 'No active cycle found for this group.' });
        }

        // Return fully populated cycle
        const populatedCycle = await FortnightCycle.findById(cycle._id)
            .populate({
                path: 'memberReports',
                populate: { path: 'groupMemberId', model: 'GroupMember' }
            })
            .populate('supervisorId', 'username fullName email')
            .populate('leaderId', 'username fullName email');

        res.json(populatedCycle);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

/**
 * GET /api/fortnight/cycles/:groupId
 * Returns all 24 cycles sorted by cycle number (for full year overview).
 */
const getAllCycles = async (req, res) => {
    try {
        const { groupId } = req.params;
        const cycles = await FortnightCycle.find({ groupId })
            .sort({ cycleNumber: 1 })
            .populate('memberReports');
        res.json(cycles);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

/**
 * GET /api/fortnight/cycle/:cycleId
 * Returns full details of a single cycle: member reports, supervisor feedback, verification.
 */
const getCycleById = async (req, res) => {
    try {
        const { cycleId } = req.params;

        const cycle = await FortnightCycle.findById(cycleId)
            .populate({
                path: 'memberReports',
                populate: { path: 'groupMemberId', model: 'GroupMember' }
            })
            .populate('supervisorId', 'username fullName email')
            .populate('leaderId', 'username fullName email');

        if (!cycle) return res.status(404).json({ message: 'Cycle not found.' });

        // All supervisor feedback for this cycle
        const feedbacks = await SupervisorFeedback.find({ cycleId })
            .populate('supervisorId', 'username fullName')
            .populate('memberReportId', 'studentName studentId');

        // Verification record (if cycle is completed)
        const verification = await ProgressVerification.findOne({ cycleId });

        res.json({ cycle, feedbacks, verification });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DRAFT SAVE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/fortnight/save-draft
 * Creates or updates MemberReport documents with status 'draft'.
 * Supports partial saves (leader can save one report at a time or all at once).
 *
 * Body:
 *  {
 *    cycleId: ObjectId,
 *    reports: [
 *      {
 *        groupMemberId: ObjectId,
 *        studentId: string,
 *        studentName: string,
 *        researchDescription: string,
 *        timeSpent: number,
 *        evidenceLinks: string[],
 *        fileAttachment: string   // URL to uploaded file
 *      }
 *    ]
 *  }
 */
const saveDraft = async (req, res) => {
    try {
        const { cycleId, reports } = req.body;

        const cycle = await FortnightCycle.findById(cycleId);
        if (!cycle) return res.status(404).json({ message: 'Cycle not found.' });

        // Completed cycles are locked — no edits allowed
        if (cycle.status === 'COMPLETED') {
            return res.status(403).json({ message: 'This cycle is completed and locked. No further edits allowed.' });
        }

        const savedReports = [];

        for (const reportData of reports) {
            // Look for an existing report for this member in this cycle
            let report = await MemberReport.findOne({ cycleId, groupMemberId: reportData.groupMemberId });

            if (report) {
                // Update existing report fields (only if new values are provided)
                report.researchDescription = reportData.researchDescription !== undefined
                    ? reportData.researchDescription : report.researchDescription;
                report.timeSpent = reportData.timeSpent !== undefined
                    ? reportData.timeSpent : report.timeSpent;
                report.evidenceLinks = reportData.evidenceLinks ?? report.evidenceLinks;
                report.markModified('evidenceLinks');
                report.fileAttachment = reportData.fileAttachment || report.fileAttachment;
                report.fileAttachmentName = reportData.fileAttachmentName || report.fileAttachmentName;
                report.status = 'draft';
                await report.save();
            } else {
                // Create a brand-new draft report
                report = new MemberReport({
                    cycleId,
                    groupMemberId: reportData.groupMemberId,
                    studentId: reportData.studentId,
                    studentName: reportData.studentName,
                    researchDescription: reportData.researchDescription || '',
                    timeSpent: reportData.timeSpent || 0,
                    evidenceLinks: reportData.evidenceLinks || [],
                    fileAttachment: reportData.fileAttachment || '',
                    fileAttachmentName: reportData.fileAttachmentName || '',
                    status: 'draft'
                });
                await report.save();

                // Register the new report in the cycle's memberReports array
                if (!cycle.memberReports.includes(report._id)) {
                    cycle.memberReports.push(report._id);
                    await cycle.save();
                }
            }

            savedReports.push(report);
        }

        res.json({
            message: 'Draft saved successfully.',
            reports: savedReports,
            reportsCount: cycle.memberReports.length,
            readyToSubmit: cycle.memberReports.length >= 4
        });
    } catch (error) {
        console.error('[saveDraft]', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/fortnight/submit
 * Submits the full fortnight cycle to the supervisor.
 * Requires all 4 member reports to exist and have non-empty researchDescription.
 *
 * Body: { cycleId, leaderId }
 */
const submitFortnight = async (req, res) => {
    try {
        const { cycleId, leaderId } = req.body;

        const cycle = await FortnightCycle.findById(cycleId);
        if (!cycle) return res.status(404).json({ message: 'Cycle not found.' });

        if (cycle.status === 'COMPLETED') {
            return res.status(403).json({ message: 'This cycle is already completed.' });
        }

        // Guard: all 4 reports must exist
        if (cycle.memberReports.length < 4) {
            return res.status(400).json({
                message: `All 4 member reports must be filled before submitting. Currently ${cycle.memberReports.length}/4 reports exist.`
            });
        }

        // Guard: no report may have empty research description
        const reports = await MemberReport.find({ cycleId });
        const emptyReports = reports.filter(r => !r.researchDescription || r.researchDescription.trim() === '');
        if (emptyReports.length > 0) {
            return res.status(400).json({
                message: `${emptyReports.length} member report(s) have empty research descriptions. Please fill all reports before submitting.`
            });
        }

        // Mark every report as 'submitted'
        await MemberReport.updateMany({ cycleId }, { status: 'submitted' });

        // Update cycle status
        cycle.status = 'SUBMITTED';
        await cycle.save();

        // Notify the assigned supervisor
        const notification = await createNotification(
            cycle.supervisorId,
            `New Fortnight Submission Received: Group "${cycle.groupId}" submitted Cycle ${cycle.cycleNumber}.`,
            `/fortnight/cycle/${cycle._id}`
        );
        if (req.io && notification) {
            req.io.to(cycle.supervisorId.toString()).emit('getNotification', notification);
        }

        res.json({ message: 'Fortnight cycle submitted successfully.', cycle });
    } catch (error) {
        console.error('[submitFortnight]', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPERVISOR FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/fortnight/feedback
 * Supervisor reviews a member report and either approves, requests resubmission,
 * or leaves an informational comment.
 *
 * Body:
 *  {
 *    cycleId: ObjectId,
 *    memberReportId: ObjectId,
 *    supervisorId: ObjectId,
 *    comment: string,
 *    action: 'feedback' | 'approved' | 'resubmission_requested'
 *  }
 */
const addFeedback = async (req, res) => {
    try {
        const { cycleId, memberReportId, supervisorId, comment, action } = req.body;

        const cycle = await FortnightCycle.findById(cycleId);
        if (!cycle) return res.status(404).json({ message: 'Cycle not found.' });

        const memberReport = await MemberReport.findById(memberReportId);
        if (!memberReport) return res.status(404).json({ message: 'Member report not found.' });

        // Persist the feedback record
        const feedback = new SupervisorFeedback({ cycleId, memberReportId, supervisorId, comment, action });
        await feedback.save();

        // Update the individual member report status
        if (action === 'approved') {
            memberReport.status = 'approved';
        } else if (action === 'resubmission_requested') {
            memberReport.status = 'needs_resubmission';
        }
        await memberReport.save();

        // ── Resubmission requested ───────────────────────────────────────────
        if (action === 'resubmission_requested') {
            cycle.status = 'NEEDS_RESUBMISSION';
            await cycle.save();

            // Notify the group leader
            if (cycle.leaderId) {
                const notification = await createNotification(
                    cycle.leaderId,
                    `Resubmission requested for Cycle ${cycle.cycleNumber} – Group "${cycle.groupId}". Please review supervisor feedback and resubmit.`,
                    `/fortnight/cycle/${cycle._id}`
                );
                if (req.io && notification) {
                    req.io.to(cycle.leaderId.toString()).emit('getNotification', notification);
                }
            }
        }

        // ── Approved: check if all 4 are now approved ────────────────────────
        if (action === 'approved') {
            const allApproved = await allReportsHaveStatus(cycleId, 'approved');
            if (allApproved && cycle.leaderId) {
                const notification = await createNotification(
                    cycle.leaderId,
                    `All 4 reports in Cycle ${cycle.cycleNumber} have been approved! Awaiting final supervisor verification.`,
                    `/fortnight/cycle/${cycle._id}`
                );
                if (req.io && notification) {
                    req.io.to(cycle.leaderId.toString()).emit('getNotification', notification);
                }
            }
        }

        res.json({ message: 'Feedback saved.', feedback, memberReport });
    } catch (error) {
        console.error('[addFeedback]', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESUBMIT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/fortnight/resubmit
 * Leader corrects and resubmits a specific member report after resubmission was requested.
 *
 * Body:
 *  {
 *    cycleId: ObjectId,
 *    memberReportId: ObjectId,
 *    researchDescription: string,
 *    timeSpent: number,
 *    evidenceLinks: string[],
 *    fileAttachment: string
 *  }
 */
const resubmit = async (req, res) => {
    try {
        const { cycleId, memberReportId, researchDescription, timeSpent, evidenceLinks, fileAttachment, fileAttachmentName } = req.body;

        const cycle = await FortnightCycle.findById(cycleId);
        if (!cycle) return res.status(404).json({ message: 'Cycle not found.' });

        if (!['NEEDS_RESUBMISSION', 'SUBMITTED'].includes(cycle.status)) {
            return res.status(400).json({ message: 'Cycle is not awaiting resubmission.' });
        }

        const memberReport = await MemberReport.findById(memberReportId);
        if (!memberReport) return res.status(404).json({ message: 'Member report not found.' });

        if (memberReport.status !== 'needs_resubmission') {
            return res.status(400).json({ message: 'This report does not require resubmission.' });
        }

        // Apply the corrections
        memberReport.researchDescription = researchDescription || memberReport.researchDescription;
        memberReport.timeSpent = timeSpent !== undefined ? timeSpent : memberReport.timeSpent;
        memberReport.evidenceLinks = evidenceLinks ?? memberReport.evidenceLinks;
        memberReport.markModified('evidenceLinks');
        memberReport.fileAttachment = fileAttachment || memberReport.fileAttachment;
        memberReport.fileAttachmentName = fileAttachmentName || memberReport.fileAttachmentName;
        memberReport.status = 'submitted'; // Back to submitted for supervisor to review
        await memberReport.save();

        // If no more reports need resubmission, reset the cycle to SUBMITTED
        const stillPending = await MemberReport.findOne({ cycleId, status: 'needs_resubmission' });
        if (!stillPending) {
            cycle.status = 'SUBMITTED';
            await cycle.save();
        }

        // Notify the supervisor about the correction
        const notification = await createNotification(
            cycle.supervisorId,
            `Group "${cycle.groupId}" has submitted a corrected report for Cycle ${cycle.cycleNumber}. Please review.`,
            `/fortnight/cycle/${cycle._id}`
        );
        if (req.io && notification) {
            req.io.to(cycle.supervisorId.toString()).emit('getNotification', notification);
        }

        res.json({ message: 'Report resubmitted successfully.', memberReport, cycle });
    } catch (error) {
        console.error('[resubmit]', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY (Digital Approval)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/fortnight/verify
 * Supervisor applies digital signature to officially complete a cycle.
 * All 4 member reports must be in 'approved' status before this is allowed.
 *
 * Body: { cycleId, supervisorId, signatureData, notes }
 */
const verify = async (req, res) => {
    try {
        const { cycleId, supervisorId, signatureData, notes } = req.body;

        const cycle = await FortnightCycle.findById(cycleId);
        if (!cycle) return res.status(404).json({ message: 'Cycle not found.' });

        // All 4 reports must be approved before verifying
        const allApproved = await allReportsHaveStatus(cycleId, 'approved');
        if (!allApproved) {
            return res.status(400).json({
                message: 'All 4 member reports must be approved before the cycle can be verified.'
            });
        }

        // Prevent double-verification
        const existingVerification = await ProgressVerification.findOne({ cycleId });
        if (existingVerification) {
            return res.status(400).json({ message: 'This cycle has already been verified.' });
        }

        // Create the verification record (digital approval)
        const verification = new ProgressVerification({
            cycleId,
            supervisorId,
            verifiedAt: new Date(),
            signatureData: signatureData || '',
            notes: notes || ''
        });
        await verification.save();

        // Lock the cycle as COMPLETED
        cycle.status = 'COMPLETED';
        await cycle.save();

        // Notify the group leader of completion
        if (cycle.leaderId) {
            const notification = await createNotification(
                cycle.leaderId,
                `Fortnight Cycle ${cycle.cycleNumber} for group "${cycle.groupId}" has been verified and completed!`,
                `/fortnight/cycle/${cycle._id}`
            );
            if (req.io && notification) {
                req.io.to(cycle.leaderId.toString()).emit('getNotification', notification);
            }
        }

        res.json({ message: 'Cycle verified and marked as COMPLETED.', cycle, verification });
    } catch (error) {
        console.error('[verify]', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/fortnight/leader-dashboard/:groupId
 * Returns dashboard data for the group leader:
 *   - Current active cycle
 *   - Cycles needing correction (NEEDS_RESUBMISSION)
 *   - Completed cycles
 *   - Overall progress summary
 */
const getLeaderDashboard = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Auto-activate any newly due cycles before returning dashboard
        await activatePendingCycles(groupId, req.io);

        const allCycles = await FortnightCycle.find({ groupId }).sort({ cycleNumber: 1 });

        const currentCycle = allCycles.find(c =>
            ['IN_PROGRESS', 'SUBMITTED', 'NEEDS_RESUBMISSION'].includes(c.status)
        ) || null;

        const pendingCorrections = allCycles.filter(c => c.status === 'NEEDS_RESUBMISSION');
        const completedCycles = allCycles.filter(c => c.status === 'COMPLETED');

        res.json({
            currentCycle,
            pendingCorrections,
            completedCycles,
            totalCycles: allCycles.length,
            completionProgress: `${completedCycles.length} / ${allCycles.length} cycles completed`
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

/**
 * GET /api/fortnight/supervisor-dashboard/:supervisorId
 * Returns dashboard data for the supervisor:
 *   - Cycles awaiting review (SUBMITTED)
 *   - Cycles awaiting corrections (NEEDS_RESUBMISSION)
 *   - Fully approved/completed cycles
 */
const getSupervisorDashboard = async (req, res) => {
    try {
        const { supervisorId } = req.params;

        const allCycles = await FortnightCycle.find({ supervisorId })
            .sort({ cycleNumber: 1 })
            .populate('memberReports');

        const pendingReviews = allCycles.filter(c => c.status === 'SUBMITTED');
        const needsResubmission = allCycles.filter(c => c.status === 'NEEDS_RESUBMISSION');
        const approvedCycles = allCycles.filter(c => c.status === 'COMPLETED');

        res.json({
            pendingReviews,
            needsResubmission,
            approvedCycles,
            totalAssigned: allCycles.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

module.exports = {
    setupGroup,
    getGroupMembers,
    getCurrentCycle,
    getAllCycles,
    getCycleById,
    saveDraft,
    submitFortnight,
    addFeedback,
    resubmit,
    verify,
    getLeaderDashboard,
    getSupervisorDashboard
};
