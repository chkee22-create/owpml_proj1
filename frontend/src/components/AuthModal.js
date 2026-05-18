import React from 'react';
import styled from 'styled-components';
import { palette } from '../shared/palette';

/* ==========================================================================
   🎨 1. 스타일드 컴포넌트 정의 (Styled Components)
   ========================================================================== */

/* ── 팝업 전체를 감싸는 반투명 백드롭 오버레이 ── */
export const ModalOverlay = styled.div`
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.3); 
  display: ${props => props.$show ? 'flex' : 'none'}; 
  justify-content: center; align-items: center; z-index: 999;
  backdrop-filter: blur(2px); 
`;

/* ── 닫기 X 버튼 (선명한 Red 반영) ── */
export const CloseIconButton = styled.button`
  position: absolute; top: 16px; right: 16px; background: none; border: none; 
  font-size: 16px; 
  color: ${palette.red[6]}; 
  cursor: pointer; transition: all 0.1s;
  &:hover { color: ${palette.red[8]}; transform: scale(1.15); }
`;

/* ── 비로그인 상태에서 메뉴 클릭 시 유도하는 [추천 모달 컨테이너] ── */
export const RecommendBox = styled.div`
  width: 340px; background: white; border-radius: 16px; overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid ${palette.slate[2]}; position: relative;
`;

export const RecommendHeader = styled.div`
  background: #CDF4D3;    
  border-bottom: 1px solid ${palette.slate[2]}; 
  padding: 28px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px;
  
  .logo-box { 
    width: 44px; height: 44px; border-radius: 10px; 
    background: ${palette.teal[5]}; color: white; display: flex; align-items: center; justify-content: center; font-size: 22px; 
  }
  .brand-title { 
    font-size: 16px; font-weight: 800; color: ${palette.slate[8]}; text-align: center; 
    span { 
      display: block; font-size: 11px; 
      color: ${palette.slate[7]}; 
      font-weight: 700; margin-top: 2px; 
    } 
  }
`;

export const RecommendBody = styled.div`
  padding: 32px 24px; text-align: center;
  h3 { font-size: 18px; font-weight: 800; color: ${palette.slate[8]}; margin: 0 0 12px 0; }
  p { font-size: 12.5px; color: ${palette.slate[5]}; font-weight: 600; line-height: 1.6; margin: 0 0 28px 0; }
  
  .auth-links { 
    display: flex; justify-content: center; gap: 28px; font-size: 14px; font-weight: 700; color: ${palette.slate[6]};
    span { cursor: pointer; transition: color 0.15s; &:hover { color: ${palette.teal[5]}; } }
  }
`;

/* ── 🔐 소셜 + 일반 통합 로그인/회원가입 모달 폼 본체 ── */
export const FigAuthBox = styled.div`
  width: 360px; background: white; border-radius: 16px; padding: 40px 28px 32px 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08); border: 1px solid ${palette.slate[2]}; position: relative;
  display: flex; flex-direction: column; box-sizing: border-box;

  .popup-logo {
    display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 24px;
    .logo-icon {
      width: 44px; height: 44px; border-radius: 10px;
      background: ${palette.teal[5]}; color: white; display: flex; align-items: center; justify-content: center; font-size: 22px;
    }
    .logo-text { h2 { font-size: 18px; font-weight: 800; color: ${palette.slate[8]}; margin: 0; } }
  }

  .popup-title { font-size: 16px; font-weight: 800; color: ${palette.slate[8]}; text-align: center; margin: 0 0 16px 0; }
  .social-list { display: flex; flex-direction: column; gap: 10px; width: 100%; }

  .social-btn {
    width: 100%; display: flex; align-items: center; padding: 12px 16px; border-radius: 8px; 
    font-size: 13.5px; font-weight: 700; cursor: pointer; border: none; box-sizing: border-box; transition: all 0.15s;
    
    .icon-wrap { width: 20px; display: flex; justify-content: center; font-size: 16px; margin-right: 12px; }
    .btn-text { flex: 1; text-align: center; margin-right: 20px; }

    &.gmail { 
      background: ${palette.google[5]}; border: 1px solid ${palette.slate[0]}; color: #ffffff; 
      box-shadow: 0 4px 6px -1px rgba(26, 115, 232, 0.12);
      &:hover { background: ${palette.google[6]}; }
      .icon-wrap { color: #ffffff; font-weight: 800; } 
    }
    &.kakao { background: ${palette.kakao}; border: 1px solid #fdd835; color: #191919; &:hover { background: #fada0a; } .icon-wrap { color: #191919; } }
    &.naver { background: ${palette.naver}; border: 1px solid #02b14f; color: white; &:hover { background: #02b343; } .icon-wrap { color: white; font-weight: 900; } }
  }

  .divider {
    display: flex; align-items: center; margin: 24px 0; color: ${palette.slate[4]}; font-size: 12px; font-weight: 700;
    &::before, &::after { content: ""; flex: 1; height: 1px; background: ${palette.slate[2]}; }
    span { padding: 0 12px; }
  }

  .input-group {
    display: flex; flex-direction: column; gap: 10px; width: 100%;
    input {
      width: 100%; padding: 11px 14px; border: 1px solid ${palette.slate[3]}; border-radius: 8px;
      font-size: 13.5px; font-weight: 600; color: ${palette.slate[8]}; outline: none; box-sizing: border-box;
      transition: border-color 0.15s;
      &::placeholder { color: ${palette.slate[4]}; }
      &:focus { border-color: ${palette.slate[5]}; } 
    }
  }

  .action-row {
    display: flex; justify-content: flex-end; width: 100%; margin-top: 20px; margin-bottom: 20px;
    .continue-btn {
      background: ${palette.slate[8]}; color: white; border: none; padding: 11px 24px; border-radius: 8px;
      font-size: 13.5px; font-weight: 700; cursor: pointer; transition: background 0.15s;
      width: 100%; text-align: center;
      &:hover { background: ${palette.slate[9]}; }
    }
  }

  .toggle-guide {
    font-size: 12.5px; color: ${palette.slate[5]}; font-weight: 600; text-align: center; width: 100%;
    button { background: none; border: none; color: ${palette.teal[5]}; cursor: pointer; font-weight: 700; margin-left: 6px; font-size: 12.5px; &:hover { text-decoration: underline; } }
  }
`;

