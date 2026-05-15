import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // App.js를 불러옵니다.

// public/index.html에 있는 'root'라는 아이디를 가진 div를 찾아 리액트 뿌리를 내립니다.
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);