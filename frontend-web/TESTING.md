# 🧪 Dairy Delivery System - Testing Guide

This guide provides comprehensive testing instructions for the Dairy Delivery System.

## 📋 Pre-Testing Setup

### 1. Environment Setup
```bash
# Clone and setup (if not already done)
git clone https://github.com/yourusername/dairy-delivery-system.git
cd dairy-delivery-system

# Backend setup
cd backend
npm install
npm run migrate  # Create database tables
npm run seed     # Add sample data

# Frontend setup  
cd ../frontend-web
npm install
```

### 2. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # Starts on port 3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend-web
npm start   # Starts on port 3001
```

### 3. Access Points
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 🔐 Test Accounts

### Customer Account
- **Phone**: `+91 9876543210`
- **OTP**: Any 6-digit number (in development mode)

### Admin Account
- **URL**: http://localhost:3001/admin-login
- **Email**: `admin@dairy.com`
- **Password**: `admin123`

## 🧪 Testing Scenarios

### 1. User Authentication Flow

#### Customer Login (OTP-based)
1. Navigate to http://localhost:3001/login
2. Enter phone number: `9876543210`
3. Click "Send OTP"
4. Check backend console for OTP code
5. Enter the OTP and click "Verify"
6. Should be redirected to dashboard

**Expected Result**: ✅ Successful login with user dashboard

#### Admin Login
1. Navigate to http://localhost:3001/admin-login
2. Email: `admin@dairy.com`
3. Password: `admin123`
4. Click "Sign In"

**Expected Result**: ✅ Admin dashboard with analytics

### 2. Product Catalog Testing

#### Browse Products
1. Login as customer
2. Navigate to "Products" from dashboard
3. Verify products display with:
   - Product names and prices
   - Category filters work
   - Search functionality works
   - Add to cart buttons work

**Expected Result**: ✅ Product catalog displays with 10+ seeded products

#### Add to Cart
1. On products page, click "Add to Cart" on any product
2. Increase/decrease quantity using +/- buttons
3. Verify cart count updates in header
4. Navigate to cart page
5. Verify product appears with correct quantity and price

**Expected Result**: ✅ Cart functionality works correctly

### 3. Shopping Cart & Checkout

#### Cart Management
1. Add multiple products to cart
2. Change quantities in cart
3. Remove items from cart
4. Verify total calculations are correct

**Expected Result**: ✅ Cart operations work correctly

#### Checkout Process
1. With items in cart, click "Proceed to Checkout"
2. Fill in delivery address if not set
3. Select payment method
4. Click "Place Order"
5. Verify order confirmation

**Expected Result**: ✅ Order created successfully

### 4. Order Management

#### View Orders
1. From dashboard, click "My Orders"
2. Verify orders list displays
3. Check order details show correctly
4. Verify order status is displayed

**Expected Result**: ✅ Orders page shows placed orders

#### Order Filtering
1. On orders page, use status filter
2. Test different status filters (all, pending, delivered, etc.)

**Expected Result**: ✅ Filtering works correctly

### 5. Subscription Management

#### Create Subscription
1. From dashboard, click "Subscriptions"
2. Click "New Subscription"
3. Select a product
4. Choose quantity and frequency (Daily/Weekly/Monthly)
5. For weekly: Select delivery days
6. For monthly: Select delivery date
7. Set start date and time slot
8. Click "Create Subscription"

**Expected Result**: ✅ Subscription created successfully

#### Manage Subscriptions
1. View subscriptions list
2. Edit a subscription (change quantity, frequency)
3. Pause/Resume subscription
4. Cancel subscription

**Expected Result**: ✅ All subscription operations work

### 6. User Profile Management

#### Complete Profile
1. If profile incomplete, click "Complete Profile"
2. Fill in name, address, payment method
3. Save profile

**Expected Result**: ✅ Profile saved successfully

#### Update Profile
1. Navigate to profile page
2. Update information
3. Save changes

**Expected Result**: ✅ Profile updates successfully

### 7. Admin Dashboard Testing

#### Admin Analytics
1. Login as admin
2. Verify dashboard shows:
   - Total users count
   - Total orders count  
   - Revenue statistics
   - Recent orders list
   - Order status distribution

**Expected Result**: ✅ Analytics display real data

#### User Management
1. Click "Users" in admin sidebar
2. Verify user list displays
3. Test search and filter functionality
4. Verify user details are correct

**Expected Result**: ✅ User management works

#### Product Management
1. Click "Products" in admin sidebar
2. Verify product grid displays
3. Test category filters
4. Test product search

**Expected Result**: ✅ Product management displays

#### Order Processing
1. Click "Orders" in admin sidebar  
2. Verify orders table displays
3. Test search by order number
4. Test status filtering
5. Verify order details are complete

**Expected Result**: ✅ Order management works

## 🔍 API Testing

### Manual API Testing with curl/Postman

#### Health Check
```bash
curl http://localhost:3000/health
```
**Expected**: `{"status":"OK","timestamp":"...","uptime":...}`

#### Authentication
```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210"}'

