# 🧪 Complete Testing Guide - Dairy Delivery System

**Updated: October 16, 2024** - Now includes all recent fixes and new features!

This guide will help you test your entire Dairy Delivery System after major updates and bug fixes. We've fixed critical issues and added new functionality.

## 🎯 What We'll Test
- **Requirements**: Check if your computer has everything needed
- **Backend API**: Your Node.js server and database
- **Website**: Your React web application with new features
- **Mobile App**: Your React Native mobile application
- **Integration**: All parts working together
- **🆕 NEW**: Agent Dashboard, User Profile Management, Admin Subscription Management

---

## 🚨 CRITICAL FIXES IMPLEMENTED

**Before testing, know that we've fixed these major issues:**

### ✅ Fixed Issues
1. **API Routing Errors**: Fixed 404 errors for `/api/subscriptions` and `/api/orders`
2. **React Router Warnings**: Eliminated deprecation warnings
3. **Missing Static Assets**: Added favicon.ico and manifest.json
4. **Admin Dashboard**: Now fully functional with subscription management
5. **User Profile**: Replaced "Coming Soon" with complete profile system
6. **Geolocation**: Added location-based address entry
7. **Agent Dashboard**: Created complete delivery agent interface

### 🎯 New Test Accounts
- **Admin**: admin@dairydelivery.com / admin123
- **User**: Any phone (9876543210) / Check console for OTP
- **Agent**: Create agent user in database with role='agent'

---

## 🔍 PART 1: Check System Requirements

### Step 1: Verify Your Computer Setup

