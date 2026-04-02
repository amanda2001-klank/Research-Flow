const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, // Email login
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'sponsor', 'admin'], default: 'student' },
    fullName: { type: String },
    avatar: { type: String }, // URL to image
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
