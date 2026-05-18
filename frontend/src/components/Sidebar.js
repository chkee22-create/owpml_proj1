import React from 'react';
import styled from 'styled-components';
import { palette } from '../shared/palette';

const SidebarContainer = styled.aside`
  width: 260px; height: 100vh; 
  background: #c8e6c9; 
  border-right: 1px solid #e2e8f0;      /* 💡 메인 대시보드와 경계를 나누는 깔끔한 우측 실선 유지 */
  display: flex; flex-direction: column; 
  padding: 28px 16px;                    /* 💡 상단 여백을 24px에서 28px로 살짝 넓혀 로고 안정감 확보 */
  box-sizing: border-box; justify-content: space-between; flex-shrink: 0;
`;

const TopBrandSection = styled.div`
  display: flex; align-items: center; gap: 10px; margin-bottom: 32px; padding-left: 8px;
  cursor: pointer; 
  transition: opacity 0.15s;
  &:hover { opacity: 0.85; }

  /* 🎨 사이드바 최상단 미니 로고 박스 */
  .logo { 
    width: 32px; height: 32px; 
    background: #0ea5a4;                  /* 💡 메인 틸/민트 시그니처 컬러 */
    border-radius: 8px; color: white; 
    display: flex; align-items: center; justify-content: center;
    
    .material-symbols-outlined { font-size: 20px; color: #ffffff; }
  }
  
  /* 🎨 브랜드 서비스명 타이틀 텍스트 */
  .brand-text { 
    font-size: 16px; font-weight: 800; 
    color: #1e293b;                       /* 💡 Slate 800 딥 다크 컬러로 선명하게 변경 */
    span { 
      display: block; font-size: 10px; 
      color: #94a3b8; font-weight: 700; margin-bottom: -2px; 
    } 
  }
`;

const NavList = styled.nav`
  display: flex; flex-direction: column; gap: 6px; /* 💡 메뉴 간격을 8px에서 6px로 살짝 조밀하게 좁혀 세련미 상향 */
  flex: 1;
  
  /* 🎨 메뉴 그룹을 나누는 중간 라벨 (예: WORKSPACE, MANAGEMENT 등) */
  .section-lbl { 
    font-size: 11px; font-weight: 800;    /* 💡 대문자나 타이틀 라벨이 묵직하도록 두께 상향 */
    color: #78909c;                       /* 💡 연초록 배경 위에서 가독성이 더 좋은 Slate-Blue 계열로 톤 변경 */
    margin: 20px 0 6px 12px;              /* 💡 그룹 간의 위 여백(20px) 확보 및 좌측 인덴트 통일 */
    letter-spacing: 0.5px;                /* 💡 라벨 텍스트 자간을 넓혀 기획서 느낌 극대화 */
  }
`;

/* 🎨 구글 머티리얼 심볼 전용 컴포넌트 (정석 문법) */
const MaterialIcon = styled.span.attrs({ className: 'material-symbols-outlined' })`
  font-family: 'Material Symbols Outlined' !important;
  font-weight: normal;
  font-style: normal;
  font-size: 18px;                        /* 글자 크기 밸런스 매칭 */
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  
  width: 20px;
  text-align: center;
  transition: color 0.15s;
`;

