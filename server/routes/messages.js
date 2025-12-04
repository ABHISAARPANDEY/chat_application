const express = require('express');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get messages between current user and another user
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      messages: messages.reverse(), // Reverse to get chronological order
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all chat rooms for current user
router.get('/rooms/list', authenticate, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      participants: req.user._id
    })
      .populate('participants', 'username avatar status')
      .populate('lastMessage')
      .sort({ lastActivity: -1 })
      .lean();

    // Format rooms to exclude current user from participants
    const formattedRooms = rooms.map(room => {
      const otherParticipant = room.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );
      return {
        _id: room._id,
        participant: otherParticipant,
        lastMessage: room.lastMessage,
        lastActivity: room.lastActivity,
        unreadCount: 0 // Could be calculated separately
      };
    });

    res.json({ rooms: formattedRooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

