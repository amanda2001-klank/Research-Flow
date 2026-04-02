const mongoose = require('mongoose');
const User = require('./models/User');
const FAQ = require('./models/FAQ');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_assistant_db')
    .then(() => console.log('MongoDB connected for seeding'))
    .catch(err => console.log(err));

const seedData = async () => {
    try {
        // Clear existing test users first
        await User.deleteMany({
            $or: [
                { email: { $in: ['admin@test.com', 'sponsor@test.com', 'student@test.com'] } },
                { username: { $in: ['adminuser', 'sponsor1user', 'student1user'] } }
            ]
        });
        console.log('🧹 Cleared existing test users');

        // Create Admin User
        const admin = new User({
            username: 'adminuser',
            email: 'admin@test.com',
            password: 'admin123', // In production, use hashed passwords
            role: 'admin',
            fullName: 'Admin User',
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=FFD700&color=2F4F4F'
        });
        await admin.save();
        console.log('✅ Admin user created');

        // Create Sponsor User
        const sponsor = new User({
            username: 'sponsor1user',
            email: 'sponsor@test.com',
            password: 'sponsor123',
            role: 'sponsor',
            fullName: 'John Sponsor',
            avatar: 'https://ui-avatars.com/api/?name=John+Sponsor&background=FFD700&color=2F4F4F'
        });
        await sponsor.save();
        console.log('✅ Sponsor user created');

        // Create Student User
        const student = new User({
            username: 'student1user',
            email: 'student@test.com',
            password: 'student123',
            role: 'student',
            fullName: 'Jane Student',
            avatar: 'https://ui-avatars.com/api/?name=Jane+Student&background=FFD700&color=2F4F4F'
        });
        await student.save();
        console.log('✅ Student user created');

        // Create FAQs
        const faqs = [
            {
                question: 'How do I reset my password?',
                answer: 'Click on the "Forgot Password" link on the login page and follow the instructions sent to your email.',
                category: 'account',
                tags: ['password', 'account', 'security']
            },
            {
                question: 'How do I contact my sponsor?',
                answer: 'Go to the Chat section in your dashboard and select your assigned sponsor from the channel list.',
                category: 'communication',
                tags: ['chat', 'sponsor', 'contact']
            },
            {
                question: 'Where can I find announcements?',
                answer: 'Navigate to the Announcements section from the sidebar. You will receive notifications when new announcements are posted.',
                category: 'general',
                tags: ['announcements', 'notifications']
            },
            {
                question: 'How do I use the AI Assistant?',
                answer: 'Click on "AI Assistant" in the sidebar to access the AI-powered chat that can help answer your questions.',
                category: 'features',
                tags: ['ai', 'assistant', 'help']
            }
        ];

        for (const faqData of faqs) {
            const existingFAQ = await FAQ.findOne({ question: faqData.question });
            if (!existingFAQ) {
                const faq = new FAQ(faqData);
                await faq.save();
                console.log(`✅ FAQ created: ${faqData.question}`);
            } else {
                console.log(`ℹ️  FAQ already exists: ${faqData.question}`);
            }
        }

        console.log('\n🎉 Seeding completed successfully!');
        console.log('\n📋 Test Credentials:');
        console.log('Admin - Email: admin@test.com, Password: admin123');
        console.log('Sponsor - Email: sponsor@test.com, Password: sponsor123');
        console.log('Student - Email: student@test.com, Password: student123');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