const MenuBtn = styled.div`
  display: flex; align-items: center; gap: 12px; padding: 11px 14px; 
  border-radius: 8px;                     /* 💡 모서리 둥글기 값을 10px에서 8px로 조절하여 핏 조율 */
  font-size: 14px; font-weight: 700; 
  box-sizing: border-box;
  
  /* 💡 [반영 포인트] 순백색 스타일 기반 조율 */
  color: ${props => props.$active ? '#0ea5a4' : '#475569'}; 
  background: ${props => props.$active ? '#ffffff' : 'transparent'}; 
  border: 1px solid ${props => props.$active ? 'rgba(15, 23, 42, 0.04)' : 'transparent'};
  box-shadow: ${props => props.$active ? '0 4px 12px rgba(15, 23, 42, 0.04)' : 'none'};
  
  cursor: pointer; transition: all 0.15s ease-in-out;
  
  /* 비활성화 상태에서 마우스 올렸을 때의 피드백 효과 */
  &:hover { 
    background: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}; /* 선택 안 된 메뉴 호버 시 투명하게 동화 */
    color: #0ea5a4; 
    
    ${MaterialIcon} {
      color: #0ea5a4;
    }
  }
  
  /* 메뉴명 좌측에 들어가는 정렬용 아이콘 정밀 세팅 */
  ${MaterialIcon} { 
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
  border: 1px solid transparent;        /* 💡 호버 시 깜빡임(털컥거림) 방지용 투명 테두리 */
  box-sizing: border-box;
  
  /* 🎨 하단 프로필 카드 마우스 오버 시 입체 가이드 */
  &:hover { 
    background: rgba(255, 255, 255, 0.5); /* 💡 사이드바 연초록 배경에 착 붙는 반투명 화이트 가이드 적용 */
    border-color: rgba(255, 255, 255, 0.6);
    
    ${MaterialIcon}.account-icon {
      color: ${palette.slate[7]};         /* 호버 시 실루엣 아이콘 톤 다운 피드백 */
    }
  }
  
  /* 🎨 유저 프로필 원형 아바타 영역 */
  .profile-circle { 
    width: 32px; height: 32px; 
    border-radius: 50%; 
    display: flex; align-items: center; justify-content: center; 
    
    ${MaterialIcon}.account-icon {
      font-size: 32px;                   /* 원 크기에 딱 맞춤 */
      width: 32px;
      color: ${palette.slate[5]};         /* 피그마 시안의 그레이 실루엣 컬러 매칭 */
    }
  }
  
  /* 🎨 유저 네임명 (user14530 등) */
  .name { 
    font-size: 13.5px;                   /* 💡 밀도감 있는 폰트 스펙으로 보정 */
    font-weight: 700; 
    color: #1e293b;                      /* 💡 유저네임 가독성을 위해 컬러 딥하게 조정 */
    flex: 1; 
    white-space: nowrap;                 /* 💡 유저 이름이 길어져도 개행되지 않고 말줄임표 처리 유도 */
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* 유저네임 우측 설정 아이콘 등 */
  ${MaterialIcon}.gear-icon { 
    color: #546e7a; 
    font-size: 16px; 
  }
`;

function Sidebar({ viewMode, onMenuClick, onLogoClick, isLoggedIn, username, onProfileClick }) {
  return (
    <SidebarContainer>
      <div style={{display:'flex', flexDirection:'column', width:'100%'}}>
        {/* 💡 로고 바운더리 클릭 시 홈 대시보드로 복귀 */}
        <TopBrandSection onClick={onLogoClick}>
          <div className="logo">
            <MaterialIcon>smart_toy</MaterialIcon>
          </div>
          <div className="brand-text"><span>ChatBot AI</span>Paper Mate</div>
        </TopBrandSection>

        <NavList>
          {/* 새 채팅 버튼 */}
          <MenuBtn $active={viewMode === 'main'} onClick={() => onMenuClick('새 채팅')}>
            <MaterialIcon>chat_dashed</MaterialIcon>
            <span className="menu-text">새 채팅</span>
          </MenuBtn>
          
          <div className="section-lbl">최근 대화</div>
          <MenuBtn $active={false}>
            <MaterialIcon>chat_bubble</MaterialIcon>
            <span className="menu-text">Rag란 무엇인가</span>
          </MenuBtn>
          <MenuBtn $active={false}>
            <MaterialIcon>chat_bubble</MaterialIcon>
            <span className="menu-text">비교분석</span>
          </MenuBtn>
          <MenuBtn $active={false}>
            <MaterialIcon>chat_bubble</MaterialIcon>
            <span className="menu-text">LLM이란 무엇인가</span>
          </MenuBtn>

          <div style={{height:'1px', background:'rgba(15, 23, 42, 0.08)', margin:'16px 0'}} />

          <MenuBtn $active={viewMode === '공유'} onClick={() => onMenuClick('공유')}>
            <MaterialIcon>share</MaterialIcon>
            <span className="menu-text">공유</span>
          </MenuBtn>
          <MenuBtn $active={viewMode === '분석 비교'} onClick={() => onMenuClick('분석 비교')}>
            <MaterialIcon>pie_chart</MaterialIcon>
            <span className="menu-text">분석 비교</span>
          </MenuBtn>
          <MenuBtn $active={viewMode === '내 프로젝트'} onClick={() => onMenuClick('내 프로젝트')}>
            <MaterialIcon>folder_open</MaterialIcon>
            <span className="menu-text">내 프로젝트</span>
          </MenuBtn>
        </NavList>
      </div>

      {isLoggedIn && (
        <BottomUserCard onClick={onProfileClick}>
          <div className="profile-circle">
            <MaterialIcon className="account-icon">account_circle</MaterialIcon>
          </div>
          <div className="name">{username}</div>
          <MaterialIcon className="gear-icon">settings</MaterialIcon>
        </BottomUserCard>
      )}
    </SidebarContainer>
  );
}

export default Sidebar;