# Verify OTP (check console for OTP)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","otp":"123456"}'
```

#### Products (requires auth token)
```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Automated API Tests
```bash
cd backend
npm test  # Runs Jest test suite
```

## 🚨 Common Issues & Troubleshooting

### Backend Issues

#### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or find and kill manually
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Database Issues
```bash
# Reset database
rm database.sqlite
npm run migrate
npm run seed
```

#### Module Not Found Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

#### Compilation Errors
```bash
# Clear React cache
rm -rf node_modules/.cache
npm start
```

#### API Connection Issues
1. Verify backend is running on port 3000
2. Check browser Network tab for failed requests
3. Verify CORS settings in backend

### Common Test Failures

#### Authentication Issues
- **Problem**: OTP not received
- **Solution**: Check backend console for OTP logs

#### Empty Data Issues  
- **Problem**: No products/orders show
- **Solution**: Run `npm run seed` in backend

#### CORS Errors
- **Problem**: API calls blocked by CORS
- **Solution**: Verify backend CORS configuration allows localhost:3001

## 📊 Performance Testing

### Load Testing (Optional)
```bash
# Install artillery
npm install -g artillery

# Run load tests
artillery quick --count 10 --num 5 http://localhost:3000/health
```

### Browser Performance
1. Open Chrome DevTools
2. Navigate to "Performance" tab
3. Record page load and interactions
4. Analyze metrics:
   - First Contentful Paint < 2s
   - Largest Contentful Paint < 4s
   - Time to Interactive < 5s

## ✅ Test Checklist

### Functional Tests
- [ ] User can register/login with OTP
- [ ] Admin can login with email/password  
- [ ] Product catalog loads with images and prices
- [ ] Shopping cart add/remove/update works
- [ ] Checkout process completes successfully
- [ ] Orders are created and displayed
- [ ] Subscriptions can be created and managed
- [ ] Profile can be updated
- [ ] Admin dashboard shows analytics
- [ ] Admin can manage users, products, orders

### UI/UX Tests  
- [ ] Responsive design works on mobile/tablet
- [ ] All forms have proper validation
- [ ] Loading states are shown during API calls
- [ ] Error messages are user-friendly
- [ ] Success notifications appear
- [ ] Navigation works correctly
- [ ] Back button behaves properly

### Security Tests
- [ ] Protected routes redirect to login
- [ ] JWT tokens expire correctly  
- [ ] Admin routes require admin role
- [ ] Input validation prevents XSS
- [ ] SQL injection protection works
- [ ] Rate limiting is enforced

### Performance Tests
- [ ] Pages load within 3 seconds
- [ ] API responses are under 500ms
- [ ] Images are optimized
- [ ] Bundle size is reasonable
- [ ] No memory leaks in long sessions

## 📝 Reporting Issues

When reporting issues, include:

1. **Environment**: Browser, OS, Node version
2. **Steps to Reproduce**: Detailed steps
3. **Expected Result**: What should happen
4. **Actual Result**: What actually happened
5. **Console Errors**: Any error messages
6. **Screenshots**: Visual issues

### Issue Template
```
**Environment:**
- OS: Windows 11
- Browser: Chrome 118
- Node: v18.17.0

**Steps to Reproduce:**
1. Navigate to products page
2. Click add to cart
3. Go to cart

**Expected:** Product appears in cart
**Actual:** Cart shows as empty
**Console Errors:** [paste any errors]
```

## 🎯 Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Core user journeys
- **Performance**: All pages < 3s load time
- **Accessibility**: WCAG 2.1 AA compliance

---

**Happy Testing! 🧪✨**

Report any issues to the development team for quick resolution.