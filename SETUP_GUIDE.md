# Multi-Vendor E-Commerce Platform - Setup Guide

## Project Overview
A complete multi-vendor platform with:
- Backend: Express + MongoDB API with JWT auth, RBAC, GridFS file uploads, and payment placeholders (eSewa, Khalti, PhonePe).
- Web Frontend: React + Vite + Tailwind with Redux Toolkit, protected routing, and role-based dashboards.
- Mobile Frontend: Structure ready for React Native CLI.

## Getting Started

### Prerequisites
- Node.js v16+
- MongoDB v5+ (local or Atlas)
- npm or yarn
- For mobile: Android Studio (Android), Xcode (iOS/macOS), Java JDK 11

### 1) Backend
```bash
cd backend
npm install
cp .env.example .env   # update values, e.g. MONGODB_URI
npm run dev            # http://localhost:5000
```

### 2) Web Frontend
```bash
cd web
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev            # http://localhost:5173
```

### 3) Mobile Frontend
Structure is ready for `npx react-native init mobile`. After initializing:
- Install dependencies and set up navigation, Redux, and services mirroring the web app.
- Android: `npm run android`
- iOS (macOS): `cd ios && pod install && cd .. && npm run ios`

### 4) MongoDB Options
- Local MongoDB Community Edition; ensure the service is running.
- MongoDB Atlas: create a cluster, grab the connection string, and set `MONGODB_URI` in `backend/.env`.

## Design Highlights (Web)
- Gradient-driven UI, responsive layouts, smooth transitions.
- Shared components: Navbar with cart badges, ProductCard, Footer.
- Pages: Auth (login/register), customer flows (home, product list/detail, cart, wishlist, checkout, orders), and dashboards for superadmin, store admin, and store manager.

## User Roles & Capabilities
- SuperAdmin: Approve/reject stores, view all users/stores, platform analytics.
- Store Admin: Store profile, manager assignment, store analytics, revenue reports.
- Store Manager: Product CRUD with images, inventory, order processing, store analytics.
- Customer: Browse/search, cart/wishlist, checkout, orders, reviews, profile management.

## Next Steps
1. Start MongoDB and update `.env` files.
2. Create a SuperAdmin user manually (seed script or DB insert).
3. Implement payment gateway keys and flows.
4. Fill placeholder pages with real API data and add email notifications.
5. Add search (MongoDB full-text) and analytics charts (e.g., Recharts).

## Project Structure
```
E-commerce/
|-- backend/                 # API
|   |-- config/              # Database config
|   |-- controllers/         # Business logic
|   |-- middleware/          # Auth, validation, errors
|   |-- models/              # Mongoose schemas
|   |-- routes/              # API endpoints
|   |-- utils/               # Helpers (JWT, GridFS)
|   `-- server.js
|
|-- web/                     # React web app
|   |-- src/
|   |   |-- components/      # Navbar, Footer, ProductCard
|   |   |-- pages/           # All page components
|   |   |-- redux/           # State management
|   |   |-- services/        # API calls
|   |   `-- App.jsx, main.jsx
|   `-- package.json
|
`-- mobile/                  # React Native (to be initialized)
    |-- android/             # Android native code
    |-- ios/                 # iOS native code
    `-- src/                 # Components, screens, navigation, redux, services, utils
```

## Security Features
- Password hashing (bcrypt), JWT access/refresh tokens, RBAC, input validation.
- CORS configuration and rate limiting; helmet for security headers.

## Payment Integration (to complete)
- eSewa: merchant ID/secret, test vs production.
- Khalti: public/secret keys, webhook for verification.
- PhonePe: merchant ID and salt key.

## Troubleshooting
- Backend not starting: ensure MongoDB is running and `.env` values are set; try `npm install --legacy-peer-deps` if needed.
- Web app CORS: verify `WEB_URL` in backend `.env` and `VITE_API_URL` in web `.env`.
- File uploads: GridFS must be initialized after Mongo connects (handled in `server.js`).

## Deployment
- Backend: Heroku, Railway, DigitalOcean, AWS; use MongoDB Atlas.
- Web: Vercel, Netlify; build with `npm run build`.
- Mobile: Build APK/AAB (Android) or IPA (iOS) for store submission.

## Support
Check the README files per package, review API docs, and inspect console/server logs for errors. Reach out to the development team for further assistance.
