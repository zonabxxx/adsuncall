import React from 'react';
import { useSelector } from 'react-redux';
import { FaUser } from 'react-icons/fa';

const UserInfo = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return null;
  }

  return (
    <div className="user-info-container">
      <div className="user-info">
        <FaUser className="user-icon" />
        <div className="user-details">
          <span className="user-name">{user.name}</span>
          {user.isAdmin && <span className="user-role">admin</span>}
        </div>
      </div>
    </div>
  );
};

export default UserInfo; 