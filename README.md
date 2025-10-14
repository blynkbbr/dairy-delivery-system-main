# Dairy Supply & Delivery System

A comprehensive system for managing dairy product subscriptions and deliveries in Coimbatore (daily milk) and Tamil Nadu (catalog orders).

## 🏗️ Architecture

- **Backend**: Node.js + Express + PostgreSQL
- **Web Frontend**: React + TypeScript
- **Mobile App**: React Native
- **Shared**: Common types and utilities

## 👥 User Roles

- **User**: Order dairy products, manage subscriptions
- **Delivery Agent**: Manage delivery routes and mark completions
- **Admin**: Full system management and analytics

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)
- React Native development environment (for mobile - coming soon)

### Setup

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your PostgreSQL database URL in .env
npm run migrate  # Setup database tables
npm run seed     # Add sample data including admin user
npm run dev      # Start backend server (port 3000)
```

2. **Web Frontend**
```bash
cd frontend-web
npm install
npm start        # Start web app (port 3001)
```

3. **Access the Application**
- **Website**: http://localhost:3001
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 🎭 Demo Credentials

### Admin Login
- **URL**: http://localhost:3001/admin-login
- **Email**: admin@dairydelivery.com
- **Password**: admin123

### User Login
- **URL**: http://localhost:3001/login
- **Phone**: Any 10-digit number (e.g., 9876543210)
- **OTP**: Check backend console for OTP in development mode

## 📱 Features

### ✅ Completed Features

#### Authentication & Security
- Phone/OTP authentication with Twilio integration
- Hardcoded admin login (admin@dairydelivery.com / admin123)
- JWT-based session management
- Role-based access control (user, agent, admin)
- Protected routes and middleware

#### Beautiful UI/UX
- **Landing Page**: Modern, animated hero section with milk splash
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Admin Portal**: Dark theme with professional styling
- **Form Validation**: Real-time validation with beautiful error states
- **Loading States**: Smooth loading animations and micro-interactions

#### Backend API
- RESTful API with Express.js and PostgreSQL
- Complete database schema for all entities
- User management and authentication endpoints
- Product catalog API (ready for frontend integration)
- Order management system foundation
- Subscription and delivery management structure

### 🚧 In Development

#### User Features
- Daily milk subscription management
- One-time catalog orders
- Order tracking and history
- Address management
- Invoice and payment tracking

#### Delivery Agent Features
- Route optimization and management
- Delivery marking and proof upload
- Real-time GPS tracking
- Daily delivery schedules

#### Admin Features
- Product and inventory management dashboard
- User and agent management interface
- Route planning and optimization
- Billing and invoice generation
- Analytics dashboard
- System monitoring tools

## 📁 Project Structure

```
dairy-delivery-system/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, validation, etc.
│   │   └── utils/           # Helper functions
│   ├── migrations/          # Database migrations
│   └── seeds/              # Sample data
├── frontend-web/           # React web application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API calls
│   │   └── utils/          # Helper functions
├── mobile-app/             # React Native app
│   ├── src/
│   │   ├── components/     # Mobile components
│   │   ├── screens/        # Screen components
│   │   ├── navigation/     # Navigation setup
│   │   └── services/       # API integration
├── shared/                 # Shared types and utilities
│   ├── types/              # TypeScript definitions
│   └── constants/          # Shared constants
└── docs/                   # Documentation
    ├── api/                # API documentation
    ├── deployment/         # Deployment guides
    └── development/        # Development guides
```

## 🔧 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dairy_db
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/google` - Google Sign-in

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/addresses` - Get user addresses

### Products
- `GET /api/products` - Get active products
- `GET /api/products/:id` - Get product details

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - Get user subscriptions
- `PUT /api/subscriptions/:id` - Update subscription

## 📊 Database Schema

Key entities:
- Users (customers, agents, admins)
- Products (dairy items)
- Orders & Order Items
- Subscriptions & Subscription Deliveries
- Routes & Route Stops
- Invoices & Payments
- Addresses with geocoding

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Phone number verification
- Rate limiting
- Input validation and sanitization

## 📈 Analytics & Monitoring

- Revenue tracking
- Delivery performance metrics
- Customer analytics
- Agent performance monitoring
- Real-time system health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details