const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);

