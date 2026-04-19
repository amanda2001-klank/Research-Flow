const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['open', 'in-progress', 'resolved', 'closed'], 
        default: 'open' 
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'urgent'], 
        default: 'low' 
    },
    attachments: [{
        url: { type: String },
        filename: { type: String }
    }],
    adminResponse: { type: String },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
