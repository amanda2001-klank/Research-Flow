const router = require('express').Router();
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create Announcement (Admin/Sponsor only)
router.post('/', async (req, res) => {
    try {
        const newAnnouncement = new Announcement(req.body);
        const savedAnnouncement = await newAnnouncement.save();

        // 1. Find all students
        const students = await User.find({ role: 'student' });

        // 2. Create Notifications for each student
        const notifications = students.map(student => ({
            recipient: student._id,
            type: 'system',
            content: `New Announcement: ${savedAnnouncement.title}`,
            link: '/dashboard', // Can link to a specific anchor if needed
            isRead: false
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);

            // 3. Real-time Socket.io Emission
            if (req.io) {
                // Determine how your frontend joins rooms. 
                // Assuming students join a room named by their User ID.
                notifications.forEach(notif => {
                    // Emit to specific user room
                    req.io.to(notif.recipient.toString()).emit("getNotification", {
                        senderName: "Admin",
                        type: "system",
                        content: notif.content,
                    });
                });
            }
        }

        res.status(200).json(savedAnnouncement);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Get all announcements
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('sender', 'username fullName') // Get sender details
            .sort({ createdAt: -1 }); // Newest first
        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
