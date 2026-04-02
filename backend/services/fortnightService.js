const FortnightCycle = require('../models/FortnightCycle');
const MemberReport = require('../models/MemberReport');
const Notification = require('../models/Notification');

/**
 * Creates a notification record using the existing Notification model.
 * Uses type 'alert' which is already supported by the shared Notification schema.
 *
 * @param {ObjectId} recipientId - User ID of the notification recipient
 * @param {string}   content     - Notification message text
 * @param {string}   link        - Optional deep-link (e.g. /fortnight/cycle/:id)
 */
const createNotification = async (recipientId, content, link = '') => {
    try {
        const notification = new Notification({
            recipient: recipientId,
            type: 'alert',
            content,
            link
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('[FortnightService] Notification creation error:', error.message);
    }
};

/**
 * Generates exactly 24 FortnightCycle documents for a research group.
 * Cycles are spaced 15 days apart from the provided startDate.
 * Cycle 1 is set to IN_PROGRESS immediately; the rest start as PENDING.
 *
 * @param {string}   groupId      - Group identifier string
 * @param {ObjectId} supervisorId - Supervisor User ID
 * @param {ObjectId} leaderId     - Group leader User ID
 * @param {Date}     startDate    - Research year start date
 * @returns {FortnightCycle[]}    - Array of 24 saved cycle documents
 */
const generateCycles = async (groupId, supervisorId, leaderId, startDate) => {
    const cycles = [];
    let cycleStart = new Date(startDate);

    for (let i = 1; i <= 24; i++) {
        // Each cycle ends 14 days after it starts (inclusive 15-day window)
        const cycleEnd = new Date(cycleStart);
        cycleEnd.setDate(cycleEnd.getDate() + 14);

        const cycle = new FortnightCycle({
            cycleNumber: i,
            groupId,
            supervisorId,
            leaderId,
            startDate: new Date(cycleStart),
            endDate: cycleEnd,
            // First cycle opens immediately; remaining are activated as dates arrive
            status: i === 1 ? 'IN_PROGRESS' : 'PENDING',
            notificationSent: i === 1 ? true : false
        });

        await cycle.save();
        cycles.push(cycle);

        // Advance the window by 15 days for the next cycle
        cycleStart.setDate(cycleStart.getDate() + 15);
    }

    return cycles;
};

/**
 * Finds the currently active cycle for a group.
 * First tries to match by today's date range; falls back to the most recent
 * IN_PROGRESS / SUBMITTED / NEEDS_RESUBMISSION cycle if no date match.
 *
 * @param {string} groupId
 * @returns {FortnightCycle|null}
 */
const getActiveCycle = async (groupId) => {
    const today = new Date();

    // Prefer a cycle whose date window includes today
    let cycle = await FortnightCycle.findOne({
        groupId,
        startDate: { $lte: today },
        endDate: { $gte: today },
        status: { $in: ['IN_PROGRESS', 'SUBMITTED', 'NEEDS_RESUBMISSION'] }
    }).populate('memberReports');

    // Fallback: latest active cycle regardless of date (handles overdue submissions)
    if (!cycle) {
        cycle = await FortnightCycle.findOne({
            groupId,
            status: { $in: ['IN_PROGRESS', 'SUBMITTED', 'NEEDS_RESUBMISSION'] }
        })
            .sort({ cycleNumber: -1 })
            .populate('memberReports');
    }

    return cycle;
};

/**
 * Scans for PENDING cycles whose startDate has now passed and activates them.
 * Sends a "new cycle open" notification to the group leader for each activated cycle.
 * This is called automatically when the leader hits GET /api/fortnight/current/:groupId.
 *
 * @param {string} groupId - Group identifier
 * @param {Server} io      - Socket.IO server instance (from req.io)
 */
const activatePendingCycles = async (groupId, io) => {
    const today = new Date();

    // Find PENDING cycles whose start date has been reached and notification not yet sent
    const pendingCycles = await FortnightCycle.find({
        groupId,
        status: 'PENDING',
        startDate: { $lte: today },
        notificationSent: false
    });

    for (const cycle of pendingCycles) {
        cycle.status = 'IN_PROGRESS';
        cycle.notificationSent = true;
        await cycle.save();

        // Send real-time + database notification to group leader
        if (cycle.leaderId) {
            const notification = await createNotification(
                cycle.leaderId,
                `Fortnight Cycle ${cycle.cycleNumber} is now open for submission ` +
                `(${cycle.startDate.toDateString()} – ${cycle.endDate.toDateString()}).`,
                `/fortnight/cycle/${cycle._id}`
            );

            if (io && notification) {
                io.to(cycle.leaderId.toString()).emit('getNotification', notification);
            }
        }
    }

    return pendingCycles;
};

/**
 * Checks whether all 4 member reports for a given cycle have a specific status.
 *
 * @param {ObjectId} cycleId - FortnightCycle ID
 * @param {string}   status  - Status string to check (e.g. 'approved')
 * @returns {boolean}
 */
const allReportsHaveStatus = async (cycleId, status) => {
    const reports = await MemberReport.find({ cycleId });
    if (reports.length < 4) return false;
    return reports.every(r => r.status === status);
};

module.exports = {
    createNotification,
    generateCycles,
    getActiveCycle,
    activatePendingCycles,
    allReportsHaveStatus
};
