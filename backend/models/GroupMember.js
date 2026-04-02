const mongoose = require('mongoose');

/**
 * GroupMember Model
 * Stores the 4 members of each research group.
 * Associated with a groupId string that links to FortnightCycles.
 */
const groupMemberSchema = new mongoose.Schema({
    studentId: { type: String, required: true },        // University student ID (e.g. "S001")
    studentName: { type: String, required: true },      // Full name of the student
    email: { type: String, default: '' },               // Optional email address
    groupId: { type: String, required: true },           // Identifier that groups all 4 members together
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Optional link to a User account
    isLeader: { type: Boolean, default: false }          // True if this member is the group leader
}, { timestamps: true });

module.exports = mongoose.model('GroupMember', groupMemberSchema);
