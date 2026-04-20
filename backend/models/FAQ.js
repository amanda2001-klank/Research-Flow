const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    question: { type: String, required: true, unique: true },
    answer: { type: String, required: true },
    category: { type: String, default: 'general' },
    tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);
