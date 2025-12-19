const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Store = require('../models/Store');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedSeller = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = 'seller@example.com';
        const password = 'password123';

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists, updating role/store...');
        } else {
            console.log('Creating new user...');
            user = await User.create({
                name: 'Test Seller',
                email,
                phone: '1234567890',
                password,
                role: 'store_admin',
            });
        }

        // Check if store exists
        let store = await Store.findOne({ owner: user._id });
        if (!store) {
            console.log('Creating store for user...');
            store = await Store.create({
                name: 'Test Store',
                description: 'A test store for verification.',
                owner: user._id,
                email: email,
                phone: '1234567890',
                address: {
                    street: '123 Test St',
                    city: 'Test City',
                    state: 'Test State',
                    zipCode: '12345',
                    country: 'Test Country',
                },
            });
            user.storeId = store._id;
            user.role = 'store_admin';
            await user.save();
        } else {
            console.log('Store already exists.');
            if (!user.storeId) {
                user.storeId = store._id;
                await user.save();
            }
        }

        console.log(`Seller Setup Complete. Login with: ${email} / ${password}`);
        process.exit();
    } catch (error) {
        console.error('Error seeding seller:', error);
        process.exit(1);
    }
};

seedSeller();
