import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../utils/api';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import VideoCall from './VideoCall';
import './Chat.css';

const Chat = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Load users list
    loadUsers();

    // Handle user online/offline events
    socket.on('user:online', ({ userId, username }) => {
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, status: 'online' } : u
      ));
    });

    socket.on('user:offline', ({ userId, username }) => {
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, status: 'offline' } : u
      ));
    });

    // Handle incoming call
    socket.on('call:incoming', (callData) => {
      setActiveCall({
        ...callData,
        type: 'incoming'
      });
    });

    socket.on('call:ended', () => {
      setActiveCall(null);
    });

    return () => {
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('call:incoming');
      socket.off('call:ended');
    };
  }, [socket]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setActiveCall(null);
  };

  const handleInitiateCall = (callType) => {
    if (!socket || !selectedUser) return;
    
    socket.emit('call:initiate', {
      receiverId: selectedUser._id,
      callType
    });

    socket.once('call:initiated', ({ callId }) => {
      setActiveCall({
        callId,
        receiverId: selectedUser._id,
        receiverName: selectedUser.username,
        type: 'outgoing',
        callType
      });
    });

    socket.once('call:accepted', ({ callId, receiverId }) => {
      setActiveCall(prev => prev ? { ...prev, status: 'accepted' } : null);
    });

    socket.once('call:rejected', () => {
      setActiveCall(null);
      alert('Call rejected');
    });

    socket.once('call:error', ({ message }) => {
      setActiveCall(null);
      alert(message);
    });
  };

  const handleEndCall = () => {
    if (socket && activeCall) {
      socket.emit('call:end', { callId: activeCall.callId });
    }
    setActiveCall(null);
  };

  return (
    <div className="chat-container">
      {activeCall && (
        <VideoCall
          call={activeCall}
          onEndCall={handleEndCall}
          selectedUser={selectedUser}
          currentUser={user}
        />
      )}
      
      {!activeCall && (
        <>
          <Sidebar
            users={users}
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            currentUser={user}
            onLogout={logout}
          />
          
          {selectedUser ? (
            <ChatWindow
              selectedUser={selectedUser}
              currentUser={user}
              onInitiateCall={handleInitiateCall}
            />
          ) : (
            <div className="chat-placeholder">
              <div className="placeholder-content">
                <h2>Welcome, {user?.username}!</h2>
                <p>Select a user to start chatting</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Chat;

