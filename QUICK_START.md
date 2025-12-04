# Quick Start Guide

Get your chat application up and running in 5 minutes!

## Prerequisites Check

- [ ] Node.js 18+ installed (`node --version`)
- [ ] MongoDB installed and running (`mongod --version`)
- [ ] npm or yarn installed

## Installation Steps

### 1. Install Dependencies (2 minutes)

```bash
# Install all dependencies
npm run install-all

# This runs:
# - npm install (root)
# - cd server && npm install
# - cd client && npm install
```

### 2. Setup Environment (1 minute)

**Create `server/.env`:**
```bash
cd server
cp ENV_EXAMPLE.txt .env
# Edit .env with your settings (or use defaults for local dev)
```

**Create `client/.env` (optional):**
```bash
cd ../client
cp ENV_EXAMPLE.txt .env
# Or create manually if needed
```

### 3. Start MongoDB (1 minute)

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

**Option B: Docker MongoDB**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Option C: MongoDB Atlas (Cloud)**
- Sign up at mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Update `server/.env` with connection string

### 4. Run Application (1 minute)

**Development Mode (both servers):**
```bash
npm run dev
```

**Or run separately:**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

### 5. Access Application

Open your browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## First Steps

1. **Register**: Create a new account
   - Username: yourname
   - Email: your@email.com
   - Password: (at least 6 characters)

2. **Login**: Sign in with your credentials

3. **Start Chatting**: 
   - Select a user from the sidebar
   - Send messages
   - Initiate video/audio calls

## Using Docker (Alternative)

If you prefer Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access at http://localhost
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
pgrep mongod

# Start MongoDB
mongod

# Or check connection string in server/.env
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules server/node_modules client/node_modules
npm run install-all
```

## Next Steps

- Read [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Review [PROJECT_REPORT.md](./PROJECT_REPORT.md) for architecture details

## Support

For issues:
1. Check the troubleshooting section
2. Review error messages in console
3. Check server logs
4. Open an issue on the repository

---

**Happy Chatting! 🎉**

