# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

The Dairy Supply & Delivery System is a comprehensive multi-platform application for managing dairy product subscriptions and deliveries in Coimbatore (daily milk) and Tamil Nadu (catalog orders). It consists of a Node.js backend with PostgreSQL, a React web frontend, and a React Native mobile app.

## Common Development Commands

### Initial Setup
```bash
# Backend setup
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL in .env
npm run migrate
npm run seed
npm run dev

# Frontend web setup  
cd frontend-web
npm install
npm start

# Mobile app setup
cd mobile-app
npm install
npm start
```

### Database Management
```bash
cd backend
npm run migrate        # Run latest migrations
npm run seed          # Seed database with sample data
npm run db:reset      # Full reset: rollback, migrate, seed
```

### Development Servers
```bash
# Backend API server (port 3000)
cd backend && npm run dev

# Web frontend (port 3001)  
cd frontend-web && npm start

# Mobile app (Expo development server)
cd mobile-app && npm start
```

### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend-web && npm test

# Mobile app tests
cd mobile-app && npm test
```

### Build & Production
```bash
# Web frontend production build
cd frontend-web && npm run build

# Mobile app builds
cd mobile-app
npm run build:android    # Android build
npm run build:ios        # iOS build
```

## Architecture Overview

### Multi-Tier Architecture
- **Backend**: Node.js + Express + PostgreSQL serving RESTful APIs
- **Web Frontend**: React + TypeScript + Tailwind CSS with Zustand state management
- **Mobile App**: React Native + Expo with TypeScript and comprehensive navigation
- **Shared**: TypeScript definitions and constants (currently empty directory)

### Authentication System
- **User Authentication**: Phone/OTP verification with JWT tokens
- **Admin Authentication**: Hardcoded email/password (admin@dairydelivery.com / admin123)
- **Role-based Access**: Users, Delivery Agents, Admins with different app flows

### Database Architecture
Uses PostgreSQL with Knex.js query builder and migrations:
- **Core Entities**: users, addresses, products, orders, subscriptions
- **Delivery System**: routes, route_stops, subscription_deliveries  
- **Billing**: invoices, payments, ledger_entries
- **Migration Pattern**: Timestamped files in `backend/migrations/`

### API Design
RESTful endpoints organized by domain:
- `/api/auth/*` - Authentication (OTP, Google Sign-in)
- `/api/users/*` - User profiles, addresses
- `/api/products/*` - Product catalog
- `/api/orders/*` - Order management
- `/api/subscriptions/*` - Milk delivery subscriptions
- `/api/admin/*` - Administrative functions

### Frontend State Management
- **Web**: Zustand stores with localStorage persistence
- **Mobile**: Zustand with AsyncStorage persistence
- **Auth Store**: User authentication and role management
- **Cart Store**: Shopping cart functionality

### Mobile App Navigation
Role-based tab navigation:
- **Customer Tabs**: Home, Products, Cart, Orders, Subscriptions, Profile
- **Agent Tabs**: Dashboard, Routes, Deliveries, Profile

## Key Development Patterns

### Database Queries
Uses Knex.js for database operations with migration-based schema management. All database interactions go through the `src/utils/database.js` utility.

### API Error Handling
Consistent error response format across all endpoints with appropriate HTTP status codes and user-friendly messages.

### Authentication Flow
1. Phone number submission → OTP generation
2. OTP verification → JWT token issuance  
3. Token-based API authentication with middleware validation
4. Role-based route protection

### Component Architecture
- **Web**: Page components in `src/pages/`, reusable components in `src/components/`
- **Mobile**: Screen components in `src/screens/`, common components in `src/components/`
- **Form Handling**: React Hook Form with Yup validation schemas

## Environment Configuration

### Backend (.env)
Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - development/production
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - SMS OTP (optional in dev)

### Frontend
- Uses proxy configuration in package.json for API calls in development
- No environment variables required for basic development

### Mobile App
- API configuration in `src/constants/index.ts`
- Expo configuration in `app.json`

## Development Workflow

### Adding New Features
1. Database changes: Create migration in `backend/migrations/`
2. API endpoints: Add routes in `backend/src/routes/`
3. Frontend integration: Update services in `src/services/`
4. State management: Update Zustand stores as needed

### Testing Strategy
- Backend: Jest with Supertest for API testing
- Frontend: React Testing Library
- Mobile: Jest with React Native testing utilities

### Database Development
- Always create migrations for schema changes
- Use `npm run db:reset` for clean development database
- Seed files provide sample data including admin user

## Demo Credentials

### Admin Access
- **Web URL**: http://localhost:3001/admin-login
- **Email**: admin@dairydelivery.com  
- **Password**: admin123

### User Access
- **Phone**: Any 10-digit number (e.g., 9876543210)
- **OTP**: Check backend console output in development mode

## Troubleshooting

### Common Issues
- **Database connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
- **OTP not received**: Check backend console for development OTP output
- **CORS errors**: Ensure backend server is running on port 3000
- **Mobile app connection**: Update API_CONFIG.BASE_URL for your development environment

### Port Configuration  
- Backend: 3000 (configurable via PORT env var)
- Web Frontend: 3001 (React development server)
- Mobile: Expo development server (typically 8081)