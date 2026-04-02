const router = require('express').Router();
const User = require('../models/User');
const { requireAdmin } = require('../middleware/authMiddleware');

// Get all users (students and sponsors)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude passwords
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get all sponsors
router.get('/sponsors', async (req, res) => {
    try {
        const sponsors = await User.find({ role: 'sponsor' }, { password: 0 });
        res.status(200).json(sponsors);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get all students
router.get('/students', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }, { password: 0 });
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Create new sponsor (Admin only)
router.post('/sponsors', async (req, res) => {
    try {
        const newSponsor = new User({
            ...req.body,
            role: 'sponsor' // Force role to sponsor
        });
        const savedSponsor = await newSponsor.save();
        const { password, ...other } = savedSponsor._doc;
        res.status(201).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete sponsor (Admin only)
router.delete('/sponsors/:id', async (req, res) => {
    try {
        const deletedSponsor = await User.findByIdAndDelete(req.params.id);
        if (!deletedSponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }
        res.status(200).json({ message: 'Sponsor deleted successfully' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete student (Admin only)
router.delete('/students/:id', async (req, res) => {
    try {
        const deletedStudent = await User.findByIdAndDelete(req.params.id);
        if (!deletedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
