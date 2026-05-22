import React from 'react';
import styled from 'styled-components';
import {
  FiFolder,
  FiChevronLeft,
  FiMessageSquare,
  FiPieChart,
  FiSettings,
  FiShare2,
  FiUser,
} from 'react-icons/fi';
import { TbMessagePlus } from 'react-icons/tb';
import { RiRobot2Line } from 'react-icons/ri';
import { palette } from '../shared/palette';

const SidebarContainer = styled.aside`
  width: clamp(220px, 22vw, 260px); height: 100vh; 
  background: #c8e6c9; 
  border-right: 1px solid #e2e8f0;
  display: flex; flex-direction: column; 
  padding: 28px 16px;
  box-sizing: border-box; justify-content: space-between; flex-shrink: 0;
  transform: ${props => props.$collapsed ? 'translateX(-100%)' : 'translateX(0)'};
  transition: transform 0.22s ease;
`;

const TopBrandSection = styled.div`
  display: flex; align-items: center; gap: 10px; margin-bottom: 32px; padding-left: 8px;
  cursor: pointer; 
  transition: opacity 0.15s;
  &:hover { opacity: 0.85; }

  .logo { 
    width: 32px; height: 32px; 
    background: #0ea5a4;
    border-radius: 8px; color: white; 
    display: flex; align-items: center; justify-content: center;
    
    svg { width: 20px; height: 20px; color: #ffffff; }
  }
  
  .brand-text { 
    font-size: 16px; font-weight: 800; 
    color: #1e293b;
    span { 
      display: block; font-size: 10px; 
      color: #94a3b8; font-weight: 700; margin-bottom: -2px; 
    } 
  }
`;

const NavList = styled.nav`
  display: flex; flex-direction: column; gap: 6px;
  flex: 1;
  min-height: 0;
  
  .section-lbl { 
    font-size: 11px; font-weight: 800;
    color: #78909c;
    margin: 20px 0 6px 12px;
    letter-spacing: 0.5px;
  }
`;

const NavIcon = styled.span`
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => props.$active ? '#0ea5a4' : palette.slate[5]};
  transition: color 0.15s;

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2.2;
  }
`;

const BrandRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const CollapseButton = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.55);
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #ffffff;
    color: #0ea5a4;
  }

  svg {
    width: 17px;
    height: 17px;
  }
`;

const MenuBtn = styled.div`
  display: flex; align-items: center; gap: 12px; padding: 11px 14px; 
  border-radius: 8px;
  font-size: 14px; font-weight: 700; 
  box-sizing: border-box;
  
  color: ${props => props.$active ? '#0ea5a4' : '#475569'}; 
  background: ${props => props.$active ? '#ffffff' : 'transparent'}; 
  border: 1px solid ${props => props.$active ? 'rgba(15, 23, 42, 0.04)' : 'transparent'};
  box-shadow: ${props => props.$active ? '0 4px 12px rgba(15, 23, 42, 0.04)' : 'none'};
  
  cursor: pointer; transition: all 0.15s ease-in-out;
  
  &:hover { 
    background: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'};
    color: #0ea5a4; 
    
    ${NavIcon} {
      color: #0ea5a4;
    }
  }
  
  ${NavIcon} { 
    color: ${props => props.$active ? '#0ea5a4' : palette.slate[5]}; 
  }
  
  .menu-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const BottomUserCard = styled.div`
  display: flex; align-items: center; gap: 10px; 
  padding: 12px; 
  border-radius: 10px; cursor: pointer; transition: all 0.15s; margin-top: auto;
  border: 1px solid transparent;
  box-sizing: border-box;

  .profile-circle { 
    width: 32px; height: 32px; 
    border-radius: 50%; 
    display: flex; align-items: center; justify-content: center; 
    
    .account-icon {
      width: 32px;
      height: 32px;
      color: ${palette.slate[5]};
    }
  }
  
  .name { 
    font-size: 13.5px;
    font-weight: 700; 
    color: #1e293b;
    flex: 1; 
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .gear-icon { 
    color: #546e7a; 
    width: 16px;
    height: 16px;
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
  onProfileClick,
  collapsed,
  onCollapse,
  recentConversations = [],
  onRecentConversationClick,
}) {
  const visibleRecentConversations = recentConversations.slice(0, 3);

  return (
    <SidebarContainer $collapsed={collapsed}>
      <div style={{display:'flex', flexDirection:'column', width:'100%'}}>
        <BrandRow>
          <TopBrandSection onClick={onLogoClick}>
            <div className="logo"><RiRobot2Line /></div>
            <div className="brand-text"><span>ChatBot AI</span>PaperMate</div>
          </TopBrandSection>
          <CollapseButton type="button" onClick={onCollapse} aria-label="사이드바 숨기기">
            <FiChevronLeft />
          </CollapseButton>
        </BrandRow>

        <NavList>
          <MenuBtn $active={viewMode === 'main'} onClick={() => onMenuClick('새 채팅')}>
            <SidebarIcon active={viewMode === 'main'}><TbMessagePlus /></SidebarIcon>
            <span className="menu-text">새로운 채팅</span>
          </MenuBtn>

          {isLoggedIn && (
            <>
              <div className="section-lbl">최근 대화</div>
              {visibleRecentConversations.length === 0 && (
                <MenuBtn $active={false}>
                  <SidebarIcon><FiMessageSquare /></SidebarIcon>
                  <span className="menu-text">최근 대화 없음</span>
                </MenuBtn>
              )}

              {visibleRecentConversations.map((conversation) => (
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
          <div style={{height:'1px', background:'rgba(15, 23, 42, 0.08)', margin:'16px 0'}} />
          <MenuBtn $active={viewMode === '분석 비교'} onClick={() => onMenuClick('분석 비교')}>
            <SidebarIcon active={viewMode === '분석 비교'}><FiPieChart /></SidebarIcon>
            <span className="menu-text">분석.요약</span>
          </MenuBtn>
          <MenuBtn $active={viewMode === '내 프로젝트'} onClick={() => onMenuClick('내 프로젝트')}>
            <SidebarIcon active={viewMode === '내 프로젝트'}><FiFolder /></SidebarIcon>
            <span className="menu-text">프로젝트</span>
          </MenuBtn>
          <MenuBtn $active={viewMode === '공유'} onClick={() => onMenuClick('공유')}>
            <SidebarIcon active={viewMode === '공유'}><FiShare2 /></SidebarIcon>
            <span className="menu-text">함께하는 공간</span>
          </MenuBtn>
        </NavList>
      </div>

      {isLoggedIn && (
        <BottomUserCard>
          <div className="profile-circle">
            <FiUser className="account-icon" />
          </div>
          <div className="name">{username}</div>
          <FiSettings 
            className="gear-icon" 
            onClick={onProfileClick} 
            style={{ cursor: 'pointer' }} 
          />
        </BottomUserCard>
      )}
    </SidebarContainer>
  );
}

export default Sidebar;