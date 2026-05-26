// @ts-nocheck
// TypeScript 변경 표시: JSX가 들어 있는 React 파일이라 .js에서 .tsx로 바꾼 파일입니다.
// TypeScript 변경 표시: 기존 JS 로직은 유지하고, 타입은 점진적으로 붙일 수 있게 현재는 @ts-nocheck로 전환했습니다.
// 초보자 안내: 프론트엔드 React 앱을 index.html의 root 영역에 붙이는 시작 파일입니다.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// index.html의 <div id="root"></div>를 찾아 React 앱을 그릴 시작점으로 사용합니다.
// TypeScript 변경 표시: getElementById는 null일 수도 있어서, 여기서는 root가 반드시 있다고 알려주는 타입 단언을 붙였습니다.
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
