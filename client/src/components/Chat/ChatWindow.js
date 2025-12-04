import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { FiSend, FiVideo, FiPhone } from 'react-icons/fi';
import api from '../../utils/api';
import './Chat.css';

const ChatWindow = ({ selectedUser, currentUser, onInitiateCall }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!selectedUser) return;
    try {
      const response = await api.get(`/messages/${selectedUser._id}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser || !socket) return;

    loadMessages();

    // Message event handlers
    const handleReceiveMessage = (message) => {
      if (message.sender._id === selectedUser._id || message.sender === selectedUser._id) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleSentMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleTypingStart = ({ userId, username }) => {
      if (userId === selectedUser._id) {
        setIsOtherTyping(true);
      }
    };

    const handleTypingStop = ({ userId }) => {
      if (userId === selectedUser._id) {
        setIsOtherTyping(false);
      }
    };

    socket.on('message:receive', handleReceiveMessage);
    socket.on('message:sent', handleSentMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:receive', handleReceiveMessage);
      socket.off('message:sent', handleSentMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [selectedUser, socket, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('message:send', {
      receiverId: selectedUser._id,
      content: newMessage.trim()
    });

    setNewMessage('');
    setIsTyping(false);
    
    if (socket && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit('typing:stop', { receiverId: selectedUser._id });
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing:start', { receiverId: selectedUser._id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing:stop', { receiverId: selectedUser._id });
    }, 1000);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    
    return d.toLocaleDateString();
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-user">
          <div className="avatar" style={{ backgroundColor: '#667eea' }}>
            {selectedUser?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3>{selectedUser?.username}</h3>
            <p>{selectedUser?.email}</p>
          </div>
        </div>
        <div className="chat-header-actions">
          <button
            onClick={() => onInitiateCall('video')}
            className="call-button"
            title="Video call"
          >
            <FiVideo />
          </button>
          <button
            onClick={() => onInitiateCall('audio')}
            className="call-button"
            title="Audio call"
          >
            <FiPhone />
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender?._id === currentUser._id || message.sender === currentUser._id;
            return (
              <div
                key={message._id || index}
                className={`message ${isOwn ? 'own' : 'other'}`}
              >
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        
        {isOtherTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button" disabled={!newMessage.trim()}>
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

