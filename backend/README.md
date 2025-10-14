# Dairy Delivery System - Backend API

Node.js + Express + PostgreSQL backend for the Dairy Supply & Delivery System.

## 🚀 Quick Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Setup PostgreSQL database**
```bash
# Create database
createdb dairy_delivery_db

# Or using psql
psql -c "CREATE DATABASE dairy_delivery_db;"
```

3. **Configure environment**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
DATABASE_URL=postgresql://username:password@localhost:5432/dairy_delivery_db
```

4. **Run database migrations**
```bash
npm run migrate
```

5. **Seed sample data**
```bash
npm run seed
```

6. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📋 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run db:reset` - Reset database (rollback, migrate, seed)

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port (default: 3000) | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account SID for SMS | No* |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | No* |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | No* |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No* |

*Required for production features like SMS OTP and Google Sign-in

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/google` - Google Sign-in

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/addresses` - Get addresses
- `POST /api/users/addresses` - Add address

### Products
- `GET /api/products` - Get active products
- `GET /api/products/milk` - Get milk products
- `GET /api/products/:id` - Get product details

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order

## 🧪 Testing the API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Send OTP (Development Mode)
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

### 3. Verify OTP (Check console for OTP)
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'
```

### 4. Get Products (using token from login)
```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🗃️ Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - User accounts (customers, agents, admins)
- `addresses` - User delivery addresses
- `products` - Dairy products catalog
- `orders` & `order_items` - Customer orders
- `subscriptions` & `subscription_deliveries` - Milk subscriptions
- `routes` & `route_stops` - Delivery route management
- `invoices`, `payments`, `ledger_entries` - Billing system

## 🔒 Authentication

The API uses JWT-based authentication with phone number verification:

1. **Send OTP**: User requests OTP via phone number
2. **Verify OTP**: User verifies OTP and receives JWT token
3. **Use Token**: Include token in Authorization header for protected routes

## 🎯 Development Features

- **Development OTP**: OTPs are logged to console in development mode
- **Sample Data**: Seed script includes sample products and data
- **Auto-reload**: Development server restarts on file changes
- **Error Logging**: Detailed error messages in development

## 🚢 Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure `JWT_SECRET`
4. Configure Twilio for SMS
5. Setup Google OAuth credentials
6. Use process manager (PM2, Docker)
7. Setup reverse proxy (Nginx)
8. Configure SSL certificates

## 📝 API Documentation

For detailed API documentation, see the `/docs/api/` directory or run the development server and visit the health endpoint for basic API information.