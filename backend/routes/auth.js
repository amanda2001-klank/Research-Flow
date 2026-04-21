const router = require('express').Router();
const User = require('../models/User');
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

router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
