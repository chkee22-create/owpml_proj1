import React, { useState } from 'react';
import styled from 'styled-components';
import { palette } from '../shared/palette';

/* ==========================================================================
   🎨 1. 공통 및 메인 레이아웃 스타일
   ========================================================================== */
const ProjectsContainer = styled.div`
  flex: 1; padding: 40px 52px; background: #ffffff; overflow-y: auto; box-sizing: border-box;
`;

const HeaderSection = styled.div`
  margin-bottom: 32px;
  h2 { font-size: 22px; font-weight: 800; color: #1e293b; margin: 0; }
`;

const SectionTitleRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; 
  h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0; } 
  
  .btn-group {
    display: flex; gap: 10px;
  }

  .sub-btn { 
    background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; 
    font-weight: 700; color: #64748b; font-size: 12px; cursor: pointer; transition: all 0.15s;
    &:hover { background: #f8fafc; color: #1e293b; }
  } 

  .primary-btn {
    background: #0ea5a4; color: #ffffff; border: none; border-radius: 8px;
    padding: 10px 18px; font-size: 14px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 6px; transition: background 0.15s;
    &:hover { background: #0d9493; }
  }
`;

/* ==========================================================================
   🎨 2. 시각화 보관함 및 프로젝트 카드 스타일
   ========================================================================== */
const VisualSection = styled.div` margin-bottom: 48px; `;
const VisualBoxContainer = styled.div` display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; `;

const VisualCard = styled.div`
  border: 1px solid #e2e8f0; border-radius: 12px; background: white; padding: 16px;
  cursor: pointer; transition: all 0.2s ease-in-out; box-sizing: border-box;
  position: relative; /* 💡 삭제 버튼 위치의 기준점 */

  &:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04); border-color: #cbd5e1; }

  /* 💡 삭제 버튼: 평소엔 투명하다가 호버 시 등장 */
  .delete-visual-btn {
    position: absolute; top: 12px; right: 12px;
    background: rgba(255, 255, 255, 0.9); border: 1px solid #e2e8f0;
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #94a3b8; font-size: 12px; cursor: pointer;
    opacity: 0; transition: all 0.2s; z-index: 10;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    
    &:hover { color: #e74c3c; border-color: #fca5a5; background: #fef2f2; }
  }

  &:hover .delete-visual-btn { opacity: 1; }

  .mock-img { 
    height: 80px; background: #f1f5f9; border-radius: 8px; margin-bottom: 12px; 
    display: flex; align-items: center; justify-content: center; 
    font-size: 24px; color: #0ea5a4; 
  }
  h4 { margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #1e293b; }
  span { font-size: 11.5px; color: #94a3b8; font-weight: 600; }
`;

const ProjectGrid = styled.div` display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; `;
const ProjectCard = styled.div`
  background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;
  display: flex; flex-direction: column; position: relative; height: 180px; box-sizing: border-box;
  cursor: pointer; transition: all 0.2s ease-in-out;
  &:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04); border-color: #cbd5e1; }
  
  .tag { align-self: flex-start; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 12px; margin-bottom: 12px; &.hwp { background: #e6f4f4; color: #0ea5a4; } }
  h3 { font-size: 16px; font-weight: 800; color: #1e293b; margin: 0 0 6px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; }
  .title-input { font-size: 16px; font-weight: 800; color: #1e293b; margin: 0 0 6px 0; padding: 2px 6px; border: 1px solid #0ea5a4; border-radius: 4px; outline: none; width: 80%; box-sizing: border-box; font-family: inherit; background: #f8fafc; }
  .date { font-size: 11px; color: #94a3b8; font-weight: 700; margin-bottom: auto; }
  .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 12px; }
  .meta-info { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #64748b; font-weight: 700; i { color: #94a3b8; } }
  .action-btns { display: flex; gap: 10px; button { background: none; border: none; font-size: 15px; color: #94a3b8; cursor: pointer; transition: color 0.1s; &.edit-icon-btn:hover { color: #1e293b; } &.delete-icon-btn:hover { color: #e74c3c; } } }
  .profile-thumbnail { position: absolute; right: 24px; top: 24px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: transparent; i { font-size: 32px; color: ${palette.slate[4]}; } }
`;
const EmptyCard = styled.div`
  background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 180px; cursor: pointer; color: #94a3b8; font-weight: 700; font-size: 13.5px; gap: 6px; box-sizing: border-box; transition: all 0.2s ease-in-out;
  &:hover { transform: translateY(-2px); border-color: #0ea5a4; color: #0ea5a4; }
`;

/* ==========================================================================
   🎨 3. 전체보기 모달 (View All Modal) 스타일
   ========================================================================== */
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(2px);
  display: flex; justify-content: center; align-items: center; z-index: 900;
`;
const ModalContent = styled.div`
  background: #ffffff; width: 800px; max-height: 85vh; border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; overflow: hidden;
  .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; border-bottom: 1px solid #e2e8f0; h3 { margin: 0; font-size: 20px; font-weight: 800; color: #1e293b; } button { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; transition: 0.15s; &:hover { color: #1e293b; } } }
  .modal-body { padding: 32px; overflow-y: auto; flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
`;

/* ==========================================================================
   🎨 4. 사이드 드로어 (Side Drawer) 스타일
   ========================================================================== */
const DrawerBackdrop = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.15); backdrop-filter: blur(1px); display: ${props => props.$show ? 'block' : 'none'}; z-index: 1000;
`;
const DrawerContainer = styled.div`
  position: fixed; top: 0; right: ${props => props.$show ? '0' : '-460px'}; width: 420px; height: 100vh; background: #ffffff; box-shadow: -10px 0 30px -5px rgba(0, 0, 0, 0.08); border-left: 1px solid #e2e8f0; z-index: 1001; transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1); padding: 40px 32px; box-sizing: border-box; display: flex; flex-direction: column;
  .drawer-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; .title-wrap { h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0 0 6px 0; } span { font-size: 12px; color: #94a3b8; font-weight: 600; } } .close-btn { background: none; border: none; font-size: 18px; color: #94a3b8; cursor: pointer; &:hover { color: #1e293b; } } }
  .drawer-body { flex: 1; overflow-y: auto; .visual-preview { width: 100%; height: 180px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; font-size: 52px; color: #0ea5a4; } .info-section { margin-bottom: 24px; h5 { font-size: 13px; font-weight: 800; color: #475569; margin: 0 0 8px 0; } p { font-size: 13.5px; color: #334155; line-height: 1.6; margin: 0; font-weight: 500; } } .details-list { background: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 16px; display: flex; flex-direction: column; gap: 12px; .detail-item { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 600; .lbl { color: #64748b; } .val { color: #1e293b; font-weight: 700; } } } }
  .drawer-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid #f1f5f9; .action-btn { width: 100%; background: #1e293b; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 13.5px; font-weight: 700; cursor: pointer; &:hover { background: #0f172a; } } }
`;

/* ==========================================================================
   📦 메인 컴포넌트 로직
   ========================================================================== */
function Projects() {
  // 💡 1. 프로젝트 상태
  const [projects, setProjects] = useState([
    { id: 1, type: 'PDF x 3', title: '이미지 분류', date: '2026.05.04', charts: 2, isHwp: false },
    { id: 2, type: 'hwp', title: '자연어 처리', date: '2026.05.04', charts: 2, isHwp: true },
    { id: 3, type: 'PDF', title: '논문 분석 처리', date: '2026.05.04', charts: 0, isHwp: false },
  ]);

  // 💡 2. 저장된 시각화 데이터를 useState 상태로 변경 (최대 10개 관리를 위함)
  const [visuals, setVisuals] = useState([
    { id: 101, title: '정확도 비교 차트', date: '2026.05.13', icon: 'fa-chart-column', desc: '모델 성능 모니터링 결과물입니다.', details: [ {lbl: '데이터 모델', val: 'LangChain RAG'}, {lbl: '정확도', val: '94.2%'} ] },
    { id: 102, title: '데이터셋 분포', date: '2026.04.22', icon: 'fa-chart-pie', desc: '포맷별 정제 데이터 통계량입니다.', details: [ {lbl: '총 파일 수', val: '24개'}, {lbl: 'PDF 문서', val: '65%'} ] },
    { id: 103, title: '모델 성능 비교표', date: '2026.03.04', icon: 'fa-table-cells', desc: '응답 지연 시간(Latency) 비교 테이블입니다.', details: [ {lbl: 'Vector DB', val: 'Pinecone'}, {lbl: 'Latency', val: '1.2s'} ] },
    { id: 104, title: '토큰 소모량 추이', date: '2026.02.15', icon: 'fa-chart-line', desc: '일별 API 토큰 사용량 트렌드 그래프입니다.', details: [ {lbl: '최대 사용일', val: '02.12'}, {lbl: '총 소모량', val: '142k'} ] },
    { id: 105, title: '사용자 질의 패턴', date: '2026.01.28', icon: 'fa-cloud', desc: '가장 많이 질문된 키워드 워드클라우드입니다.', details: [ {lbl: 'Top 키워드', val: '할루시네이션'}, {lbl: '분석 문서 수', val: '88건'} ] },
  ]);

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  
  const [selectedVisual, setSelectedVisual] = useState(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  /* --- 프로젝트 핸들러 --- */
  const handleAddProject = (e) => {
    e.preventDefault();
    if (projects.length >= 10) { alert("프로젝트는 최대 10개까지 생성 가능합니다."); return; }
    setProjects([...projects, { id: Date.now(), type: 'New', title: `새 프로젝트 ${projects.length + 1}`, date: new Date().toLocaleDateString('ko-KR').replace(/. /g, '.').slice(0, -1), charts: 0, isHwp: false }]);
  };

  const handleDeleteProject = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if(window.confirm("이 프로젝트를 정말 삭제하시겠습니까?")) {
      setProjects(projects.filter(project => project.id !== id));
      if (editingProjectId === id) setEditingProjectId(null);
    }
  };

  const handleEditClick = (e, project) => { e.preventDefault(); e.stopPropagation(); setEditingProjectId(project.id); setEditTitle(project.title); };
  const handleTitleSave = () => { if (!editTitle.trim()) return; setProjects(projects.map(p => p.id === editingProjectId ? { ...p, title: editTitle.trim(), date: new Date().toLocaleDateString('ko-KR').replace(/. /g, '.').slice(0, -1) } : p)); setEditingProjectId(null); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleTitleSave(); else if (e.key === 'Escape') setEditingProjectId(null); };

  /* 💡 --- 시각화 데이터 핸들러 --- */
  const handleAddVisualTest = (e) => {
    e.preventDefault();
    if (visuals.length >= 10) {
      alert("시각화 보관함은 최대 10개까지만 저장할 수 있습니다. 기존 데이터를 삭제해주세요.");
      return;
    }
    const newVisual = { 
      id: Date.now(), title: `새로운 차트 ${visuals.length + 1}`, date: new Date().toLocaleDateString('ko-KR').replace(/. /g, '.').slice(0, -1), 
      icon: 'fa-chart-area', desc: '새로 저장된 시각화 데이터입니다.', details: [ {lbl: '상태', val: 'New'} ] 
    };
    setVisuals([newVisual, ...visuals]); // 최신 항목이 맨 앞으로 오게 추가
  };

  const handleDeleteVisual = (e, id) => {
    e.preventDefault(); 
    e.stopPropagation(); // 카드 전체 클릭(사이드 드로어 열림) 이벤트 방지
    if(window.confirm("이 시각화 데이터를 삭제하시겠습니까?")) {
      setVisuals(visuals.filter(visual => visual.id !== id));
      // 만약 현재 삭제하는 카드의 드로어가 열려있다면 같이 닫아줌
      if (selectedVisual && selectedVisual.id === id) {
        setSelectedVisual(null);
      }
    }
  };

  return (
    <ProjectsContainer>
      <HeaderSection><h2>내 프로젝트</h2></HeaderSection>

      {/* 1. 시각화 보관함 영역 (메인 화면) */}
      <VisualSection>
        <SectionTitleRow>
          {/* 💡 제목 옆에 10개 제한 카운터 표시 */}
          <h3>저장된 시각화 보관함 <span style={{fontSize: '14px', color: '#94a3b8', fontWeight: '600', marginLeft: '6px'}}>({visuals.length}/10)</span></h3>
          <div className="btn-group">
            
            <button type="button" className="sub-btn" onClick={() => setIsViewAllOpen(true)}>전체 보기</button>
          </div>
        </SectionTitleRow>
        
        <VisualBoxContainer>
          {visuals.slice(0, 3).map((visual) => (
            <VisualCard key={visual.id} onClick={() => setSelectedVisual(visual)}>
              {/* 💡 카드 우측 상단 삭제 버튼 배치 */}
              <button className="delete-visual-btn" onClick={(e) => handleDeleteVisual(e, visual.id)} title="시각화 데이터 삭제">
                <i className="fa-solid fa-trash"></i>
              </button>
              
              <div className="mock-img"><i className={`fa-solid ${visual.icon}`}></i></div>
              <h4>{visual.title}</h4>
              <span>{visual.date}</span>
            </VisualCard>
          ))}
        </VisualBoxContainer>
      </VisualSection>

      {/* 2. 진행 중인 프로젝트 영역 */}
      <SectionTitleRow>
        <h3>진행 중인 프로젝트 <span style={{fontSize: '14px', color: '#94a3b8', fontWeight: '600', marginLeft: '8px'}}>({projects.length}/10)</span></h3>
        <button type="button" className="primary-btn" onClick={handleAddProject}>+ 새 프로젝트...</button>
      </SectionTitleRow>
      <ProjectGrid>
        {projects.map((project) => (
          <ProjectCard key={project.id}>
            <div className={`tag ${project.isHwp ? 'hwp' : ''}`}>{project.type}</div>
            {editingProjectId === project.id ? (
              <input type="text" className="title-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={handleTitleSave} onKeyDown={handleKeyDown} autoFocus onClick={(e) => e.stopPropagation()} />
            ) : ( <h3>{project.title}</h3> )}
            <div className="date">최근 수정 {project.date}</div>
            <div className="profile-thumbnail"><i className="fa-regular fa-circle-user"></i></div>
            <div className="card-footer">
              <div className="meta-info"><span><i className="fa-solid fa-user"></i> 개인</span> {project.charts > 0 && ( <span><i className="fa-solid fa-box-archive"></i> 차트 {project.charts}개</span> )}</div>
              <div className="action-btns">
                <button type="button" className="edit-icon-btn" onClick={(e) => handleEditClick(e, project)}><i className="fa-solid fa-pen"></i></button>
                <button type="button" className="delete-icon-btn" onClick={(e) => handleDeleteProject(e, project.id)}><i className="fa-solid fa-trash"></i></button>
              </div>
            </div>
          </ProjectCard>
        ))}
        {projects.length < 10 && ( <EmptyCard onClick={handleAddProject}><span className="plus-icon">+</span><span>새 프로젝트 추가</span></EmptyCard> )}
      </ProjectGrid>

      {/* ==========================================================================
         🔓 3. 전체보기 모달 레이아웃 (이 안에서도 삭제 가능)
         ========================================================================== */}
      {isViewAllOpen && (
        <ModalOverlay onClick={() => setIsViewAllOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>모든 시각화 보관함 ({visuals.length}/10)</h3>
              <button onClick={() => setIsViewAllOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              {visuals.map((visual) => (
                <VisualCard key={visual.id} onClick={() => setSelectedVisual(visual)}>
                  {/* 💡 전체보기 모달 안에서도 삭제 기능 활성화 */}
                  <button className="delete-visual-btn" onClick={(e) => handleDeleteVisual(e, visual.id)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                  <div className="mock-img"><i className={`fa-solid ${visual.icon}`}></i></div>
                  <h4>{visual.title}</h4>
                  <span>{visual.date}</span>
                </VisualCard>
              ))}
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ==========================================================================
         🔓 4. 사이드 드로어
         ========================================================================== */}
      <DrawerBackdrop $show={!!selectedVisual} onClick={() => setSelectedVisual(null)} />
      <DrawerContainer $show={!!selectedVisual}>
        {selectedVisual && (
          <>
            <div className="drawer-header">
              <div className="title-wrap"><h3>{selectedVisual.title}</h3><span>저장 일자: {selectedVisual.date}</span></div>
              <button type="button" className="close-btn" onClick={() => setSelectedVisual(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="drawer-body">
              <div className="visual-preview"><i className={`fa-solid ${selectedVisual.icon}`}></i></div>
              <div className="info-section"><h5>데이터 분석 요약</h5><p>{selectedVisual.desc}</p></div>
              <div className="info-section">
                <h5>세부 정보 필드</h5>
                <div className="details-list">
                  {selectedVisual.details.map((item, idx) => (
                    <div className="detail-item" key={idx}><span className="lbl">{item.lbl}</span><span className="val">{item.val}</span></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="drawer-footer">
              {/* 💡 하단에 드로어 안에서도 해당 데이터 삭제할 수 있는 기능 연결 시도 가능 (현재는 다운로드 버튼) */}
              <button type="button" className="action-btn">보고서 데이터 다운로드 (PNG)</button>
            </div>
          </>
        )}
      </DrawerContainer>

    </ProjectsContainer>
  );
}

export default Projects;