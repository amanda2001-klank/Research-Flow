const mongoose = require('mongoose');

const supervisorRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: String, required: true },
    membersList: { type: String, required: true },
    topic: { type: String, required: true },
    domain: { type: String, default: "General Research" },
    reason: { type: String },
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Rejected', 'Removed'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('SupervisorRequest', supervisorRequestSchema);
