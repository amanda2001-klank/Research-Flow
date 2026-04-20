const mongoose = require('mongoose');

/**
 * ProgressVerification Model
 * Digital approval/signature applied by the supervisor when ALL 4 member
 * reports are approved, officially marking the fortnight cycle as COMPLETED.
 * Each cycle can have at most one ProgressVerification record.
 */
const progressVerificationSchema = new mongoose.Schema({
    cycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FortnightCycle',
        required: true,
        unique: true    // One verification per cycle
    },
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    verifiedAt: { type: Date, default: Date.now },      // Timestamp of the approval

    // Digital signature string (e.g. a base64 canvas signature, a hash, or an approval token)
    signatureData: { type: String, default: '' },

    notes: { type: String, default: '' }                // Optional final notes from supervisor

}, { timestamps: true });

module.exports = mongoose.model('ProgressVerification', progressVerificationSchema);
