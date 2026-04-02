const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_assistant_db';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            const studentEmail = "student@example.com";
            const existingUser = await User.findOne({ email: studentEmail });

            if (existingUser) {
                console.log('Student User Already Exists:');
                console.log(`Email: ${existingUser.email}`);
                console.log(`Password: ${existingUser.password}`);
            } else {
                const newStudent = new User({
                    username: "student",
                    email: studentEmail,
                    password: "password123",
                    fullName: "Student User",
                    role: "student"
                });

                await newStudent.save();
                console.log('Created Student User:');
                console.log(`Email: ${newStudent.email}`);
                console.log(`Password: ${newStudent.password}`);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
