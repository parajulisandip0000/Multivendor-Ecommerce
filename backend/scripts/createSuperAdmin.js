const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = 'superadmin@example.com';
        const password = 'password123';
        const name = 'Super Admin';

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            console.log('User found. Updating role to superadmin...');
            user.role = 'superadmin';
            await user.save();
        } else {
            console.log('Creating new superadmin user...');
            user = await User.create({
                name,
                email,
                phone: '0000000000',
                password,
                role: 'superadmin',
            });
        }

        console.log(`
===========================================
SUPER ADMIN SETUP COMPLETE
===========================================
Email: ${email}
Password: ${password}
Role: ${user.role}
===========================================
        `);

        process.exit();
    } catch (error) {
        console.error('Error creating super admin:', error);
        process.exit(1);
    }
};

createSuperAdmin();
