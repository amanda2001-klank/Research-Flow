const router = require('express').Router();
const Message = require('../models/Message');

// Add new message
router.post('/', async (req, res) => {
    const newMessage = new Message(req.body);
    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get messages between two users
router.get('/:userId/:otherUserId', async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.params.userId, recipient: req.params.otherUserId },
                { sender: req.params.otherUserId, recipient: req.params.userId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
