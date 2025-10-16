# 🚀 Dairy Delivery System - Deployment Guide

This guide provides step-by-step instructions for deploying the Dairy Delivery System to production.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 10GB free space
- **Network**: Open ports 80 (HTTP) and 443 (HTTPS)

### Required Software
- [Docker](https://docs.docker.com/install/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- [Git](https://git-scm.com/downloads)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/dairy-delivery-system.git
cd dairy-delivery-system
```

### 2. Configure Environment Variables

#### Backend Configuration
```bash
cp backend/.env.production.example backend/.env.production
```

Edit `backend/.env.production` with your settings:
```env
# Essential Settings (MUST CHANGE)
JWT_SECRET=your-super-secure-jwt-secret-key-here-min-32-characters
NODE_ENV=production

# Database
DATABASE_PATH=/app/production.sqlite

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100

# CORS (Update with your domain)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

#### Frontend Configuration
```bash
cp frontend-web/.env.production.example frontend-web/.env.production
```

Edit `frontend-web/.env.production`:
```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
```

### 3. Run Deployment Script
```bash
chmod +x deploy.sh
./deploy.sh production
```

The script will:
- Build Docker images
- Create necessary volumes and networks
- Start all services
- Run health checks
- Optionally run database migrations and seed data

## 🌐 DNS & SSL Configuration

### Domain Setup
1. Point your domain to your server's IP address
2. Update environment variables with your actual domain
3. Configure SSL certificates (see SSL section below)

### SSL Certificate Setup (Recommended)

#### Option 1: Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add line: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Option 2: Custom SSL Certificate
1. Place your certificate files in `nginx/ssl/`
2. Update nginx configuration
3. Enable SSL profile in Docker Compose

## 📊 Monitoring & Maintenance

### Health Checks
- Backend: `http://your-domain.com:3000/health`
- Frontend: `http://your-domain.com/health`

### Useful Commands
```bash
# View service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update application
git pull
docker-compose -f docker-compose.prod.yml up --build -d

# Backup database
docker-compose -f docker-compose.prod.yml exec backend cp /app/production.sqlite /app/backups/backup-$(date +%Y%m%d).sqlite
```

### Log Monitoring
Logs are stored in Docker volumes:
- Backend logs: `dairy_logs:/app/logs`
- Nginx access logs: Available via `docker-compose logs frontend`

### Database Backups
```bash
# Manual backup
docker-compose -f docker-compose.prod.yml exec backend cp /app/production.sqlite /app/backups/manual-backup.sqlite

# Automated backup script (add to crontab)
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.prod.yml exec backend cp /app/production.sqlite /app/backups/backup_$DATE.sqlite
```

## 🔒 Security Checklist

### Essential Security Steps
- [ ] Change default JWT_SECRET in backend/.env.production
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall (UFW or iptables)
- [ ] Set up regular database backups
- [ ] Enable Docker security scanning
- [ ] Monitor application logs
- [ ] Use strong passwords for any admin accounts
- [ ] Keep Docker and system packages updated

### Firewall Configuration
```bash
# Ubuntu/Debian with UFW
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Optional: Restrict SSH to specific IPs
sudo ufw allow from YOUR_IP_ADDRESS to any port 22
```

## 📈 Performance Optimization

### Recommended Optimizations
1. **Enable HTTP/2** in nginx configuration
2. **Configure CDN** for static assets
3. **Set up Redis** for session storage (optional)
4. **Enable database query optimization**
5. **Configure proper caching headers**

### Scaling Considerations
- Use load balancer for multiple backend instances
- Separate database server for high traffic
- Implement horizontal scaling with container orchestration

## 🐛 Troubleshooting

### Common Issues

#### Services Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check system resources
docker system df
free -h
df -h
```

#### Database Issues
```bash
# Reset database (⚠️ DANGER: This deletes all data)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d

# Restore from backup
docker-compose -f docker-compose.prod.yml exec backend cp /app/backups/backup_YYYYMMDD.sqlite /app/production.sqlite
docker-compose -f docker-compose.prod.yml restart backend
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Test nginx configuration
docker-compose -f docker-compose.prod.yml exec frontend nginx -t
```

### Getting Help
1. Check application logs first
2. Verify environment configuration
3. Test network connectivity
4. Check Docker system resources
5. Consult the GitHub issues page

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Standard update process
git pull origin main
docker-compose -f docker-compose.prod.yml up --build -d

# With database migration
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec backend npm run migrate
```

### System Maintenance
- **Weekly**: Review logs and performance metrics
- **Monthly**: Update system packages and Docker images
- **Quarterly**: Security audit and dependency updates

## 📞 Support

For deployment support:
- 📧 Email: support@yourdomain.com
- 📖 Documentation: [GitHub Wiki](https://github.com/yourusername/dairy-delivery-system/wiki)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/dairy-delivery-system/issues)

---

**🥛 Happy Deploying! Your dairy delivery system is ready to serve customers worldwide.**