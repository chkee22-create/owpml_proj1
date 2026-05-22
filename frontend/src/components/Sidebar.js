import React from 'react';
import styled from 'styled-components';
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

const SidebarContainer = styled.aside`
  width: clamp(232px, 19vw, 280px);
  height: 100vh;
  background: linear-gradient(180deg, #d8f0d9 0%, #c8e6c9 52%, #bfe0c0 100%);
  border-right: 1px solid rgba(46, 125, 50, 0.14);
  display: flex;
  flex-direction: column;
  padding: 24px 14px 16px;
  box-sizing: border-box;
  justify-content: space-between;
  flex-shrink: 0;
  transform: ${(props) => (props.$collapsed ? 'translateX(-100%)' : 'translateX(0)')};
  transition: transform 0.22s ease;
  box-shadow: 10px 0 28px rgba(15, 23, 42, 0.04);

  @media (min-width: 1440px) {
    padding: 28px 16px 18px;
  }
`;

const TopBrandSection = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.9;
  }

  .logo {
    width: 166px;
    height: 64px;
    display: block;
    object-fit: contain;
  }

  @media (min-width: 1440px) {
    .logo {
      width: 178px;
      height: 68px;
    }
  }
`;

const SidebarMain = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 22px;
`;

const CollapseButton = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid rgba(33, 113, 102, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.62);
  color: #2f6f68;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover {
    background: #ffffff;
    color: #147d73;
    border-color: rgba(20, 125, 115, 0.2);
  }

  svg {
    width: 17px;
    height: 17px;
  }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 3px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(71, 85, 105, 0.22);
    border-radius: 999px;
  }

  .section-lbl {
    font-size: 11px;
    font-weight: 800;
    color: rgba(47, 111, 104, 0.74);
    margin: 18px 0 7px 12px;
    letter-spacing: 0.5px;
  }
`;

const SidebarFooter = styled.div`
  width: 100%;
  flex-shrink: 0;
`;

const BottomMenuGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid rgba(47, 111, 104, 0.14);
`;

const NavIcon = styled.span`
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${(props) => (props.$active ? '#147d73' : '#4f746f')};
  transition: color 0.15s;

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2.2;
  }
`;

const MenuBtn = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 10px 13px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  box-sizing: border-box;
  color: ${(props) => (props.$active ? '#126f67' : '#335f5a')};
  background: ${(props) => (props.$active ? 'rgba(255, 255, 255, 0.78)' : 'transparent')};
  border: 1px solid ${(props) => (props.$active ? 'rgba(20, 125, 115, 0.14)' : 'transparent')};
  box-shadow: ${(props) => (props.$active ? '0 8px 18px rgba(33, 113, 102, 0.08)' : 'none')};
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.7);
    color: #126f67;

    ${NavIcon} {
      color: #147d73;
    }
  }

  .menu-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const BottomUserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 9px 9px 9px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(20, 125, 115, 0.12);
  box-shadow: 0 10px 22px rgba(33, 113, 102, 0.09);
  box-sizing: border-box;

  &:hover {
    background: rgba(255, 255, 255, 0.88);
    transform: translateY(-1px);
  }

  .profile-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    background: #ffffff;
    border: 1px solid rgba(20, 125, 115, 0.18);
    box-shadow: inset 0 0 0 2px rgba(216, 240, 217, 0.58);
  }

  .account-icon {
    width: 23px;
    height: 23px;
    color: #147d73;
    stroke-width: 1.9;
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .name {
    font-size: 13.5px;
    font-weight: 700;
    color: #24423f;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .gear-icon {
    color: #126f67;
    width: 21px;
    height: 21px;
    flex-shrink: 0;
    padding: 7px;
    border-radius: 8px;
    background: rgba(20, 125, 115, 0.12);
    box-sizing: content-box;

    &:hover {
      background: rgba(20, 125, 115, 0.18);
    }
  }

  @media (min-width: 1440px) {
    min-height: 62px;

    .profile-circle {
      width: 40px;
      height: 40px;
    }
  }
`;

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
