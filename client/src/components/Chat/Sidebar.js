import React, { useState, useEffect } from 'react';
import { FiLogOut, FiSearch } from 'react-icons/fi';
import './Chat.css';

const Sidebar = ({ users, selectedUser, onSelectUser, currentUser, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#4CAF50';
      case 'away':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-info">
          <div className="avatar" style={{ backgroundColor: '#667eea' }}>
            {currentUser?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h3>{currentUser?.username}</h3>
            <span className="status" style={{ color: '#4CAF50' }}>Online</span>
          </div>
        </div>
        <button onClick={onLogout} className="logout-button" title="Logout">
          <FiLogOut />
        </button>
      </div>

      <div className="search-container">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="users-list">
        <h4 className="users-list-title">Users</h4>
        {filteredUsers.length === 0 ? (
          <div className="no-users">No users found</div>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user._id}
              className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
              onClick={() => onSelectUser(user)}
            >
              <div className="avatar-container">
                <div className="avatar" style={{ backgroundColor: '#667eea' }}>
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div
                  className="status-dot"
                  style={{ backgroundColor: getStatusColor(user.status) }}
                />
              </div>
              <div className="user-item-info">
                <h4>{user.username}</h4>
                <p>{user.email}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;

