const router = require('express').Router();
const FAQ = require('../models/FAQ');

// Get all FAQs (public access)
router.get('/', async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ category: 1, createdAt: -1 });
        res.status(200).json(faqs);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Create FAQ (Admin only)
router.post('/', async (req, res) => {
    try {
        const newFAQ = new FAQ(req.body);
        const savedFAQ = await newFAQ.save();
        res.status(201).json(savedFAQ);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update FAQ (Admin only)
router.put('/:id', async (req, res) => {
    try {
        const updatedFAQ = await FAQ.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedFAQ) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.status(200).json(updatedFAQ);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete FAQ (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const deletedFAQ = await FAQ.findByIdAndDelete(req.params.id);
        if (!deletedFAQ) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.status(200).json({ message: 'FAQ deleted successfully' });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
