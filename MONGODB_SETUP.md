# MongoDB Setup Guide

## ⚠️ MongoDB Connection Error

If you see this error:
```
MongoDB connection error: MongooseServerSelectionError: connect ECONNREFUSED
```

**MongoDB is not running!** Follow one of the options below to start it.

## Option 1: Local MongoDB Installation

### Windows
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service:
   ```bash
   # MongoDB should start automatically as a service
   # Or manually start:
   net start MongoDB
   ```

### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux
```bash
# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod

# Or manually
mongod --dbpath /var/lib/mongodb
```

## Option 2: Docker MongoDB (Recommended)

### Quick Start
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### With Persistent Storage
```bash
docker run -d \
  -p 27017:27017 \
  --name mongodb \
  -v mongodb_data:/data/db \
  mongo:7
```

### Check if MongoDB is Running
```bash
docker ps | grep mongodb
```

### View Logs
```bash
docker logs mongodb
```

### Stop MongoDB
```bash
docker stop mongodb
```

### Remove MongoDB Container
```bash
docker rm mongodb
```

## Option 3: MongoDB Atlas (Cloud - Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
   ```
7. Add your IP address to Network Access whitelist

## Verify MongoDB is Running

### Check Connection
```bash
# Test connection (if MongoDB shell is installed)
mongosh

# Or check if port is open
# Windows
netstat -an | findstr 27017

# macOS/Linux
lsof -i :27017
```

## Troubleshooting

### Port Already in Use
If port 27017 is already in use:
```bash
# Find process using port 27017
# Windows
netstat -ano | findstr :27017

# macOS/Linux
lsof -i :27017

# Kill the process or use different port
```

### MongoDB Won't Start
1. Check MongoDB logs for errors
2. Ensure data directory exists and has correct permissions
3. Check disk space
4. Verify MongoDB service is running

### Docker Issues
```bash
# Remove old container
docker rm -f mongodb

# Remove volume (if needed)
docker volume rm mongodb_data

# Start fresh
docker run -d -p 27017:27017 --name mongodb mongo:7
```

## Using MongoDB Compass (GUI)

1. Download from https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. View and manage your databases

## Environment Configuration

Make sure your `server/.env` file has:
```env
MONGODB_URI=mongodb://localhost:27017/chatapp
```

Or for MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
```

## Next Steps

Once MongoDB is running:
1. Restart your server
2. You should see: "MongoDB connected successfully"
3. The application will create the database automatically

---

**Need Help?** Check the main [README.md](./README.md) or [DEPLOYMENT.md](./DEPLOYMENT.md)