/* ==========================================================================
   📦 2. 메인 컴포넌트 로직 (AuthModal Component)
   ========================================================================== */
function AuthModal({ modalMode, setModalMode, formData, onInputChange, onLoginSubmit, onSignupSubmit }) {
  if (!modalMode) return null;

  return (
    <ModalOverlay $show={!!modalMode} onClick={() => setModalMode(null)}>
      
      {/* ── ① 로그인 유도 추천 모달 레이아웃 (modalMode가 'recommend'일 때) ── */}
      {modalMode === 'recommend' && (
        <RecommendBox onClick={(e) => e.stopPropagation()}>
          <CloseIconButton onClick={() => setModalMode(null)}>
            <i className="fa-solid fa-xmark"></i>
          </CloseIconButton>
          
          <RecommendHeader>
            <div className="logo-box"><i className="fa-solid fa-robot"></i></div>
            <div className="brand-title"><span>ChatBot AI</span>Paper Mate</div>
          </RecommendHeader>
          
          <RecommendBody>
            <h3>로그인을 추천 드립니다.</h3>
            <p>로그인해 보관함을 이용하고,<br />팀원들과 함께 작업을 하고, 지난 답변을 검색해보세요</p>
            <div className="auth-links">
              <span onClick={() => setModalMode('login')}>Login</span>
              <span onClick={() => setModalMode('signup')}>signup</span>
            </div>
          </RecommendBody>
        </RecommendBox>
      )}

      {/* ── ② 로그인 / 회원가입 입력 폼 레이아웃 (modalMode가 'login' 또는 'signup'일 때) ── */}
      {(modalMode === 'login' || modalMode === 'signup') && (
        <FigAuthBox onClick={(e) => e.stopPropagation()}>
          <CloseIconButton onClick={() => setModalMode(null)}>
            <i className="fa-solid fa-xmark"></i>
          </CloseIconButton>

          <div className="popup-logo">
            <div className="logo-icon"><i className="fa-solid fa-robot"></i></div>
            <div className="logo-text"><h2>Paper Mate</h2></div>
          </div>

          {modalMode === 'login' ? (
            <>
              <h3 className="popup-title">로그인</h3>
              <div className="social-list">
                <button className="social-btn gmail">
                  <span className="icon-wrap"><i className="fa-brands fa-google"></i></span>
                  <span className="btn-text">Google로 계속하기</span>
                </button>
                <button className="social-btn kakao">
                  <span className="icon-wrap"><i className="fa-solid fa-comment"></i></span>
                  <span className="btn-text">카카오로 계속하기</span>
                </button>
                <button className="social-btn naver">
                  <span className="icon-wrap"><i className="fa-solid fa-n"></i></span>
                  <span className="btn-text">네이버로 계속하기</span>
                </button>
              </div>

              <div className="divider"><span>또는</span></div>

              <div className="input-group">
                <input name="id" placeholder="아이디" value={formData?.id || ''} onChange={onInputChange} />
                <input name="pw" type="password" placeholder="비밀번호" value={formData?.pw || ''} onChange={onInputChange} />
              </div>

              <div className="action-row">
                <button className="continue-btn" onClick={onLoginSubmit}>로그인</button>
              </div>

              <p className="toggle-guide">
                계정이 없으신가요? 
                <button onClick={() => setModalMode('signup')}>회원가입</button>
              </p>
            </>
          ) : (
            <>
              <h3 className="popup-title">회원가입</h3>
              <div className="social-list">
                <button className="social-btn gmail">
                  <span className="icon-wrap"><i className="fa-brands fa-google"></i></span>
                  <span className="btn-text">Gmail로 시작하기</span>
                </button>
                <button className="social-btn kakao">
                  <span className="icon-wrap"><i className="fa-solid fa-comment"></i></span>
                  <span className="btn-text">카카오톡으로 시작하기</span>
                </button>
                <button className="social-btn naver">
                  <span className="icon-wrap"><i className="fa-solid fa-n"></i></span>
                  <span className="btn-text">네이버로 시작하기</span>
                </button>
              </div>

              <div className="divider"><span>또는 일반 가입</span></div>

              <div className="input-group">
                <input name="id" placeholder="사용할 아이디" value={formData?.id || ''} onChange={onInputChange} />
                <input name="pw" type="password" placeholder="비밀번호" value={formData?.pw || ''} onChange={onInputChange} />
                <input name="confirmPw" type="password" placeholder="비밀번호 확인" value={formData?.confirmPw || ''} onChange={onInputChange} />
              </div>

              <div className="action-row">
                <button className="continue-btn" onClick={onSignupSubmit}>가입하기</button>
              </div>

              <p className="toggle-guide">
                이미 계정이 있으신가요? 
                <button onClick={() => setModalMode('login')}>로그인</button>
              </p>
            </>
          )}
        </FigAuthBox>
      )}
    </ModalOverlay>
  );
}

export default AuthModal;