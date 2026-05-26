// @ts-nocheck
// TypeScript 변경 표시: JSX가 들어 있는 React 파일이라 .js에서 .tsx로 바꾼 파일입니다.
// TypeScript 변경 표시: 기존 JS 로직은 유지하고, 타입은 점진적으로 붙일 수 있게 현재는 @ts-nocheck로 전환했습니다.
// 초보자 안내: 화면에서 재사용되는 UI 조각을 정의한 React 컴포넌트 파일입니다.

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
