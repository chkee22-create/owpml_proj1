import React from 'react';
import Home from './pages/Home';

function App() {
  return (
    <div className="App">
      {/* 💡 컴포넌트 구조로 분리된 마스터 오케스트레이터 페이지를 로드합니다 */}
      <Home />
    </div>
  );
}

export default App;