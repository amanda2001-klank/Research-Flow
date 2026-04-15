const router = require('express').Router();
const User = require('../models/User');
const avatarUpload = require('../middleware/avatarUpload');
// In a real app, use bcrypt and jwt. For this demo, simple check.

router.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json("User not found");

        if (user.password !== req.body.password) {
            return res.status(401).json("Wrong credentials");
        }

        // Update status to online
        user.isOnline = true;
        await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/logout', async (req, res) => {
    try {
        if (req.body.userId) {
            await User.findByIdAndUpdate(req.body.userId, { isOnline: false, lastSeen: Date.now() });
        }
        res.status(200).json("Logged out");
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        const { password, ...updateData } = req.body; // Don't allow password change here
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json("User not found");
        }

        const { password: _, ...other } = updatedUser._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/upload-avatar/:id', avatarUpload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json("No file uploaded");
        }

        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { avatar: avatarPath } },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json("User not found");
        }

        const { password, ...other } = updatedUser._doc;
        res.status(200).json({
            ...other,
            message: "Avatar uploaded successfully",
            avatarUrl: avatarPath
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update notification preferences
router.put('/notification-preferences/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { notificationPreferences: req.body.notificationPreferences } },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json("User not found");
        }

        const { password, ...other } = updatedUser._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
