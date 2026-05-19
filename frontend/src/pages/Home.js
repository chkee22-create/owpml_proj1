import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import { palette } from '../shared/palette';
import { FiChevronRight } from 'react-icons/fi';

/* ── 💡 외부로 분리한 AuthModal 컴포넌트 임포트 ── */
import AuthModal from '../components/AuthModal';

/* ── 서브 메뉴 페이지 컴포넌트 임포트 ── */
import MypageC from './Mypage';       
import ShareC from './Share';         
import AnalysisC from './Analysis'; 
import Project from './Project';  

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const Container = styled.div`
  display: flex; width: 100%; height: 100vh; width: 100vw; overflow: hidden; box-sizing: border-box;
`;

const SidebarSlot = styled.div`
  width: ${props => props.$collapsed ? '0px' : '260px'};
  height: 100vh;
  flex-shrink: 0;
  overflow: visible;
  transition: width 0.22s ease;
`;

const SidebarOpenButton = styled.button`
  position: fixed;
  top: 18px;
  left: 12px;
  z-index: 30;
  width: 28px;
  height: 28px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
  display: ${props => props.$visible ? 'inline-flex' : 'none'};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);

  &:hover {
    color: #0ea5a4;
    border-color: #94a3b8;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

/* ── 1. 메인 뷰포트 레이아웃 ── */
const MainContent = styled.main`
  flex: 1; display: flex; flex-direction: column; 
  background: #f9fbe7;      /* 💡 기본 베이스 미색 */
  padding: ${props => props.$isFullView ? '0px' : '24px 40px'}; 
  padding-left: ${props => {
    if (!props.$sidebarCollapsed) return props.$isFullView ? '0px' : '40px';
    return props.$isFullView ? '34px' : '68px';
  }};
  box-sizing: border-box; height: 100vh; overflow: hidden; position: relative;
  transition: padding-left 0.22s ease;
`;

/* 우측 최상단 비로그인 상태의 로그인/회원가입 내비 링크 */
const TopAuth = styled.div`
  display: flex; justify-content: flex-end; gap: 24px; 
  font-size: 13.5px; 
  font-weight: 700; 
  color: ${palette.slate[5]};           
  margin-top: 16px; margin-right: 40px; flex-shrink: 0;
  span { cursor: pointer; transition: color 0.15s; &:hover { color: ${palette.teal[5]}; } }
`;

/* ── 2. 대시보드 메인 중앙 콘텐츠 히어로 영역 ── */
const MainDashboard = styled.div`
  flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; box-sizing: border-box;
  h2 { 
    font-size: 30px; font-weight: 800; color: ${palette.slate[8]}; text-align: center; margin-bottom: 12px; line-height: 1.4; 
    letter-spacing: -0.5px; 
  }
  .sub { 
    font-size: 14px; color: ${palette.slate[5]}; text-align: center; margin-bottom: 36px; line-height: 1.6; 
  }
`;

/* 기능 소개용 2열 격자 그리드 박스 */
const GridContainer = styled.div`
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; width: 100%; max-width: 800px; margin-bottom: 36px;
`;

/* 가이드 기능 카드 (논문 분석 가이드 등) */
const FeatureCard = styled.div`
  background: white; 
  border: 1px solid ${palette.slate[2]}; 
  border-radius: 16px; padding: 24px; display: flex; gap: 16px; cursor: pointer; transition: all 0.2s ease-in-out;
  
  &:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); 
    border-color: ${palette.slate[3]};   
  }
  
  .icon-box { 
    width: 44px; height: 44px; border-radius: 12px; 
    background: ${palette.teal[0]};       
    color: ${palette.teal[5]};            
    display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; 
  }
  
  .text-box { 
    h4 { margin: 0 0 6px 0; font-size: 14.5px; font-weight: 800; color: ${palette.slate[8]}; } 
    p { margin: 0; font-size: 12.5px; color: ${palette.slate[5]}; line-height: 1.5; font-weight: 600; } 
  }
`;

/* 검색바 상단에 배치되는 파일 타겟 필터 태그 로우 */
const FileTagRow = styled.div`
  display: flex; gap: 8px; margin-bottom: 12px;
  
  .tag { 
    background: #ffffff; 
    border: 1px solid ${palette.slate[2]}; 
    padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; color: ${palette.slate[6]}; 
    display: flex; align-items: center; gap: 6px; 
    cursor: pointer;
    transition: all 0.15s;
    
    &:hover { background: ${palette.slate[1]}; color: ${palette.slate[8]}; border-color: ${palette.slate[3]}; }
  }
