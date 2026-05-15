import React, { useState } from 'react';
import './Kim_css/layout_K.css'; 
import './Kim_css/sidebar_K.css';
import { LoginModal, SignupModal } from './Login_k';

// ─── 사이드바 ────────────────────────────────────────────────
function Sidebar({ isLoggedIn, username, onMenuClick, selectedChat, onChatSelect, onGoHome }) {
  const recentChats = ['Rag란 무엇인가', '비교분석', 'LLM이란 무엇인가'];
  const bottomMenus = [
    { icon: '🔗', label: '공유' },
    { icon: '🕐', label: '히스토리' },
    { icon: '📊', label: '분석 비교' },
    { icon: '📋', label: '대시보드' },
  ];

  return (
    <aside className="sidebar">
      {/* 로고 클릭 → 홈 화면 */}
      <div className="sidebar-logo" onClick={onGoHome} style={{ cursor: 'pointer' }}>
        <img src="/logo.png" alt="Paper Mate 로고" />
        <div className="logo-text">
          ChatBot AI<span>Paper Mate</span>
        </div>
      </div>

      {/* 새 채팅 클릭 → 홈 화면 */}
      <button className="btn-new-chat" onClick={onGoHome}>💬 새 채팅</button>

      <div className="recent-label">최근 대화</div>
      <ul className="recent-list">
        {recentChats.map((chat, i) => (
          <li
            key={i}
            className={`recent-item ${selectedChat === chat ? 'active' : ''}`}
            onClick={() => {
              if (!isLoggedIn) {
                onMenuClick();       // 비로그인 → 팝업
              } else {
                onChatSelect(chat);  // 로그인 → 채팅 화면 전환
              }
            }}
          >
            💬 {chat}
          </li>
        ))}
      </ul>

      <div className="sidebar-bottom">
        {bottomMenus.map((menu, i) => (
          <button key={i} className="sidebar-menu-item" onClick={onMenuClick}>
            <span className="menu-icon">{menu.icon}</span>
            {menu.label}
          </button>
        ))}

        {isLoggedIn && (
          <div className="sidebar-user">
            <div className="user-avatar">👤</div>
            <span className="user-name">{username}</span>
            <button className="user-settings">⚙️</button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── 비로그인 사이드바 팝업 ──────────────────────────────────
function SidebarLoginPopup({ onClose, onLogin, onSignup }) {
  return (
    <div className="login-popup-overlay" onClick={onClose}>
      <div className="login-popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-logo">
          <img src="/logo.png" alt="로고" />
          <span style={{ fontSize: '12px', fontWeight: 700 }}>Paper Mate</span>
        </div>
        <h3>로그인을 추천 드립니다.</h3>
        <p>
          로그인해 보관함을 이용하고,<br />
          팀원들과 함께 작업을 하고, 지난 답변을 검색해보세요
        </p>
        <div className="popup-buttons">
          <button className="btn-popup-login" onClick={onLogin}>Login</button>
          <button className="btn-popup-signup" onClick={onSignup}>signup</button>
        </div>
      </div>
    </div>
  );
}

// ─── 홈 화면 (로그인 전/채팅 선택 전) ───────────────────────
function HomeView() {
  const [files]                     = useState(['main123.pdf', 'main123.hwp']);
  const [inputValue, setInputValue] = useState('');

  const features = [
    { icon: '📄', title: '문서 분석·요약',  desc: 'HWP, PDF 등 다양한 포맷의 문서 핵심 내용을 추출하고 요약합니다' },
    { icon: '📑', title: '다중문서 비교',   desc: '여러 문서들을 비교하고 차이점을 시각화 합니다.' },
    { icon: '📈', title: '데이터 시각화',   desc: '문서 내 데이터를 차트, 그래프로 변환합니다.' },
    { icon: '👥', title: '협업공간',         desc: '초대 코드로 팀원을 초대하고, 분석 결과를 함께 검토합니다' },
  ];

  return (
    <>
      <section className="hero-section">
        <h1>논문 읽는 시간을 1/10으로,<br />협업의 깊이는 2배로</h1>
        <p>
          HWP, PDF 등 다양한 포맷의 논문을 올리면 AI가 핵심을 분석하고<br />
          팀원과 실시간으로 공유할 수 있어요.
        </p>
      </section>

      <div className="feature-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card">
            <span className="card-icon">{f.icon}</span>
            <div>
              <div className="card-title">{f.title}</div>
              <div className="card-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <div className="file-chips">
          {files.map((file, i) => (
            <div key={i} className="file-chip">
              📎 {file} <span className="chip-remove">×</span>
            </div>
          ))}
        </div>
        <div className="chat-input-box">
          <button className="btn-attach">+</button>
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className="btn-send">➤</button>
        </div>
      </div>
    </>
  );
}

// ─── 채팅 화면 (대화 선택 후) ───────────────────────────────
function ChatView({ chatTitle }) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages]     = useState([]);  // 나중에 실제 메시지로 교체

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages([...messages, { role: 'user', text: inputValue }]);
    setInputValue('');
  };

  return (
    <div className="chat-view">
      {/* 메시지 목록 영역 (현재는 비어있음) */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* 하단 입력창 */}
      <div className="chat-input-area">
        <div className="chat-input-box">
          <button className="btn-attach">+</button>
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="btn-send" onClick={handleSend}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername]     = useState('');
  const [modal, setModal]           = useState(null);
  const [selectedChat, setSelectedChat] = useState(null); // 선택된 채팅

  const handleLogin = (id) => {
    setUsername(id || 'user14530');
    setIsLoggedIn(true);
    setModal(null);
  };

  return (
    <div className="app-layout">

      <Sidebar
        isLoggedIn={isLoggedIn}
        username={username}
        onMenuClick={() => !isLoggedIn && setModal('sidebarHint')}
        selectedChat={selectedChat}
        onChatSelect={setSelectedChat}
        onGoHome={() => setSelectedChat(null)}
      />

      <main className="main-content">
        <header className="main-header">
          {isLoggedIn ? (
            <div className="header-user">
              <div className="header-avatar">👤</div>
              <span className="header-username">{username}</span>
            </div>
          ) : (
            <>
              <button className="btn-login"  onClick={() => setModal('login')}>Login</button>
              <button className="btn-signup" onClick={() => setModal('signup')}>signup</button>
            </>
          )}
        </header>

        {/* selectedChat이 있으면 채팅 화면, 없으면 홈 화면 */}
        {selectedChat
          ? <ChatView chatTitle={selectedChat} />
          : <HomeView />
        }
      </main>

      {/* 팝업들 */}
      {modal === 'sidebarHint' && (
        <SidebarLoginPopup
          onClose={() => setModal(null)}
          onLogin={() => setModal('login')}
          onSignup={() => setModal('signup')}
        />
      )}
      {modal === 'login' && (
        <LoginModal
          onClose={() => setModal(null)}
          onSwitchToSignup={() => setModal('signup')}
          onLogin={handleLogin}
        />
      )}
      {modal === 'signup' && (
        <SignupModal
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal('login')}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}