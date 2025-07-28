# Production Deployment Guide - Axion ERP

## 🚀 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in all production environment variables
- [ ] Set up production Clerk application
- [ ] Set up production Supabase project
- [ ] Configure domain SSL certificates

### 2. Database Preparation
- [ ] Run `database/production-setup.sql` in production Supabase
- [ ] Enable Row Level Security (RLS) 
- [ ] Configure database backups
- [ ] Set up monitoring alerts

### 3. Security Configuration
- [ ] Review Content Security Policy in middleware
- [ ] Configure rate limiting settings
- [ ] Set up proper CORS policies
- [ ] Enable Supabase API rate limiting

## 📦 Deployment Steps

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Production ready build"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically

3. **Configure Custom Domain**
   - Add custom domain in Vercel
   - Update DNS records
   - SSL automatically configured

### Option 2: Docker Deployment

1. **Build Docker Image**
   ```dockerfile
   # Dockerfile (create this file)
   FROM node:18-alpine AS base
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   FROM node:18-alpine AS build
   WORKDIR /app
   COPY . .
   RUN npm ci
   RUN npm run build

   FROM node:18-alpine AS runtime
   WORKDIR /app
   COPY --from=base /app/node_modules ./node_modules
   COPY --from=build /app/.next ./.next
   COPY --from=build /app/public ./public
   COPY --from=build /app/package.json ./package.json

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Deploy with Docker**
   ```bash
   docker build -t axion-erp .
   docker run -p 3000:3000 --env-file .env.production axion-erp
   ```

### Option 3: VPS/Cloud Server

1. **Server Setup**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   npm install -g pm2

   # Clone repository
   git clone your-repo-url
   cd axion
   ```

2. **Install and Build**
   ```bash
   npm ci
   npm run build
   ```

3. **Start with PM2**
   ```bash
   # ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'axion-erp',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }

   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## 🔒 Security Hardening

### 1. Supabase Security
```sql
-- Run these in Supabase SQL editor
-- Enable RLS on all tables
SELECT 'ALTER TABLE ' || tablename || ' ENABLE ROW LEVEL SECURITY;'
FROM pg_tables WHERE schemaname = 'public';

-- Create security audit log
CREATE TABLE security_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type varchar(50) NOT NULL,
  user_id uuid,
  ip_address inet,
  user_agent text,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);
```

### 2. Environment Variables Validation
Add to your app startup:
```javascript
// In your main layout or app file
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY'
  ]
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
```

## 📊 Monitoring Setup

### 1. Application Monitoring
```bash
# Install monitoring packages
npm install @sentry/nextjs
```

### 2. Database Monitoring
- Enable Supabase monitoring dashboard
- Set up alerts for:
  - High query times
  - Error rates
  - Connection limits
  - Storage usage

### 3. Uptime Monitoring
Set up monitoring with services like:
- UptimeRobot
- Pingdom
- StatusCake

## 🔄 Backup Strategy

### 1. Database Backups
- Enable Supabase automatic backups
- Set retention period to 7+ days
- Test restore procedures monthly

### 2. Application Backups
- Repository code backed up to GitHub
- Environment variables documented
- Configuration files versioned

## 🚨 Incident Response

### 1. Error Monitoring
- Set up Sentry or similar for error tracking
- Configure alerts for critical errors
- Create runbooks for common issues

### 2. Rollback Procedures
```bash
# Quick rollback with Vercel
vercel --prod --confirm

# Rollback with PM2
pm2 stop axion-erp
git checkout previous-stable-tag
npm ci
npm run build
pm2 start axion-erp
```

## 📈 Performance Optimization

### 1. CDN Setup
- Use Vercel's built-in CDN
- Or configure CloudFlare for custom domains

### 2. Database Optimization
- Monitor query performance in Supabase
- Add indexes as needed
- Consider connection pooling

### 3. Caching Strategy
- Enable Vercel/CloudFlare caching
- Implement API response caching
- Use SWR for client-side caching

## ✅ Post-Deployment Checklist

- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Database operations function
- [ ] API rate limiting is active
- [ ] Security headers are set
- [ ] Monitoring is collecting data
- [ ] Backups are configured
- [ ] SSL certificate is valid
- [ ] Performance is acceptable
- [ ] Error tracking is working

## 🆘 Support & Maintenance

### Regular Tasks
- **Weekly**: Review error logs and performance metrics
- **Monthly**: Update dependencies and security patches  
- **Quarterly**: Review and test backup/restore procedures
- **Annually**: Security audit and penetration testing

### Emergency Contacts
- Database: Supabase support
- Authentication: Clerk support  
- Hosting: Vercel/your hosting provider support