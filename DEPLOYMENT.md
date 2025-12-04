# Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running (local or cloud)
- Git installed

### Step 1: Clone and Install
```bash
git clone <repository-url>
cd Chat_application
npm run install-all
```

### Step 2: Configure Environment

**Server Environment** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Client Environment** (`client/.env` - optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 3: Start MongoDB
```bash
# Local MongoDB
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### Step 4: Run Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or separately:
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm start
```

## Docker Deployment

### Using Docker Compose

1. **Build and Start**:
```bash
docker-compose up -d
```

2. **View Logs**:
```bash
docker-compose logs -f
```

3. **Stop Services**:
```bash
docker-compose down
```

4. **Rebuild After Changes**:
```bash
docker-compose up -d --build
```

### Environment Variables for Docker

Create a `.env` file in the root directory:
```env
JWT_SECRET=your-production-secret-key
CLIENT_URL=http://your-domain.com
MONGODB_URI=mongodb://mongodb:27017/chatapp
```

## Cloud Deployment Options

### Option 1: AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.medium or larger
   - Security group: Open ports 22, 80, 443, 5000

2. **Setup Server**:
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb

# Install Docker (optional)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose
```

3. **Deploy Application**:
```bash
# Clone repository
git clone <repository-url>
cd Chat_application

# Setup environment
cp server/.env.example server/.env
nano server/.env  # Edit with your values

# Using Docker
docker-compose up -d

# Or manual deployment
cd server && npm install && npm start
cd ../client && npm install && npm run build
# Serve client/build with nginx
```

4. **Setup Nginx**:
```bash
sudo apt-get install nginx
sudo cp nginx.conf /etc/nginx/sites-available/chatapp
sudo ln -s /etc/nginx/sites-available/chatapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **Setup SSL with Let's Encrypt**:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: MongoDB Atlas (Cloud Database)

1. **Create MongoDB Atlas Account**
   - Go to mongodb.com/cloud/atlas
   - Create free cluster

2. **Get Connection String**:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string

3. **Update Environment**:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
```

4. **Whitelist IP Addresses**:
   - Add your server IP to Network Access

### Option 3: Heroku

1. **Install Heroku CLI**

2. **Create Heroku Apps**:
```bash
# Backend
heroku create chatapp-backend
heroku addons:create mongolab:sandbox

# Frontend
heroku create chatapp-frontend
```

3. **Configure Backend**:
```bash
cd server
heroku config:set JWT_SECRET=your-secret
heroku config:set CLIENT_URL=https://chatapp-frontend.herokuapp.com
git push heroku main
```

4. **Configure Frontend**:
```bash
cd client
heroku config:set REACT_APP_API_URL=https://chatapp-backend.herokuapp.com/api
heroku config:set REACT_APP_SOCKET_URL=https://chatapp-backend.herokuapp.com
git push heroku main
```

### Option 4: DigitalOcean App Platform

1. **Create App**:
   - Go to DigitalOcean App Platform
   - Connect GitHub repository

2. **Configure Components**:
   - Backend: Node.js service
   - Frontend: Static site
   - Database: Managed MongoDB

3. **Set Environment Variables**:
   - JWT_SECRET
   - MONGODB_URI
   - CLIENT_URL

4. **Deploy**

## Production Checklist

### Security
- [ ] Change default JWT_SECRET
- [ ] Use HTTPS (SSL certificate)
- [ ] Enable CORS for specific domains
- [ ] Set secure cookie flags
- [ ] Configure firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Regular security updates

### Performance
- [ ] Enable MongoDB indexing
- [ ] Setup CDN for static assets
- [ ] Configure caching
- [ ] Setup load balancing (if needed)
- [ ] Monitor resource usage
- [ ] Optimize Docker images

### Monitoring
- [ ] Setup error logging (e.g., Sentry)
- [ ] Setup application monitoring (e.g., New Relic)
- [ ] Monitor database performance
- [ ] Setup uptime monitoring
- [ ] Log aggregation

### Backup
- [ ] Setup MongoDB backups
- [ ] Backup environment variables
- [ ] Document recovery procedures

## Environment-Specific Configuration

### Development
- Hot reload enabled
- Detailed error messages
- CORS allows localhost

### Production
- Optimized builds
- Error logging
- Strict CORS
- HTTPS required
- Rate limiting enabled

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB is running
   - Verify MONGODB_URI
   - Check network/firewall

2. **Socket Connection Failed**
   - Verify CORS settings
   - Check WebSocket support
   - Verify token authentication

3. **WebRTC Not Working**
   - Requires HTTPS (except localhost)
   - Check browser permissions
   - Verify STUN/TURN servers

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version
   - Verify all dependencies

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor error logs
- Review security advisories
- Backup database weekly
- Monitor performance metrics

### Scaling Considerations
- Horizontal scaling with Redis adapter for Socket.io
- Database replication
- Load balancer for multiple instances
- CDN for static assets
- TURN servers for WebRTC scaling

---

For detailed project information, see [PROJECT_REPORT.md](./PROJECT_REPORT.md)