#### 1.1 Check Node.js Installation
1. **Open Command Prompt** (Press `Windows + R`, type `cmd`, press Enter)
2. **Check Node.js version**:
   ```bash
   node --version
   ```
   **Expected result**: Should show `v18.x.x` or higher
   **If not installed**: Download from [nodejs.org](https://nodejs.org) (LTS version)

3. **Check npm version**:
   ```bash
   npm --version
   ```
   **Expected result**: Should show `9.x.x` or higher

#### 1.2 Check Git Installation
```bash
git --version
```
**Expected result**: Should show `git version 2.x.x`
**If not installed**: Download from [git-scm.com](https://git-scm.com)

#### 1.3 Check PostgreSQL Installation
```bash
psql --version
```
**Expected result**: Should show `psql (PostgreSQL) 12.x` or higher

**If PostgreSQL is not installed:**
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. **Remember the password** you set for the `postgres` user
4. Make sure PostgreSQL service is running

#### 1.4 Verify Project Files
1. **Navigate to your project folder**:
   ```bash
   cd C:\Users\Naresh\dairy-delivery-system
   ```

2. **List all folders**:
   ```bash
   dir
   ```
   **Expected result**: Should see folders: `backend`, `frontend-web`, `mobile-app`, `docs`

**✅ Requirements Checklist:**
- [ ] Node.js v18+ installed
- [ ] npm v9+ installed  
- [ ] Git installed
- [ ] PostgreSQL v12+ installed and running
- [ ] All project folders present

---

## 🗄️ PART 2: Test Backend (API Server)

### Step 1: Setup Backend Environment

#### 1.1 Navigate to Backend Folder
```bash
cd backend
```

#### 1.2 Install Backend Dependencies
```bash
npm install
```
**Wait time**: 2-5 minutes
**What happens**: Downloads all required packages

#### 1.3 Setup Environment File
1. **Copy the example environment file**:
   ```bash
   copy .env.example .env
   ```

2. **Edit the .env file**:
   - Open `.env` file in Notepad
   - Update these lines:
   ```
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/dairy_delivery_db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```
   - **Replace `yourpassword`** with your PostgreSQL password
   - Save the file

### Step 2: Setup Database

#### 2.1 Create Database
1. **Open PostgreSQL command line** (Search "SQL Shell" in Start menu)
2. **Press Enter** for default values until password prompt
3. **Enter your PostgreSQL password**
4. **Create database**:
   ```sql
   CREATE DATABASE dairy_delivery_db;
   \q
   ```

#### 2.2 Run Database Migrations
**Back in Command Prompt (in backend folder):**
```bash
npm run migrate
```
**Expected result**: Should show "Migration completed" or similar success message

#### 2.3 Add Sample Data
```bash
npm run seed
```
**Expected result**: Should show "Seeds completed" or similar success message

### Step 3: Test Backend Server

#### 3.1 Start Backend Server
```bash
npm run dev
```

**Expected result**: 
```
Server running on port 3000
Database connected successfully
```

**Keep this window open** - the server needs to keep running

#### 3.2 Test API Health Check
1. **Open new Command Prompt** (don't close the first one)
2. **Test health endpoint**:
   ```bash
   curl http://localhost:3000/health
   ```
   **Expected result**: `{"status":"OK","timestamp":"...","database":"connected"}`

**Alternative test (using browser):**
- Open browser and go to: `http://localhost:3000/health`
- Should see JSON response with "OK" status

### Step 4: Test API Endpoints

#### 4.1 Test User Registration (OTP)
```bash
curl -X POST http://localhost:3000/api/auth/send-otp -H "Content-Type: application/json" -d "{\"phone\": \"9876543210\"}"
```

**Expected result**: 
- API returns success message
- **Check the backend console** - you should see the OTP code printed (like "OTP: 123456")

#### 4.2 Test OTP Verification
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp -H "Content-Type: application/json" -d "{\"phone\": \"9876543210\", \"otp\": \"123456\"}"
```
**Replace "123456" with the actual OTP from backend console**

**Expected result**: Should return a JWT token

#### 4.3 Test Product Listing
```bash
curl http://localhost:3000/api/products
```
**Expected result**: Should return list of dairy products from seed data

**✅ Backend Testing Checklist:**
- [ ] Dependencies installed successfully
- [ ] Environment file configured
- [ ] Database created and connected
- [ ] Migrations ran successfully
- [ ] Seed data added
- [ ] Server starts without errors
- [ ] Health check returns OK
- [ ] OTP sending works
- [ ] OTP verification works
- [ ] Product API returns data

---

## 🌐 PART 3: Test Website (Frontend)

### Step 1: Setup Website

#### 1.1 Navigate to Frontend Folder
**Open new Command Prompt:**
```bash
cd C:\Users\Naresh\dairy-delivery-system\frontend-web
```

#### 1.2 Install Frontend Dependencies
```bash
npm install
```
**Wait time**: 3-7 minutes
**What happens**: Downloads React and all required packages

### Step 2: Start Website

#### 2.1 Start Development Server
```bash
npm start
```

**Expected result**:
- Compiling... 
- Compiled successfully!
- Browser opens automatically to `http://localhost:3001`

**If browser doesn't open**: Manually go to `http://localhost:3001`

### Step 3: Test Website Features

#### 3.1 Test Landing Page
**What to check:**
- [ ] Page loads without errors
- [ ] "DairyFresh" title visible
- [ ] Navigation menu appears
- [ ] "Get Started" or "Login" buttons work
- [ ] Page looks good on different screen sizes

#### 3.2 Test User Login
1. **Click "Login" button**
2. **Enter phone number**: `9876543210`
3. **Click "Send OTP"**
4. **Check backend console** for OTP code
5. **Enter the OTP** and click verify
6. **Expected result**: Should redirect to user dashboard

#### 3.3 Test Admin Login
1. **Go to**: `http://localhost:3001/admin-login`
2. **Enter credentials**:
   - **Email**: `admin@dairydelivery.com`
   - **Password**: `admin123`
3. **Click "Login"**
4. **Expected result**: Should redirect to admin dashboard

#### 3.4 Test Navigation
**After logging in as user:**
- [ ] Dashboard page loads
- [ ] Navigation menu works
- [ ] User profile shows correct info
- [ ] Logout button works

**After logging in as admin:**
- [ ] Admin dashboard loads  
- [ ] Admin navigation menu appears
- [ ] Statistics/metrics visible (even if dummy data)
- [ ] Admin logout works

### Step 4: Test API Integration

#### 4.1 Check Browser Console
1. **Press F12** to open browser developer tools
2. **Click "Console" tab**
3. **Look for errors** (red text)

**Common issues:**
- **CORS errors**: Backend not running
- **Network errors**: Wrong API URL
- **401 errors**: Authentication problems

#### 4.2 Test Data Loading
**In user dashboard:**
- [ ] Products load (even if empty)
- [ ] User profile shows data
- [ ] No error messages appear

### 🆕 PART 3.5: Test New Features

#### 3.5.1 Test Admin Subscription Management
1. **Login as admin**
2. **Navigate to "Subscriptions" tab** (new!)
3. **Test filters**: All Statuses, Active, Paused, Cancelled
4. **Test frequency filters**: Daily, Weekly, Monthly
5. **Test actions**: Pause, Resume, Cancel subscription
6. **Expected result**: 
   - Stats cards show correct counts
   - Table displays subscription data
   - Filter buttons work
   - Status updates work (mock data for now)

#### 3.5.2 Test User Profile Management
1. **Login as regular user**
2. **Navigate to "/profile"** (was "Coming Soon")
3. **Test profile editing**:
   - Click "Edit" button
   - Update name, email, phone
   - Click "Save"
4. **Test address management**:
   - Click "Add Address" 
   - Fill address form
   - Click "Use Current Location" (allow browser location)
   - Save address
   - Set as default
   - Delete address
5. **Expected result**:
   - Profile updates successfully
   - Geolocation fills address fields
   - Address CRUD operations work
   - Toast notifications appear

#### 3.5.3 Test Agent Dashboard
1. **Create agent user in database** (role='agent')
2. **Login with agent phone number**
3. **Should redirect to "/agent"**
4. **Test agent features**:
   - View delivery stats
   - See today's route info
   - Update delivery statuses
   - Navigate between agent tabs
5. **Expected result**:
   - Agent dashboard loads
   - Mock delivery data displays
   - Status update buttons work
   - Agent-specific navigation

#### 3.5.4 Verify Fixed Issues
1. **Check browser console** - should be clean
2. **Test favicon** - should load without 404
3. **Check manifest.json** - should load without error
4. **Navigate between pages** - no React Router warnings
5. **Test API calls** - no subscription/order 404 errors

**✅ Website Testing Checklist:**
- [ ] Dependencies installed successfully
- [ ] Development server starts
- [ ] Landing page loads correctly
- [ ] User login works with OTP
- [ ] Admin login works with email/password
- [ ] Navigation between pages works
- [ ] No console errors
- [ ] API calls succeed
- [ ] Responsive design works
- [ ] **NEW**: Admin subscription management works
- [ ] **NEW**: User profile management works
- [ ] **NEW**: Agent dashboard accessible
- [ ] **NEW**: Geolocation address entry works
- [ ] **FIXED**: No 404 errors for static assets
- [ ] **FIXED**: No React Router warnings

---

## 📱 PART 4: Test Mobile App

### Step 1: Setup Mobile App

#### 1.1 Install Expo CLI
```bash
npm install -g @expo/cli
```

#### 1.2 Navigate to Mobile App Folder
```bash
cd C:\Users\Naresh\dairy-delivery-system\mobile-app
```

#### 1.3 Install Mobile Dependencies
```bash
npm install
```
**Wait time**: 5-10 minutes

### Step 2: Start Mobile App

#### 2.1 Start Expo Development Server
```bash
npm start
```

**Expected result**:
- Expo DevTools opens in browser
- QR code appears
- Metro bundler starts

### Step 3: Test on Device/Simulator

#### 3.1 Test on Physical Phone (Recommended)
1. **Install Expo Go app** from Google Play Store
2. **Scan the QR code** with Expo Go app
3. **Wait for app to load** (2-5 minutes first time)

#### 3.2 Alternative: Test in Browser
1. **In Expo DevTools**, click "Run in web browser"
2. **Wait for compilation**
3. **Mobile app loads in browser**

### Step 4: Test Mobile App Features

#### 4.1 Test App Launch
**What to check:**
- [ ] Splash screen appears
- [ ] App loads without crashing
- [ ] Welcome/Auth screen shows
- [ ] Navigation works

#### 4.2 Test Authentication
1. **Tap "Get Started" or "Login"**
2. **Enter phone number**: `9876543210`
3. **Tap "Send OTP"**
4. **Check backend console** for OTP
5. **Enter OTP** and verify
6. **Expected result**: Should navigate to main app

#### 4.3 Test Main Navigation
**After login:**
- [ ] Tab navigation appears at bottom
- [ ] All tabs are clickable
- [ ] Home screen loads
- [ ] Profile screen shows user info
- [ ] No crash errors

#### 4.4 Test App Performance
**Performance checks:**
- [ ] Smooth animations
- [ ] Fast screen transitions  
- [ ] No loading delays
- [ ] Touch responses work

### Step 5: Test API Connection

#### 5.1 Check Mobile API Calls
**In mobile app:**
1. **Check if data loads** (products, user info)
2. **Try different features** (cart, orders if implemented)
3. **Test logout and login again**

#### 5.2 Debug Connection Issues
**If API calls fail:**
1. **Check mobile-app/src/constants/index.ts**
2. **Verify API_CONFIG.BASE_URL** points to: `http://localhost:3000/api`
3. **For physical device**: Replace `localhost` with your computer's IP address

**✅ Mobile App Testing Checklist:**
- [ ] Expo CLI installed
- [ ] Dependencies installed successfully
- [ ] Development server starts
- [ ] App loads on device/simulator
- [ ] Authentication flow works
- [ ] Main navigation functional
- [ ] API calls succeed
- [ ] No crash errors
- [ ] Performance is acceptable

---

## 🔄 PART 5: Integration Testing

### Step 1: Full System Test

#### 1.1 Ensure All Services Running
**You should have these running:**
- [ ] Backend server (`npm run dev` in backend folder)
- [ ] Website (`npm start` in frontend-web folder)  
- [ ] Mobile app (`npm start` in mobile-app folder)
- [ ] PostgreSQL database service

#### 1.2 Test Cross-Platform Data Sync
1. **Register new user on website** with phone: `9876543211`
2. **Login to mobile app** with same phone: `9876543211`
3. **Expected result**: Same user data appears on both platforms

#### 1.3 Test Admin Functions
1. **Login as admin on website**
2. **Check user management** (should see registered users)
3. **Test subscription management** (NEW - should show subscription table)
4. **Test any admin features** that are implemented
5. **Verify subscription actions work** (pause/resume/cancel)

### Step 2: Load Testing (Basic)

#### 2.1 Test Multiple Users
1. **Open multiple browser tabs**
2. **Login with different phone numbers** in each tab
3. **Expected result**: All sessions work independently

#### 2.2 Test API Performance
```bash
# Test 10 rapid API calls
for /L %i in (1,1,10) do curl http://localhost:3000/health
```

**Expected result**: All requests should return successfully

### Step 3: Error Testing

#### 3.1 Test Invalid Inputs
**On website and mobile:**
- [ ] Try invalid phone numbers
- [ ] Try wrong OTP codes
- [ ] Try accessing pages without login
- [ ] Expected result: Proper error messages, no crashes

#### 3.2 Test Network Issues
1. **Stop backend server**
2. **Try using website/mobile app**
3. **Expected result**: User-friendly error messages
4. **Restart backend server**
5. **Expected result**: App recovers and works again

**✅ Integration Testing Checklist:**
- [ ] All three systems run simultaneously
- [ ] Data syncs between web and mobile
- [ ] Admin functions work properly
- [ ] Multiple users can use system
- [ ] Error handling works correctly
- [ ] System recovers from failures

---

## 🐛 PART 6: Common Issues and Fixes

### Backend Issues

**"Cannot connect to database"**
- **Fix**: Check PostgreSQL is running, verify DATABASE_URL in .env

**"Port 3000 already in use"**
- **Fix**: Stop other processes using port 3000 or change PORT in .env

**"Migration failed"**
- **Fix**: Drop database and recreate: `DROP DATABASE dairy_delivery_db; CREATE DATABASE dairy_delivery_db;`

### Website Issues

**"npm start fails"**
- **Fix**: Delete `node_modules` folder and run `npm install` again

**"Page not loading"**
- **Fix**: Check backend is running on port 3000

**"API calls failing"**
- **Fix**: Check browser console, verify API endpoints

### Mobile App Issues

**"Expo app crashes"**
- **Fix**: Clear Expo cache: `expo start --clear`

**"Cannot connect to API"**
- **Fix**: For physical device, use computer IP instead of localhost

**"Build errors"**
- **Fix**: Delete `node_modules`, run `npm install` again

### General Issues

**"Out of memory" errors**
- **Fix**: Close other applications, restart command prompts

**"Permission denied" errors**
- **Fix**: Run Command Prompt as Administrator

### New Features Issues

**"Subscriptions tab not showing in admin"**
- **Fix**: Clear browser cache, ensure latest code is loaded

**"Profile page still shows 'Coming Soon'"**
- **Fix**: Hard refresh browser (Ctrl+F5), verify latest frontend code

**"Geolocation not working"**
- **Fix**: Allow location permissions in browser, use HTTPS in production

**"Agent dashboard not accessible"**
- **Fix**: Ensure user role is set to 'agent' in database

**"API 404 errors for subscriptions"**
- **Fix**: Verify backend server is running latest code with subscription routes

---

## ✅ PART 7: Testing Success Checklist

### System Requirements ✅
- [ ] Node.js v18+ installed and working
- [ ] PostgreSQL installed and running
- [ ] All project folders present
- [ ] Git installed and working

### Backend API ✅
- [ ] Dependencies installed without errors
- [ ] Database created and connected
- [ ] Migrations completed successfully
- [ ] Seed data added
- [ ] Server starts and runs continuously
- [ ] Health check API returns OK
- [ ] Authentication endpoints work
- [ ] Product API returns data
- [ ] No console errors

### Website Frontend ✅  
- [ ] Dependencies installed successfully
- [ ] Development server starts
- [ ] Landing page loads properly
- [ ] User registration/login works
- [ ] Admin login works
- [ ] Navigation between pages functional
- [ ] API integration successful
- [ ] No browser console errors
- [ ] Responsive design works
- [ ] **NEW**: Admin subscription management functional
- [ ] **NEW**: User profile management complete
- [ ] **NEW**: Address management with geolocation
- [ ] **NEW**: Agent dashboard accessible
- [ ] **FIXED**: All API routing errors resolved
- [ ] **FIXED**: Static assets load without errors
- [ ] **FIXED**: React Router warnings eliminated

### Mobile App ✅
- [ ] Expo CLI installed globally
- [ ] App dependencies installed
- [ ] Development server starts
- [ ] App loads on device/emulator
- [ ] Authentication flow complete
- [ ] Tab navigation works
- [ ] API calls successful
- [ ] No crash errors
- [ ] Acceptable performance

### Integration ✅
- [ ] All three systems run together
- [ ] Cross-platform data consistency
- [ ] Multiple user sessions work
- [ ] Error handling appropriate
- [ ] System recovery functional
- [ ] Load testing passed

## 🎉 Ready for Deployment!

**Congratulations!** If all items above are checked ✅, your Dairy Delivery System is fully tested and ready for deployment!

### Next Steps:
1. **Commit your tested code** to GitHub
2. **Follow the DEPLOYMENT_GUIDE.md** 
3. **Start with Google Play Console** account setup
4. **Deploy website to Netlify**
5. **Deploy backend to Railway**

### Before You Deploy:
- [ ] All tests passing
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] User experience smooth
- [ ] Admin functions working

**Your system is production-ready! 🚀**

---

*Remember: Testing is ongoing. After deployment, continue monitoring for issues and user feedback to improve your system.*