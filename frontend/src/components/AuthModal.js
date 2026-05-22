import React from 'react';
import styled from 'styled-components';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill, RiRobot2Line } from 'react-icons/ri';
import { SiNaver } from 'react-icons/si';
import { FiX } from 'react-icons/fi';
import { palette } from '../shared/palette';

export const ModalOverlay = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.32);
  display: ${(props) => (props.$show ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(2px);
  padding: 16px;
  box-sizing: border-box;
`;

export const CloseIconButton = styled.button`
  position: absolute;
  top: 18px;
  right: 22px;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: ${palette.red[6]};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  svg {
    width: 19px;
    height: 19px;
    stroke-width: 3;
  }
`;

export const RecommendBox = styled.div`
  width: min(340px, 100%);
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
  border: 1px solid ${palette.slate[2]};
  position: relative;
`;

export const RecommendHeader = styled.div`
  background: #cdf4d3;
  border-bottom: 1px solid ${palette.slate[2]};
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .logo-box {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: ${palette.teal[5]};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-box svg {
    width: 24px;
    height: 24px;
  }

  .brand-title {
    font-size: 16px;
    font-weight: 800;
    color: ${palette.slate[8]};
    text-align: center;
  }

  .brand-title span {
    display: block;
    font-size: 11px;
    color: ${palette.slate[7]};
    font-weight: 700;
    margin-top: 2px;
  }
`;

export const RecommendBody = styled.div`
  padding: 32px 24px;
  text-align: center;

  h3 {
    font-size: 18px;
    font-weight: 800;
    color: ${palette.slate[8]};
    margin: 0 0 12px 0;
  }

  p {
    font-size: 12.5px;
    color: ${palette.slate[5]};
    font-weight: 600;
    line-height: 1.6;
    margin: 0 0 28px 0;
  }

  .auth-links {
    display: flex;
    justify-content: center;
    gap: 28px;
    font-size: 14px;
    font-weight: 700;
    color: ${palette.slate[6]};
  }

  .auth-links span {
    cursor: pointer;
    transition: color 0.15s;
  }

  .auth-links span:hover {
    color: ${palette.teal[5]};
  }
`;

export const FigAuthBox = styled.div`
  width: min(420px, 100%);
  max-height: calc(100vh - 32px);
  overflow: hidden;
  background: white;
  border-radius: 16px;
  padding: 34px 36px 26px 36px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  border: 1px solid ${palette.slate[2]};
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .popup-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .logo-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: ${palette.teal[5]};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-icon svg {
    width: 28px;
    height: 28px;
  }

  .logo-text h2 {
    font-size: 22px;
    font-weight: 800;
    color: #343a40;
    margin: 0;
  }

  .popup-title {
    font-size: 19px;
    font-weight: 800;
    color: #343a40;
    text-align: center;
    margin: 0 0 18px 0;
  }

  .social-stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 18px;
  }

  .social-btn {
    width: 100%;
    height: 46px;
    border: none;
    border-radius: 8px;
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    align-items: center;
    padding: 0 14px;
    font-size: 15px;
    font-weight: 800;
    cursor: default;
  }

  .social-btn svg {
    width: 22px;
    height: 22px;
    justify-self: start;
  }

  .social-btn.google {
    background: #1f7ae5;
    color: #ffffff;
  }

  .social-btn.kakao {
    background: #ffe500;
    color: #181600;
  }

  .social-btn.naver {
    background: #08c861;
    color: #ffffff;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 14px;
    color: #c4cbd3;
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 16px;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .input-group input {
    width: 100%;
    height: 45px;
    padding: 0 16px;
    border: 1px solid #d8dde4;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    color: ${palette.slate[8]};
    outline: none;
    box-sizing: border-box;
  }

  .input-group input::placeholder {
    color: #c4cbd3;
  }

  .action-row {
    display: flex;
    width: 100%;
    margin-top: 18px;
    margin-bottom: 18px;
  }

  .continue-btn {
    width: 100%;
    height: 48px;
    background: #343a40;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: background 0.15s;
  }

  .continue-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .toggle-guide {
    font-size: 14px;
    color: #aeb6bf;
    font-weight: 800;
    text-align: center;
    width: 100%;
    margin: 0;
  }

  .toggle-guide button {
    background: none;
    border: none;
    color: ${palette.teal[5]};
    cursor: pointer;
    font-weight: 800;
    margin-left: 8px;
    font-size: 14px;
  }

  .auth-error {
    color: ${palette.red[6]};
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    margin: -12px 0 18px 0;
  }

  @media (max-height: 760px) {
    padding-top: 24px;
    padding-bottom: 20px;

    .popup-logo {
      margin-bottom: 14px;
    }

    .logo-icon {
      width: 44px;
      height: 44px;
    }

    .social-btn {
      height: 42px;
    }

    .input-group input {
      height: 42px;
    }

    .continue-btn {
      height: 44px;
    }
  }
`;

const SocialButtons = ({ mode }) => {
  const isSignup = mode === 'signup';

  return (
    <div className="social-stack">
      <button className="social-btn google" type="button" aria-label="Google 연동">
        <FcGoogle />
        <span>{isSignup ? 'Gmail로 시작하기' : 'Google로 계속하기'}</span>
      </button>
      <button className="social-btn kakao" type="button" aria-label="카카오톡 연동">
        <RiKakaoTalkFill />
        <span>{isSignup ? '카카오톡으로 시작하기' : '카카오로 계속하기'}</span>
      </button>
      <button className="social-btn naver" type="button" aria-label="네이버 연동">
        <SiNaver />
        <span>{isSignup ? '네이버로 시작하기' : '네이버로 계속하기'}</span>
      </button>
    </div>
  );
};

function AuthModal({
  modalMode,
  setModalMode,
  formData,
  onInputChange,
  onLoginSubmit,
  onSignupSubmit,
  authError,
  authLoading,
}) {
  if (!modalMode) return null;

  return (
    <ModalOverlay $show={!!modalMode} onClick={() => setModalMode(null)}>
      {modalMode === 'recommend' && (
        <RecommendBox onClick={(event) => event.stopPropagation()}>
          <CloseIconButton type="button" onClick={() => setModalMode(null)} aria-label="닫기">
            <FiX />
          </CloseIconButton>

          <RecommendHeader>
            <div className="logo-box"><RiRobot2Line /></div>
            <div className="brand-title"><span>ChatBot AI</span>Paper Mate</div>
          </RecommendHeader>

          <RecommendBody>
            <h3>로그인이 필요한 기능입니다.</h3>
            <p>로그인하면 프로젝트, 분석 질문, 자료와 참여 팀을 계정별로 관리할 수 있어요.</p>
            <div className="auth-links">
              <span onClick={() => setModalMode('login')}>Login</span>
              <span onClick={() => setModalMode('signup')}>signup</span>
            </div>
          </RecommendBody>
        </RecommendBox>
      )}

      {(modalMode === 'login' || modalMode === 'signup') && (
        <FigAuthBox onClick={(event) => event.stopPropagation()}>
          <CloseIconButton type="button" onClick={() => setModalMode(null)} aria-label="닫기">
            <FiX />
          </CloseIconButton>

          <div className="popup-logo">
            <div className="logo-icon"><RiRobot2Line /></div>
            <div className="logo-text"><h2>Paper Mate</h2></div>
          </div>

          <h3 className="popup-title">{modalMode === 'login' ? '로그인' : '회원가입'}</h3>
          <SocialButtons mode={modalMode} />
          <div className="divider">{modalMode === 'login' ? '또는' : '또는 일반 가입'}</div>

          {modalMode === 'login' ? (
            <>
              <div className="input-group">
                <input name="id" placeholder="아이디" value={formData?.id || ''} onChange={onInputChange} />
                <input name="pw" type="password" placeholder="비밀번호" value={formData?.pw || ''} onChange={onInputChange} />
              </div>

              <div className="action-row">
                <button className="continue-btn" type="button" onClick={onLoginSubmit} disabled={authLoading}>
                  {authLoading ? '로그인 중...' : '로그인'}
                </button>
              </div>
              {authError && <p className="auth-error">{authError}</p>}

              <p className="toggle-guide">
                계정이 없으신가요?
                <button type="button" onClick={() => setModalMode('signup')}>회원가입</button>
              </p>
            </>
          ) : (
            <>
              <div className="input-group">
                <input name="id" placeholder="사용할 아이디" value={formData?.id || ''} onChange={onInputChange} />
                <input name="pw" type="password" placeholder="비밀번호" value={formData?.pw || ''} onChange={onInputChange} />
                <input name="confirmPw" type="password" placeholder="비밀번호 확인" value={formData?.confirmPw || ''} onChange={onInputChange} />
              </div>

              <div className="action-row">
                <button className="continue-btn" type="button" onClick={onSignupSubmit} disabled={authLoading}>
                  {authLoading ? '가입 중...' : '가입하기'}
                </button>
              </div>
              {authError && <p className="auth-error">{authError}</p>}

              <p className="toggle-guide">
                이미 계정이 있으신가요?
                <button type="button" onClick={() => setModalMode('login')}>로그인</button>
              </p>
            </>
          )}
        </FigAuthBox>
      )}
    </ModalOverlay>
  );
}

export default AuthModal;
