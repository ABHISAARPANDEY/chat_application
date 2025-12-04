# Cloud-Based Chat Application

A full-stack, production-ready chat application with real-time text messaging and video/audio calling capabilities.

## Features

- **Real-time Text Chat**: Instant messaging with Socket.io
- **Video & Audio Calls**: WebRTC-based video and audio calling
- **User Authentication**: Secure JWT-based authentication
- **User Status**: Online/offline status tracking
- **Message History**: Persistent message storage with MongoDB
- **Typing Indicators**: Real-time typing notifications
- **Responsive Design**: Modern, mobile-friendly UI
- **Cloud-Ready**: Docker containerization for easy deployment

## Tech Stack

### Backend
- Node.js & Express.js
- Socket.io for real-time communication
- MongoDB with Mongoose
- JWT for authentication
- WebRTC signaling server

### Frontend
- React 18
- Socket.io-client
- WebRTC API
- Styled Components for UI

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd Chat_application
```

### 2. Install dependencies

Install root dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd server
npm install
```

Install frontend dependencies:
```bash
cd ../client
npm install
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Create a `.env` file in the `client` directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start MongoDB

Make sure MongoDB is running:
```bash
mongod
```

Or use Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### 5. Run the Application

#### Development Mode

From the root directory, run both servers concurrently:
```bash
npm run dev
```

Or run separately:

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

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Docker Deployment

### Using Docker Compose

1. Build and start all services:
```bash
docker-compose up -d
```

2. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost/api

3. Stop services:
```bash
docker-compose down
```

### Manual Docker Build

Build the image:
```bash
docker build -t chatapp .
```

Run the container:
```bash
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://your-mongodb-uri/chatapp \
  -e JWT_SECRET=your-secret-key \
  chatapp
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Select User**: Choose a user from the sidebar to start chatting
3. **Send Messages**: Type and send real-time text messages
4. **Video Call**: Click the video icon to initiate a video call
5. **Audio Call**: Click the phone icon to initiate an audio call
6. **Call Controls**: Use on-screen controls to mute, disable video, or end calls

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/:userId` - Get user by ID

### Messages
- `GET /api/messages/:userId` - Get messages with a user
- `GET /api/messages/rooms/list` - Get all chat rooms

## Socket.IO Events

### Client → Server
- `message:send` - Send a message
- `message:read` - Mark messages as read
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `call:initiate` - Initiate a call
- `call:accept` - Accept incoming call
- `call:reject` - Reject incoming call
- `call:end` - End active call
- `webrtc:offer` - Send WebRTC offer
- `webrtc:answer` - Send WebRTC answer
- `webrtc:ice-candidate` - Send ICE candidate

### Server → Client
- `message:receive` - Receive a message
- `message:sent` - Message sent confirmation
- `message:read:confirm` - Message read confirmation
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline
- `call:incoming` - Incoming call notification
- `call:initiated` - Call initiated confirmation
- `call:accepted` - Call accepted
- `call:rejected` - Call rejected
- `call:ended` - Call ended
- `call:ready` - Call ready for connection
- `webrtc:offer` - Receive WebRTC offer
- `webrtc:answer` - Receive WebRTC answer
- `webrtc:ice-candidate` - Receive ICE candidate

## Production Considerations

1. **Environment Variables**: Change default JWT_SECRET and use secure secrets management
2. **HTTPS**: Use SSL/TLS certificates for production
3. **CORS**: Configure CORS properly for your domain
4. **Rate Limiting**: Already implemented, adjust as needed
5. **Database**: Use MongoDB Atlas or managed database service
6. **WebRTC**: Consider using TURN servers for NAT traversal
7. **Monitoring**: Add logging and monitoring solutions
8. **Scalability**: Consider horizontal scaling with Redis adapter for Socket.io

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js for security headers
- Rate limiting
- Input validation
- CORS configuration
- HTTP-only cookies

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Note: WebRTC features require modern browsers with WebRTC support.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

### Socket Connection Issues
- Check CORS settings
- Verify token is valid
- Check firewall/network settings

### WebRTC Issues
- Ensure HTTPS in production (required for WebRTC)
- Check browser permissions for camera/microphone
- Verify STUN/TURN server configuration

## License

MIT

## Support

For issues and questions, please open an issue on the repository.

