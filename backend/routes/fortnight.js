const express = require('express');
const router = express.Router();
const path = require('path');
const upload = require('../middleware/upload');

const {
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
} = require('../controllers/fortnightController');

// ── File Upload ───────────────────────────────────────────────────────────────
// Upload a document/file and get back a URL to store in the report
router.post('/upload-file', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
    });
});

// ── Group Setup ───────────────────────────────────────────────────────────────
// Register 4 group members and auto-generate all 24 fortnight cycles
router.post('/setup-group', setupGroup);

// Get the 4 registered members of a group
router.get('/members/:groupId', getGroupMembers);

// ── Cycle Access ──────────────────────────────────────────────────────────────
// Get the currently active cycle (also auto-activates any newly due PENDING cycles)
router.get('/current/:groupId', getCurrentCycle);

// Get all 24 cycles for a group (full year overview)
router.get('/cycles/:groupId', getAllCycles);

// Get full details of a single cycle (reports + feedback + verification)
router.get('/cycle/:cycleId', getCycleById);

// ── Leader Actions ────────────────────────────────────────────────────────────
// Save one or more member reports as drafts (partial saves supported)
router.post('/save-draft', saveDraft);

// Submit the full fortnight cycle to the supervisor (requires all 4 reports filled)
router.post('/submit', submitFortnight);

// Resubmit a corrected member report after supervisor requested changes
router.post('/resubmit', resubmit);

// ── Supervisor Actions ────────────────────────────────────────────────────────
// Add feedback / approve / request resubmission for a member report
router.post('/feedback', addFeedback);

// Apply digital signature to officially complete a cycle (all 4 must be approved)
router.post('/verify', verify);

// ── Dashboards ────────────────────────────────────────────────────────────────
router.get('/leader-dashboard/:groupId', getLeaderDashboard);
router.get('/supervisor-dashboard/:supervisorId', getSupervisorDashboard);

module.exports = router;
