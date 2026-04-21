const axios = require('axios');

const studentFAQs = [
    {
        question: "What is the Fortnight Cycle and how does it work?",
        answer: "The Fortnight Cycle is a bi-weekly review period where you submit progress reports on your research work. Each cycle lasts two weeks, and you're required to document your achievements, challenges, and next steps. Your supervisor reviews these reports and provides feedback to help guide your research progress.",
        category: "student",
        tags: ["fortnight", "deadlines", "submission"]
    },
    {
        question: "How do I submit documents and research materials?",
        answer: "You can submit documents through the Documents section in the dashboard. Click 'Upload Document' and select the file from your computer. Once uploaded, your supervisor can review and provide feedback. Make sure your documents are in PDF format and follow the naming convention: [YourName]_[DocumentType]_[Date].pdf for better organization.",
        category: "student",
        tags: ["document", "upload", "submission"]
    },
    {
        question: "What should I do if I miss a deadline?",
        answer: "If you miss a deadline, immediately contact your supervisor to explain the situation. You can still submit late work through the Documents section, and your supervisor will review it. However, try to meet deadlines to stay on track with your research timeline. Late submissions may affect your overall progress evaluation.",
        category: "student",
        tags: ["deadline", "late-submission", "help"]
    },
    {
        question: "How do I request help or feedback from my supervisor?",
        answer: "You can communicate with your supervisor using the Chat feature in the platform. Navigate to the Chat section and select your supervisor's channel. You can send messages, share ideas, and ask questions. For formal feedback on submissions, use the Document Review feature where supervisors can leave detailed comments.",
        category: "student",
        tags: ["communication", "feedback", "supervisor"]
    },
    {
        question: "What plagiarism checking tools are available?",
        answer: "The platform includes a built-in Plagiarism Checker that analyzes your documents for originality. Before finalizing your submissions, use this tool to ensure your work is original and properly cited. Always properly acknowledge sources and avoid copying content. Plagiarism is a serious academic integrity issue with significant consequences.",
        category: "student",
        tags: ["plagiarism", "integrity", "tools"]
    }
];

async function seedFAQs() {
    try {
        const baseURL = 'http://localhost:5000/api/faq';
        
        for (const faq of studentFAQs) {
            try {
                const response = await axios.post(baseURL, faq);
                console.log(`✓ Added FAQ: "${faq.question}"`);
            } catch (err) {
                if (err.response?.status === 400 && err.response?.data?.includes('duplicate')) {
                    console.log(`⚠ FAQ already exists: "${faq.question}"`);
                } else {
                    console.error(`✗ Error adding FAQ: "${faq.question}"`, err.message);
                }
            }
        }
        
        console.log('\n✓ FAQ seeding completed!');
    } catch (err) {
        console.error('Error seeding FAQs:', err.message);
    }
}

seedFAQs();
