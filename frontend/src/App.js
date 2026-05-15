// App.js - 페이지 라우팅 메인 파일
// Login은 이제 팝업 모달이라 별도 라우트 없음

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home      from './Kim_frontend_code/Home_K';
import Analysis  from './Kim_frontend_code/Analysis_K';
import Dashboard from './Kim_frontend_code/Dashboard_K';
import Mypage    from './Kim_frontend_code/Mypage_K';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/analysis"  element={<Analysis />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mypage"    element={<Mypage />} />
      </Routes>
    </BrowserRouter>
  );
}