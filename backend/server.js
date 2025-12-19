require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error.middleware');
const { initGridFS } = require('./utils/fileUpload');

const app = express();

// Connect to database
connectDB();

// Initialize GridFS after database connection
const mongoose = require('mongoose');

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: [process.env.WEB_URL, process.env.MOBILE_URL],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Debug Logging
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

// Rate limiting
const SystemSettings = require('./models/systemSettings.model');

// Cache settings in memory
global.systemSettings = null;

const loadSystemSettings = async () => {
    try {
        global.systemSettings = await SystemSettings.getSettings();
        console.log('System settings loaded:', global.systemSettings.rateLimiting);
    } catch (error) {
        console.error('Failed to load system settings:', error);
    }
};

// Load settings once DB is connected
mongoose.connection.once('open', () => {
    initGridFS();
    loadSystemSettings();
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    skip: (req, res) => {
        // Always skip in development
        if (process.env.NODE_ENV === 'development') return true;

        // Skip if disabled in settings
        if (global.systemSettings && !global.systemSettings.rateLimiting.enabled) return true;

        return false;
    }
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/superadmin', require('./routes/superadmin.routes'));
app.use('/api/store-admin', require('./routes/storeAdmin.routes'));
app.use('/api/store-manager', require('./routes/storeManager.routes'));
app.use('/api/customer', require('./routes/customer.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/files', require('./routes/file.routes'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
