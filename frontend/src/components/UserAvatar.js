import React from 'react';
import styled from 'styled-components';
import { palette } from '../shared/palette';

/* ── 👤 기본 프로필 오버레이/컨테이너 스타일 ── */
const AvatarContainer = styled.div`
  width: ${props => props.$size || '40px'};
  height: ${props => props.$size || '40px'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent; /* 이미 아이콘 자체에 원형 테두리가 있으므로 배경은 투명하게 */
  user-select: none;

  /* 이미지와 싱크를 맞추기 위한 아이콘 내부 스타일 */
  i {
    font-size: ${props => props.$size || '40px'}; /* 컨테이너 크기에 맞춤 */
    color: ${palette.slate[5]}; /* 보내주신 이미지와 유사한 차분한 Slate 그레이 톤 */
    transition: color 0.15s;
    
    &:hover {
      color: ${palette.slate[7]}; /* 호버 시 살짝 딥해지는 피드백 */
    }
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

function UserAvatar({ userProfileImg, userName, size }) {
  // ① 실제 프로필 등록된 사진이 있는 경우 
  if (userProfileImg) {
    return (
      <AvatarContainer $size={size}>
        <img src={userProfileImg} alt={`${userName || '유저'} 프로필`} />
      </AvatarContainer>
    );
  }

  // ② 사진이 없는 경우 ── 보내주신 Account Circle 실루엣 아이콘 매칭
  return (
    <AvatarContainer $size={size}>
      {/* 폰트어썸 정식 원형 유저 아이콘 클래스명 적용 */}
      <i className="fa-regular fa-circle-user"></i>
    </AvatarContainer>
  );
}

export default UserAvatar;