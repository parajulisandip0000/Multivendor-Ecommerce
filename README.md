# Multi-Vendor E-Commerce Platform

A comprehensive multi-vendor e-commerce platform with web and mobile applications, supporting SuperAdmin, Store Admin, Store Manager, and Customer roles.

## Architecture

### Technology Stack
- Backend: Node.js + Express.js + MongoDB
- Web Frontend: React + Vite + Tailwind CSS
- Mobile Frontend: React Native CLI
- State Management: Redux Toolkit
- Authentication: JWT with role-based access control
- Payment Gateways: eSewa, Khalti, PhonePe
- Image Storage: MongoDB GridFS

### Project Structure
```
E-commerce/
|-- backend/                 # Node.js + Express API
|   |-- config/              # Configuration files
|   |-- controllers/         # Route controllers
|   |-- middleware/          # Custom middleware
|   |-- models/              # Mongoose models
|   |-- routes/              # API routes
|   |-- utils/               # Utility functions
|   `-- server.js            # Entry point
|
|-- web/                     # React web application
|   |-- public/              # Static files
|   |-- src/
|   |   |-- components/      # Reusable components
|   |   |-- pages/           # Page components
|   |   |-- redux/           # State management
|   |   |-- services/        # API services
|   |   `-- utils/           # Utilities
|   `-- package.json
|
`-- mobile/                  # React Native application
    |-- android/             # Android native code
    |-- ios/                 # iOS native code
    `-- src/
        |-- components/      # Reusable components
        |-- screens/         # Screen components
        |-- navigation/      # Navigation setup
        |-- redux/           # State management
        |-- services/        # API services
        `-- utils/           # Utilities
```

## User Roles

1. SuperAdmin
   - Manage platform-wide operations
   - Approve or reject store registrations
   - View all stores and users
   - Access platform analytics
   - Monitor all activities

2. Store Admin
   - Full control over a store
   - Manage store profile
   - Assign store managers
   - View store analytics
   - Access revenue reports

3. Store Manager
   - Upload and manage products
   - Handle inventory
   - Manage orders (cancel, hold, process)
   - View store analytics

4. Customer
   - Browse and search products
   - Add to cart and wishlist
   - Purchase products
   - Write reviews and ratings
   - View order history

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn
- For mobile development:
  - Android Studio (Android)
  - Xcode (iOS, macOS only)
  - Java JDK 11

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Web Frontend Setup
```bash
cd web
npm install
npm run dev
```

### Mobile Frontend Setup
```bash
cd mobile
npm install

# For Android
npm run android

# For iOS (macOS only)
cd ios && pod install && cd ..
npm run ios
```

## Features

### Customer
- Product browsing with filters and search
- Shopping cart and wishlist
- Secure checkout and order tracking
- Product reviews and ratings
- Profile and address management

### Store Management
- Product CRUD operations (including bulk upload)
- Inventory and order management
- Sales analytics and customer insights

### Platform Management
- Store approval workflow
- Platform-wide analytics
- User management and activity monitoring
- Revenue tracking

## Security
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting

## API Documentation
API documentation is available at `/api-docs` when the backend server is running.

## Testing
```bash
# Backend tests
cd backend
npm test

# Web frontend tests
cd web
npm test

# Mobile tests
cd mobile
npm test
```

## Deployment

### Backend
- Deploy to Heroku, DigitalOcean, AWS, Railway, or similar
- Use MongoDB Atlas for production database

### Web Frontend
- Deploy to Vercel, Netlify, or similar platforms

### Mobile App
- Build APK/AAB for Android
- Build IPA for iOS
- Publish to Google Play Store and Apple App Store

## Contributing
This is a private project. For questions or issues, please contact the development team.

## License
Proprietary - All rights reserved
