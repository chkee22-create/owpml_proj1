import React from 'react';
import { AvatarContainer } from './styles/UserAvatar.styles';

function UserAvatar({ userProfileImg, userName, size }) {
  if (userProfileImg) {
    return (
      <AvatarContainer $size={size}>
        <img src={userProfileImg} alt={`${userName || '유저'} 프로필`} />
      </AvatarContainer>
    );
  }

  return (
    <AvatarContainer $size={size}>
      <i className="fa-regular fa-circle-user"></i>
    </AvatarContainer>
  );
}

export default UserAvatar;
