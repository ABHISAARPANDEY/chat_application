const User = require('../models/User');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

const activeUsers = new Map(); // userId -> socketId
const videoCalls = new Map(); // callId -> call data

const handleSocketConnection = (io, socket) => {
  const userId = socket.userId;
  const username = socket.username;

  console.log(`User connected: ${username} (${userId})`);

  // Add user to active users
  activeUsers.set(userId, socket.id);
  
  // Update user status to online
  User.findByIdAndUpdate(userId, { 
    status: 'online',
    lastSeen: new Date()
  }).exec();

  // Broadcast user online status
  socket.broadcast.emit('user:online', { userId, username });

  // Handle text chat messages
  socket.on('message:send', async (data) => {
    try {
      const { receiverId, content } = data;

      if (!receiverId || !content) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      // Create message in database
      const message = new Message({
        sender: userId,
        receiver: receiverId,
        content,
        messageType: 'text'
      });

      await message.save();

      // Find or create chat room
      let room = await ChatRoom.findOne({
        participants: { $all: [userId, receiverId] }
      });

      if (!room) {
        room = new ChatRoom({
          participants: [userId, receiverId],
          lastMessage: message._id,
          lastActivity: new Date()
        });
      } else {
        room.lastMessage = message._id;
        room.lastActivity = new Date();
      }
      await room.save();

      // Get sender info
      const sender = await User.findById(userId).select('username avatar');

      const messageData = {
        _id: message._id,
        sender: sender,
        receiver: receiverId,
        content: message.content,
        messageType: message.messageType,
        read: message.read,
        createdAt: message.createdAt
      };

      // Send to receiver if online
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:receive', messageData);
      }

      // Send confirmation to sender
      socket.emit('message:sent', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle message read status
  socket.on('message:read', async (data) => {
    try {
      const { messageIds } = data;
      await Message.updateMany(
        { _id: { $in: messageIds }, receiver: userId },
        { read: true, readAt: new Date() }
      );

      const senderId = await Message.findOne({ _id: messageIds[0] }).select('sender');
      if (senderId && activeUsers.has(senderId.sender.toString())) {
        io.to(activeUsers.get(senderId.sender.toString())).emit('message:read:confirm', {
          messageIds,
          readBy: userId
        });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Handle typing indicator
  socket.on('typing:start', (data) => {
    const { receiverId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:start', {
        userId,
        username
      });
    }
  });

  socket.on('typing:stop', (data) => {
    const { receiverId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:stop', { userId });
    }
  });

  // Video call handlers
  socket.on('call:initiate', (data) => {
    const { receiverId, callType } = data; // callType: 'video' or 'audio'
    const receiverSocketId = activeUsers.get(receiverId);

    if (!receiverSocketId) {
      socket.emit('call:error', { message: 'User is not online' });
      return;
    }

    const callId = `${userId}-${receiverId}-${Date.now()}`;
    videoCalls.set(callId, {
      callerId: userId,
      receiverId,
      callType,
      status: 'ringing',
      createdAt: new Date()
    });

    io.to(receiverSocketId).emit('call:incoming', {
      callId,
      callerId: userId,
      callerName: username,
      callType
    });

    socket.emit('call:initiated', { callId });
  });

  socket.on('call:accept', (data) => {
    const { callId } = data;
    const call = videoCalls.get(callId);

    if (!call || call.receiverId !== userId) {
      socket.emit('call:error', { message: 'Invalid call' });
      return;
    }

    call.status = 'accepted';
    videoCalls.set(callId, call);

    const callerSocketId = activeUsers.get(call.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:accepted', {
        callId,
        receiverId: userId,
        receiverName: username
      });
    }

    socket.emit('call:ready', { callId });
  });

  socket.on('call:reject', (data) => {
    const { callId } = data;
    const call = videoCalls.get(callId);

    if (call) {
      const callerSocketId = activeUsers.get(call.callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:rejected', { callId });
      }
      videoCalls.delete(callId);
    }
  });

  socket.on('call:end', (data) => {
    const { callId } = data;
    const call = videoCalls.get(callId);

    if (call) {
      if (call.callerId === userId) {
        const receiverSocketId = activeUsers.get(call.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('call:ended', { callId });
        }
      } else if (call.receiverId === userId) {
        const callerSocketId = activeUsers.get(call.callerId);
        if (callerSocketId) {
          io.to(callerSocketId).emit('call:ended', { callId });
        }
      }
      videoCalls.delete(callId);
    }
  });

  // WebRTC signaling
  socket.on('webrtc:offer', (data) => {
    const { callId, offer } = data;
    const call = videoCalls.get(callId);

    if (call) {
      const targetId = call.callerId === userId ? call.receiverId : call.callerId;
      const targetSocketId = activeUsers.get(targetId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc:offer', {
          callId,
          offer,
          senderId: userId
        });
      }
    }
  });

  socket.on('webrtc:answer', (data) => {
    const { callId, answer } = data;
    const call = videoCalls.get(callId);

    if (call) {
      const targetId = call.callerId === userId ? call.receiverId : call.callerId;
      const targetSocketId = activeUsers.get(targetId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc:answer', {
          callId,
          answer,
          senderId: userId
        });
      }
    }
  });

  socket.on('webrtc:ice-candidate', (data) => {
    const { callId, candidate } = data;
    const call = videoCalls.get(callId);

    if (call) {
      const targetId = call.callerId === userId ? call.receiverId : call.callerId;
      const targetSocketId = activeUsers.get(targetId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc:ice-candidate', {
          callId,
          candidate,
          senderId: userId
        });
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${username} (${userId})`);

    // Remove from active users
    activeUsers.delete(userId);

    // Update user status
    await User.findByIdAndUpdate(userId, {
      status: 'offline',
      lastSeen: new Date()
    }).exec();

    // Clean up any active calls
    for (const [callId, call] of videoCalls.entries()) {
      if (call.callerId === userId || call.receiverId === userId) {
        const otherId = call.callerId === userId ? call.receiverId : call.callerId;
        const otherSocketId = activeUsers.get(otherId);
        if (otherSocketId) {
          io.to(otherSocketId).emit('call:ended', { callId });
        }
        videoCalls.delete(callId);
      }
    }

    // Broadcast user offline status
    socket.broadcast.emit('user:offline', { userId, username });
  });
};

module.exports = { handleSocketConnection };

