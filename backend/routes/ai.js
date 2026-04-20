const router = require('express').Router();
const FAQ = require('../models/FAQ');

const { tavily } = require("@tavily/core");

// Initialize Tavily client
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// AI response generation using Tavily
const generateAIResponse = async (query) => {
    try {
        // 1. Check for greeting locally
        if (query.toLowerCase().match(/^(hi|hello|hey|greetings)/)) {
            return "Hello! I am your ResearchFlow AI assistant. How can I help you today?";
        }

        // 2. Check FAQ database
        const faq = await FAQ.findOne({ question: { $regex: query, $options: 'i' } });
        if (faq) return faq.answer;

        // 3. Use Tavily for search
        const response = await tvly.search(query, {
            searchDepth: "advanced",
            includeAnswer: true,
            maxResults: 5
        });

        return response.answer || (response.results?.[0]?.content) || "I couldn't find a specific answer. Please try rephrasing.";
    } catch (err) {
        console.error("Tavily Error:", err);
        return "I'm having trouble connecting to my research database.";
    }
};

router.post('/query', async (req, res) => {
    try {
        const { question, userId } = req.body;
        const answer = await generateAIResponse(question);
        res.status(200).json({ answer });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Add FAQ (Admin/System)
router.post('/faq', async (req, res) => {
    try {
        const newFAQ = new FAQ(req.body);
        const savedFAQ = await newFAQ.save();
        res.status(200).json(savedFAQ);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