`;

/* 메인 대형 통합 검색 창 */
const MainSearchBar = styled.div`
  width: 100%; max-width: 800px; background: white; 
  border: 2px solid ${palette.slate[2]};  
  border-radius: 16px; padding: 8px 18px; display: flex; align-items: center;
  transition: border-color 0.15s;
  
  &:focus-within { border-color: ${palette.slate[5]}; } 
  
  input { 
    flex: 1; border: none; outline: none; padding: 10px 4px; 
    font-size: 14.5px; font-weight: 600; color: ${palette.slate[8]};
    &::placeholder { color: ${palette.slate[4]}; }
  }
  i { 
    color: ${palette.slate[4]}; font-size: 18px; cursor: pointer; 
    transition: color 0.15s;
    &:hover { color: ${palette.teal[5]}; } 
  }
`;

/* ❌ 팝업 3, 4, 5번 모달 관련 스타일드 컴포넌트(ModalOverlay, FigAuthBox 등) 중복되어 전면 삭제 완료 */

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [username, setUsername] = useState('user14530');
  const [viewMode, setViewMode] = useState('main'); 
  const [restoredData, setRestoredData] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({ id: '', pw: '', confirmPw: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  /* ── 💡 분리된 AuthModal을 하나로 제어하기 위한 단일 상태 관리 모드 ── */
  const [modalMode, setModalMode] = useState(null); // 'recommend', 'login', 'signup', null

  useEffect(() => {
    const savedLoginStatus = localStorage.getItem('isLoggedIn');
    const savedUsername = localStorage.getItem('username');
    if (savedLoginStatus === 'true') {
      setIsLoggedIn(true);
      if (savedUsername) setUsername(savedUsername);
    }
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setAuthError('');
  };

  const handleMenuRouting = (menuName) => {
    const protectedMenus = ['공유', '분석 비교', '내 프로젝트', '마이페이지', '프로필클릭'];
    
    if (!isLoggedIn && protectedMenus.includes(menuName)) {
      setModalMode('recommend'); /* 💡 다중 state에서 단일 모드로 전환 */
      return;
    }

    if (menuName === '공유') setViewMode('공유');
    else if (menuName === '분석 비교') setViewMode('분석 비교');
    else if (menuName === '내 프로젝트') setViewMode('내 프로젝트');
    else if (menuName === '마이페이지' || menuName === '프로필클릭') setViewMode('마이페이지');
    else if (menuName === '새 채팅') { setViewMode('main'); setRestoredData(null); }
  };

  const openLoginPopup = () => {
    setAuthError('');
    setModalMode('login');
  };
  const openSignupPopup = () => {
    setAuthError('');
    setModalMode('signup');
  };

  const handleAuthSuccess = (authPayload) => {
    setIsLoggedIn(true);
    setUsername(authPayload.user.username);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', authPayload.user.username);
    localStorage.setItem('accessToken', authPayload.access_token);
    setModalMode(null);
    setFormData({ id: '', pw: '', confirmPw: '' });
    setAuthError('');
  };

  const submitAuthRequest = async (mode) => {
    const usernameInput = formData.id.trim();
    const passwordInput = formData.pw;

    if (!usernameInput || !passwordInput) {
      setAuthError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    if (mode === 'signup' && passwordInput !== formData.confirmPw) {
      setAuthError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.detail || '인증 요청에 실패했습니다.');
      }

      handleAuthSuccess(data);
    } catch (error) {
      setAuthError(error.message || '서버와 연결할 수 없습니다.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAbsoluteLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('accessToken');
    setViewMode('main'); 
  };

  const handleTimelineRestoreJump = (historyData) => {
    if (!isLoggedIn) {
      setModalMode('recommend');
      return;
    }
    setRestoredData(historyData);
    setViewMode('분석 비교');
  };

  const isFullView = ['공유', '분석 비교', '내 프로젝트', '마이페이지'].includes(viewMode);

  return (
    <Container>
      <SidebarOpenButton
        type="button"
        $visible={isSidebarCollapsed}
        onClick={() => setIsSidebarCollapsed(false)}
        aria-label="사이드바 열기"
      >
        <FiChevronRight />
      </SidebarOpenButton>

      <SidebarSlot $collapsed={isSidebarCollapsed}>
        <Sidebar 
          viewMode={viewMode}
          onMenuClick={handleMenuRouting}
          onLogoClick={() => { setViewMode('main'); setRestoredData(null); }}
          isLoggedIn={isLoggedIn}
          username={username}
          onProfileClick={() => handleMenuRouting('프로필클릭')} 
          collapsed={isSidebarCollapsed}
          onCollapse={() => setIsSidebarCollapsed(true)}
        />
      </SidebarSlot>

      <MainContent $isFullView={isFullView} $sidebarCollapsed={isSidebarCollapsed}>
        
        {/* ❌ 중복되었던 대량의 모달 마크업들(RecommendBox, FigAuthBox 렌더링 블록)을 
             여기가 아니라 하단 <AuthModal /> 하나로 통합하여 깔끔하게 제거했습니다. */}

        {!isFullView && (
          <TopAuth>
            {isLoggedIn ? (
              <span onClick={handleAbsoluteLogout}>Logout</span>
            ) : (
              <>
                <span onClick={openLoginPopup}>Login</span>
                <span onClick={openSignupPopup}>signup</span>
              </>
            )}
          </TopAuth>
        )}
        
        {viewMode === 'main' && (
          <MainDashboard>
            <h2>논문 읽는 시간을 1/10으로,<br />협업의 깊이는 2배로</h2>
            <div className="sub">HWP, PDF 등 다양한 포맷의 논문을 올리면 AI가 핵심을 분석하고<br />팀원과 실시간으로 공유할 수 있어요.</div>
            
            <GridContainer>
              <FeatureCard onClick={() => handleMenuRouting('분석 비교')}>
                <div className="icon-box"><i className="fa-regular fa-file-lines"></i></div>
                <div className="text-box"><h4>문서 분석 · 요약</h4><p>HWP, HWPX, PDF 문서의 핵심 내용을 추출하고 요약합니다.</p></div>
              </FeatureCard>
              <FeatureCard onClick={() => handleMenuRouting('분석 비교')}>
                <div className="icon-box"><i className="fa-regular fa-copy"></i></div>
                <div className="text-box"><h4>다중문서 비교</h4><p>여러 문서를 비교하고 차이점을 시각화합니다.</p></div>
              </FeatureCard>
              <FeatureCard onClick={() => handleMenuRouting('내 프로젝트')}>
                <div className="icon-box"><i className="fa-solid fa-chart-simple"></i></div>
                <div className="text-box"><h4>데이터 시각화</h4><p>문서 내 데이터를 차트, 그래프로 변환합니다.</p></div>
              </FeatureCard>
              <FeatureCard onClick={() => handleMenuRouting('공유')}>
                <div className="icon-box"><i className="fa-regular fa-user-group"></i></div>
                <div className="text-box"><h4>협업공간</h4><p>초대 코드로 팀원을 초대하고, 분석 결과를 함께 검토합니다.</p></div>
              </FeatureCard>
            </GridContainer>

            <FileTagRow>
              <div className="tag"><i className="fa-regular fa-file-pdf" style={{color:'#e74c3c'}}></i> main123.pdf <i className="fa-solid fa-xmark" style={{fontSize:'10px', marginLeft:'4px'}}></i></div>
              <div className="tag"><i className="fa-regular fa-file-word" style={{color:'#3498db'}}></i> main123.hwp <i className="fa-solid fa-xmark" style={{fontSize:'10px', marginLeft:'4px'}}></i></div>
            </FileTagRow>

            <MainSearchBar>
              <i className="fa-solid fa-plus" style={{marginRight:'14px'}}></i>
              <input type="text" placeholder="여기에 논문 분석 질문을 입력하세요..." />
              <i className="fa-regular fa-paper-plane"></i>
            </MainSearchBar>
          </MainDashboard>
        )}
        
        {viewMode === '내 프로젝트' && <Project />}
        {viewMode === '마이페이지' && <MypageC onLogoutClick={handleAbsoluteLogout} />}
        {viewMode === '공유' && <ShareC onRestoreTrigger={handleTimelineRestoreJump} username={username} />}
        {viewMode === '분석 비교' && <AnalysisC restoredData={restoredData} clearRestore={() => setRestoredData(null)} />}
        
        {/* ── 💡 분리된 모달을 한 곳에 주입하여 깔끔하게 통합 ── */}
        <AuthModal 
          modalMode={modalMode} 
          setModalMode={setModalMode} 
          formData={formData}
          onInputChange={handleInputChange}
          onLoginSubmit={() => submitAuthRequest('login')} 
          onSignupSubmit={() => submitAuthRequest('signup')} 
          authError={authError}
          authLoading={authLoading}
        />
      </MainContent>
    </Container>
  );
}

export default Home;
