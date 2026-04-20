const router = require('express').Router();
const Notification = require('../models/Notification');

// Get all notifications for a user
router.get('/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Create a notification
router.post('/', async (req, res) => {
    const newNotification = new Notification(req.body);
    try {
        const savedNotification = await newNotification.save();
        res.status(200).json(savedNotification);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
