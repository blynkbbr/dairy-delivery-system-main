# Cron Jobs Documentation

This document describes the automated task scheduling system implemented in the Dairy Delivery System.

## Overview

The system uses `node-cron` to schedule and execute recurring tasks automatically. These tasks handle critical business operations like:

- Daily route generation for delivery agents
- Invoice generation and billing
- Subscription delivery scheduling
- Data cleanup and maintenance
- Invoice status management

## Configuration

### Environment Variables

```bash
# Enable/disable cron jobs
ENABLE_CRON_JOBS=true

# Timezone for cron job scheduling
TZ=Asia/Kolkata
```

### Initialization

Cron jobs are automatically initialized when the server starts, unless disabled via environment variable:

```javascript
// In server.js
if (process.env.ENABLE_CRON_JOBS !== 'false') {
  initializeCronJobs();
}
```

## Scheduled Tasks

### 1. Daily Route Generation
**Schedule**: `0 23 * * *` (11:00 PM daily)
**Purpose**: Generate optimized delivery routes for the next day
**Details**: 
- Fetches all scheduled deliveries for tomorrow
- Groups deliveries by geographic clusters
- Assigns routes to available delivery agents
- Creates route stops with optimal sequence

### 2. Weekly Invoice Generation
**Schedule**: `0 6 * * 1` (6:00 AM every Monday)
**Purpose**: Generate invoices for weekly billing customers
**Details**:
- Creates invoices for customers with weekly billing cycles
- Calculates totals from delivered items in the past week
- Sends invoices to customers (when notification system is implemented)

### 3. Monthly Invoice Generation
**Schedule**: `0 6 1 * *` (6:00 AM on 1st of every month)
**Purpose**: Generate invoices for monthly billing customers
**Details**:
- Creates invoices for customers with monthly billing cycles
- Calculates totals from delivered items in the past month
- Handles pro-rated billing for partial months

### 4. Subscription Deliveries Update
**Schedule**: `0 0 * * *` (12:00 AM daily)
**Purpose**: Create delivery records for active subscriptions
**Details**:
- Scans all active subscriptions
- Creates delivery records for subscriptions scheduled for today
- Checks delivery days configuration for each subscription
- Prevents duplicate delivery creation

### 5. Data Cleanup
**Schedule**: `0 2 * * 0` (2:00 AM every Sunday)
**Purpose**: Clean up old data to maintain database performance
**Details**:
- Removes delivered subscription deliveries older than 6 months
- Cleans up completed routes older than 6 months
- Removes paid invoices older than 1 year
- Maintains referential integrity

### 6. Overdue Invoice Check
**Schedule**: `0 9 * * *` (9:00 AM daily)
**Purpose**: Mark invoices as overdue
**Details**:
- Finds invoices past their due date
- Updates status from 'sent' to 'overdue'
- Triggers notifications (when implemented)

## Manual Triggers

Administrators can manually trigger any scheduled task through the admin API:

### Available Endpoints

```http
POST /api/admin/jobs/routes/today
POST /api/admin/jobs/routes/tomorrow
POST /api/admin/jobs/invoices/weekly
POST /api/admin/jobs/invoices/monthly
POST /api/admin/jobs/subscriptions/update
POST /api/admin/jobs/invoices/mark-overdue
POST /api/admin/jobs/cleanup
```

### Example Usage

```bash
# Generate routes for today
curl -X POST http://localhost:3000/api/admin/jobs/routes/today \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Generate weekly invoices
curl -X POST http://localhost:3000/api/admin/jobs/invoices/weekly \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Error Handling

All cron jobs include comprehensive error handling:

- Errors are logged with descriptive messages
- Failed jobs don't crash the server
- Each job runs independently
- Detailed error information is provided for debugging

### Log Examples

```
✅ All cron jobs initialized successfully
⏰ Running daily route generation...
✅ Generated 12 routes for 2024-01-15
❌ Weekly invoice generation failed: Database connection error
```

## Best Practices

### 1. Timezone Configuration
Always set the timezone explicitly to ensure consistent scheduling:
```bash
TZ=Asia/Kolkata
```

### 2. Monitoring
Monitor cron job execution through:
- Server logs
- Admin dashboard statistics
- Database query performance

### 3. Testing
Test cron jobs manually using admin endpoints before relying on automatic scheduling:
```javascript
// Test route generation
const routes = await manualTriggers.generateTodayRoutes();
console.log(`Generated ${routes.length} routes`);
```

### 4. Database Performance
- Regular cleanup prevents database bloat
- Monitor query performance during peak times
- Consider indexing frequently queried columns

### 5. Backup Strategy
- Schedule database backups outside of business-critical cron windows
- Ensure backup completion before data cleanup runs

## Troubleshooting

### Common Issues

1. **Cron jobs not running**
   - Check `ENABLE_CRON_JOBS` environment variable
   - Verify server timezone settings
   - Check server logs for initialization errors

2. **Route generation failures**
   - Ensure delivery agents are available
   - Check geographic data integrity
   - Verify Google Maps API key (if using)

3. **Invoice generation errors**
   - Validate customer billing information
   - Check subscription and delivery data consistency
   - Ensure pricing information is current

4. **Memory issues during cleanup**
   - Process data in smaller batches
   - Monitor memory usage during cleanup operations
   - Consider running cleanup during low-traffic periods

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

This provides additional debugging information in the console output.

## Architecture

### File Structure
```
backend/src/services/
├── cronJobs.js          # Main cron job service
├── routeOptimization.js # Route generation logic
└── billingService.js    # Invoice and billing logic

backend/src/routes/
└── admin.js             # Manual trigger endpoints
```

### Dependencies
- `node-cron`: Task scheduling
- `moment`: Date/time manipulation
- `knex`: Database operations

### Integration Points
- Authentication middleware for admin endpoints
- Database connection for all operations
- External APIs (Google Maps for routing)
- Notification system (future implementation)

## Future Enhancements

1. **Notification Integration**
   - SMS notifications for delivery updates
   - Email invoices and receipts
   - Push notifications for mobile app

2. **Advanced Analytics**
   - Cron job performance metrics
   - Business intelligence dashboards
   - Predictive analytics for demand forecasting

3. **Failover and Recovery**
   - Retry mechanisms for failed jobs
   - Dead letter queues for critical operations
   - Health check monitoring

4. **Horizontal Scaling**
   - Distributed cron job execution
   - Load balancing for intensive operations
   - Database sharding strategies

## Security Considerations

- Admin endpoints require proper authentication
- Sensitive operations are logged but not exposed
- Database operations use parameterized queries
- Rate limiting applied to manual trigger endpoints

This cron job system provides a robust foundation for automated operations in the Dairy Delivery System, ensuring reliable execution of critical business processes.