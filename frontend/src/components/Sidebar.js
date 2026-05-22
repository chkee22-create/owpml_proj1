import React from 'react';
import {
  FiChevronLeft,
  FiFolder,
  FiMessageSquare,
  FiPieChart,
  FiSettings,
  FiShare2,
  FiUser,
} from 'react-icons/fi';
import { TbMessagePlus } from 'react-icons/tb';
import papermateLogo from '../assets/papermate-logo-sidebar.png';
import {
  BottomMenuGroup,
  BottomUserCard,
  BrandRow,
  CollapseButton,
  MenuBtn,
  NavIcon,
  NavList,
  SidebarContainer,
  SidebarFooter,
  SidebarMain,
  TopBrandSection,
} from './styles/Sidebar.styles';

function SidebarIcon({ active, children }) {
  return <NavIcon $active={active}>{children}</NavIcon>;
}

function Sidebar({
  viewMode,
  onMenuClick,
  onLogoClick,
  isLoggedIn,
  username,
  userProfileImage,
  onProfileClick,
  collapsed,
  onCollapse,
  recentConversations = [],
  onRecentConversationClick,
}) {
  return (
    <SidebarContainer $collapsed={collapsed}>
      <SidebarMain>
        <BrandRow>
          <TopBrandSection onClick={onLogoClick}>
            <img className="logo" src={papermateLogo} alt="PaperMate" />
          </TopBrandSection>
          <CollapseButton type="button" onClick={onCollapse} aria-label="사이드바 접기">
            <FiChevronLeft />
          </CollapseButton>
        </BrandRow>

        <NavList>
          <MenuBtn $active={viewMode === 'main'} onClick={() => onMenuClick('새 채팅')}>
            <SidebarIcon active={viewMode === 'main'}><TbMessagePlus /></SidebarIcon>
            <span className="menu-text">새 채팅</span>
          </MenuBtn>

          {isLoggedIn && (
            <>
              <div className="section-lbl">최근 대화</div>
              {recentConversations.length === 0 && (
                <MenuBtn $active={false}>
                  <SidebarIcon><FiMessageSquare /></SidebarIcon>
                  <span className="menu-text">최근 대화 없음</span>
                </MenuBtn>
              )}

              {recentConversations.map((conversation) => (
                <MenuBtn
                  key={conversation.id}
                  $active={false}
                  onClick={() => onRecentConversationClick?.(conversation)}
                >
                  <SidebarIcon><FiMessageSquare /></SidebarIcon>
                  <span className="menu-text">{conversation.title}</span>
                </MenuBtn>
              ))}
            </>
          )}
        </NavList>
      </SidebarMain>

      <SidebarFooter>
        <BottomMenuGroup>
          <MenuBtn $active={viewMode === '분석 비교'} onClick={() => onMenuClick('분석 비교')}>
            <SidebarIcon active={viewMode === '분석 비교'}><FiPieChart /></SidebarIcon>
            <span className="menu-text">분석 · 요약</span>
          </MenuBtn>
          <MenuBtn $active={viewMode === '내 프로젝트'} onClick={() => onMenuClick('내 프로젝트')}>
            <SidebarIcon active={viewMode === '내 프로젝트'}><FiFolder /></SidebarIcon>
            <span className="menu-text">프로젝트</span>
          </MenuBtn>
          <MenuBtn $active={viewMode === '공유'} onClick={() => onMenuClick('공유')}>
            <SidebarIcon active={viewMode === '공유'}><FiShare2 /></SidebarIcon>
            <span className="menu-text">함께하는 공간</span>
          </MenuBtn>
        </BottomMenuGroup>

        {isLoggedIn && (
          <BottomUserCard onClick={onProfileClick}>
            <div className="profile-circle">
              {userProfileImage ? (
                <img src={userProfileImage} alt={`${username} 프로필`} />
              ) : (
                <FiUser className="account-icon" />
              )}
            </div>
            <div className="name">{username}</div>
            <FiSettings className="gear-icon" />
          </BottomUserCard>
        )}
      </SidebarFooter>
    </SidebarContainer>
  );
}

export default Sidebar;
