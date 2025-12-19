const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: 'seller@example.com' });
        console.log('Seller User:', user ? { id: user._id, role: user.role, storeId: user.storeId } : 'Not Found');

        if (user) {
            const store = await Store.findOne({ owner: user._id });
            console.log('Store for User:', store ? { id: store._id, name: store.name } : 'Not Found');
        }

        const allStores = await Store.find({});
        console.log('Total Stores:', allStores.length);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkData();
