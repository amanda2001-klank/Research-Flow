const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For 1-to-1
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Future proofing
    content: { type: String, required: true },
    attachments: [{
        type: { type: String, enum: ['image', 'file', 'voice'] },
        url: { type: String }
    }],
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    isSystemMessage: { type: Boolean, default: false } // For auto-generated messages
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
