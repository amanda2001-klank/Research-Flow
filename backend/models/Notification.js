const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['message', 'system', 'alert', 'ai_suggestion', 'announcement'], required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String } // Optional link to navigate to
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
