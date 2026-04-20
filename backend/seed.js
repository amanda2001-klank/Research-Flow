const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_assistant_db';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            // Check for any user
            const users = await User.find().limit(1);

            if (users.length > 0) {
                console.log('Existing User Found:');
                console.log(`Email: ${users[0].email}`);
                console.log(`Password: ${users[0].password}`);
            } else {
                // Create default user
                const newUser = new User({
                    username: "admin",
                    email: "admin@example.com",
                    password: "password123",
                    fullName: "Admin User",
                    role: "sponsor"
                });

                await newUser.save();
                console.log('Created Default User:');
                console.log(`Email: ${newUser.email}`);
                console.log(`Password: ${newUser.password}`);
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
