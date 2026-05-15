import React, { useState } from 'react';
import './Kim_css/login_K.css';

function SocialButtons() {
  return (
    <div className="social-buttons">
      <button className="btn-social btn-gmail">
        <img src="https://www.google.com/favicon.ico" alt="Google" className="social-icon" />
        Gmail 연동
      </button>
      <button className="btn-social btn-kakao">
        <img src="https://t1.kakaocdn.net/kakao_for_business/favicon/v2/favicon.ico" alt="Kakao" className="social-icon" />
        카카오톡 연동
      </button>
      <button className="btn-social btn-naver">
        <span className="naver-n">N</span>
        네이버 연동
      </button>
    </div>
  );
}

function Divider() {
  return (
    <div className="or-divider">
      <span className="divider-line" />
      <span className="divider-text">또는</span>
      <span className="divider-line" />
    </div>
  );
}

// ─── 로그인 팝업 ─────────────────────────────────────────────
export function LoginModal({ onClose, onSwitchToSignup, onLogin }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  // 계속 버튼: 아무거나 입력하면 로그인 처리
  const handleSubmit = () => {
    onLogin(id || 'user14530');  // 아이디 없으면 기본값
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">로그인</h2>
        <SocialButtons />
        <Divider />
        <div className="input-group">
          <input
            type="text"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="modal-input"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="modal-input"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <button className="btn-continue" onClick={handleSubmit}>계속</button>
        <p className="modal-switch">
          계정이 없으신가요?{' '}
          <span onClick={onSwitchToSignup}>회원가입</span>
        </p>
      </div>
    </div>
  );
}

// ─── 회원가입 팝업 ───────────────────────────────────────────
export function SignupModal({ onClose, onSwitchToLogin, onLogin }) {
  const [id, setId] = useState('');

  const handleSubmit = () => {
    onLogin(id || 'user14530');  // 아이디 없으면 기본값
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">회원가입</h2>
        <SocialButtons />
        <Divider />
        <div className="input-group">
          <input
            type="text"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="modal-input"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <button className="btn-continue" onClick={handleSubmit}>계속</button>
        <p className="modal-switch">
          이미 계정이 있으신가요?{' '}
          <span onClick={onSwitchToLogin}>로그인</span>
        </p>
      </div>
    </div>
  );
}