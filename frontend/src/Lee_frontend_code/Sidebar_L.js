import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { palette } from '../shared/palette';

/** 1. 배경색이 조건에 따라 바뀌도록 설정 */
const SidebarContainer = styled.aside`
  width: 260px; 
  height: 100vh;
  /* /qa 페이지일 때는 아주 연한 회색(gray[0]), 아닐 때는 연두색(green[0]) */
  background-color: ${props => props.isQAPage ? palette.gray[0] : palette.green[0]};
  padding: 24px; 
  display: flex; 
  flex-direction: column;
  position: fixed; 
  left: 0; 
  top: 0;
  transition: background-color 0.3s ease; /* 색상 바뀔 때 부드럽게 */
  border-right: 1px solid ${palette.gray[2]};
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: ${props => props.active ? palette.teal[9] : palette.gray[7]};
  background-color: ${props => props.active ? palette.green[2] : 'transparent'};
  padding: 12px; 
  border-radius: 8px; 
  margin-bottom: 5px;
  display: flex; 
  align-items: center; 
  gap: 10px;
  font-size: 14px;
  &:hover { background-color: ${palette.green[1]}; }
`;

/** 사진 2번의 '파일 목록' 스타일 */
const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: ${palette.gray[6]};
  cursor: pointer;
  &:hover { color: ${palette.teal[7]}; }
`;

function Sidebar() {
  const loc = useLocation();
  
  // 현재 페이지가 '비교 분석(/qa)' 페이지인지 확인하는 변수
  const isQAPage = loc.pathname === '/qa';

  return (
    <SidebarContainer isQAPage={isQAPage}>
      <div style={{fontWeight:'bold', fontSize:'20px', marginBottom:'40px', color: palette.teal[9]}}>
        Paper Mate
      </div>

      {/* --- 조건부 렌더링 시작 --- */}
      {isQAPage ? (
        /* A. 비교 분석 화면용 사이드바 (사진 2번 스타일) */
        <>
          <div style={{fontSize:'12px', color:palette.gray[5], marginBottom:'15px'}}>파일 목록</div>
          <FileItem>📄 GPT-4_Technical_Report.pdf</FileItem>
          <FileItem>📄 Attention_Is_All_You_Need.pdf</FileItem>
          <FileItem>📄 BERT_Pre-training.pdf</FileItem>
          
          <div style={{marginTop: 'auto'}}>
            <NavLink to="/" active={false}>🏠 메인으로 돌아가기</NavLink>
          </div>
        </>
      ) : (
        /* B. 일반 마이페이지용 사이드바 (사진 1, 3, 4, 5번 스타일) */
        <>
          <NavLink to="/" active={loc.pathname === '/'}>💬 새 채팅</NavLink>
          
          <div style={{fontSize:'12px', color:palette.gray[5], margin:'15px 0 10px'}}>최근 대화</div>
          <NavLink to="/qa">🗨️ Rag란 무엇인가</NavLink>
          <NavLink to="/qa">🗨️ 비교분석</NavLink>
          <NavLink to="/qa">🗨️ LLM이란 무엇인가</NavLink>
          
          <div style={{marginTop:'30px', borderTop:`1px solid ${palette.gray[2]}`, paddingTop:'20px'}}>
            <NavLink to="/share" active={loc.pathname === '/share'}>🔗 공유</NavLink>
            <NavLink to="/projects" active={loc.pathname === '/projects'}>📂 내 프로젝트</NavLink>
            <NavLink to="/qa" active={loc.pathname === '/qa'}>📊 비교 분석</NavLink>
            {/* 히스토리는 아직 안 만드셨으니 링크만 유지하거나 빼셔도 됩니다 */}
            <div style={{padding: '12px', color: palette.gray[4], fontSize: '14px'}}>🕒 히스토리 (준비중)</div>
          </div>
        </>
      )}
      {/* --- 조건부 렌더링 끝 --- */}

      {/* 유저 정보는 공통으로 하단에 배치 */}
      {!isQAPage && (
        <div style={{marginTop:'auto', display:'flex', alignItems:'center', gap:'10px', paddingTop: '20px', borderTop: `1px solid ${palette.gray[2]}`}}>
          <div style={{width:30, height:30, borderRadius:'50%', background:'#ccc'}} />
          <span style={{fontSize: '14px'}}>user14530 ⚙️</span>
        </div>
      )}
    </SidebarContainer>
  );
}

export default Sidebar;