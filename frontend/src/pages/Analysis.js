import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Container,
  MainQAEngine,
  TopMenuBar,
  StreamMessageArea,
  BottomPromptInput,
  UserRow,
  AiRow,
} from './styles/Analysis.styles';
import { getProjectsKey, readJson, writeJson } from '../utils/storageKeys';

// 좌측 시각화 보관함 및 레이아웃 스타일
const MainLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  height: 100%;
`;

const VisualPanel = styled.div`
  width: 20%;
  border-right: 1px solid #e2e8f0;
  padding: 16px;
  overflow-y: auto;
  background: #fcfcfc;
  .title { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #64748b; }
  .action-btn { 
    display: block; width: 100%; margin-bottom: 8px; padding: 10px; 
    background: #e0f2fe; border: none; border-radius: 8px; cursor: pointer; 
    font-weight: 700; color: #0369a1;
  }
  .asset-item { 
    font-size: 13px; padding: 10px; border-bottom: 1px solid #eee; 
    color: #475569; font-weight: 500;
  }
`;

function AnalysisC({ projectId, projectTitle }) {
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  // --- 상태 관리 ---
  const [promptText, setPromptText] = useState('');
  const [messages, setMessages] = useState([
    { id: 'intro', role: 'ai', text: '3개의 논문을 업로드하셨네요! 어떤 내용이 궁금하신가요? 각 논문의 핵심 내용, 실험 결과 비교, 또는 방법론 차이점을 분석해드릴 수 있어요.' }
  ]);
  const [visuals, setVisuals] = useState([]); // 시각화 보관함 리스트
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null); // 저장할 대상 차트

  // --- 스크롤 자동 하단 이동 ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- 1. 파일 업로드 알림 기능 ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newMessages = files.map(file => ({
        id: Date.now() + Math.random(),
        role: 'system',
        text: `📎 파일: ${file.name}이(가) 성공적으로 업로드되었습니다.`
      }));
      setMessages(prev => [...prev, ...newMessages]);
    }
  };

  // --- 2. 채팅 전송 시뮬레이션 ---
  const handleSendMessage = () => {
    if (!promptText.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: promptText };
    setMessages(prev => [...prev, userMsg]);
    setPromptText('');

    // AI 답변 시뮬레이션
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'ai', 
        text: `요청하신 "${userMsg.text}"에 대한 분석을 진행 중입니다...` 
      }]);
    }, 1000);
  };

  // --- 3. 시각화 생성 (표/그래프 그리기) ---
  const handleCreateVisual = (type) => {
    const assetId = Date.now();
    const newAsset = {
      id: assetId,
      kind: type, // 'table' or 'graph'
      title: type === 'table' ? '📊 분석 결과 비교 표' : '📈 정확도 성능 비교 그래프',
      text: 'AI가 분석한 논문별 주요 벤치마크 데이터를 시각화했습니다.',
      desc: '논문들 사이의 성능 지표를 수치화한 데이터셋입니다.',
      details: [{ lbl: '정확도', val: '98.2%' }, { lbl: '처리속도', val: '45ms' }]
    };

    setMessages(prev => [...prev, { 
      role: 'asset', 
      ...newAsset 
    }]);
  };

  // --- 4. 프로젝트 보관함 저장 로직 (localStorage & Share 연동) ---
  const handleSaveToProject = () => {
    console.log("저장 버튼 클릭됨 - projectId:", projectId, "selectedAsset:", selectedAsset); // 1. 로그 추가

    if (!projectId || !selectedAsset) {
      alert("데이터가 없습니다. 다시 시도해주세요.");
      return;
    }

    try {
      const allProjects = readJson(getProjectsKey(), []);
      console.log("현재 저장소 데이터:", allProjects); // 2. 데이터 확인

      const updatedProjects = allProjects.map(p => {
        if (p.id === projectId) {
          const newVisualItem = {
            ...selectedAsset,
            id: Date.now(), // 고유 ID 부여
            projectTitle: projectTitle,
            date: new Date().toLocaleDateString('ko-KR')
          };
          return {
            ...p,
            visuals: [...(p.visuals || []), newVisualItem],
            charts: (p.visuals || []).length + 1
          };
        }
        return p;
      });

      console.log("업데이트된 프로젝트 리스트:", updatedProjects); // 3. 데이터 변화 확인
      writeJson(getProjectsKey(), updatedProjects); // 4. 실제 저장
      
      // 5. 이벤트 발송 확인
      window.dispatchEvent(new CustomEvent('papermate-storage-updated', { 
        detail: { key: getProjectsKey() } 
      }));
      console.log("이벤트 발송 완료!");

      alert('프로젝트 보관함에 저장되었습니다.');
      setShowSaveModal(false);
      setSelectedAsset(null);
      
    } catch (error) {
      console.error("저장 중 오류 발생:", error); // 6. 오류 catch
      alert("저장 중 오류가 발생했습니다. 콘솔을 확인하세요.");
    }
  };

  return (
    <Container>
      {/* 파일 업로드 숨김 인풋 */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} multiple />

      <MainLayout>
        {/* 좌측 시각화 보관함 */}
        <VisualPanel>
          <div className="title">시각화 보관함</div>
          <button className="action-btn" onClick={() => handleCreateVisual('table')}>표 그리기</button>
          <button className="action-btn" onClick={() => handleCreateVisual('graph')}>그래프 그리기</button>
          <div style={{ marginTop: '20px' }}>
            {visuals.map((v, i) => (
              <div key={i} className="asset-item">✅ {v.title}</div>
            ))}
          </div>
        </VisualPanel>

        {/* 메인 분석 엔진 */}
        <MainQAEngine style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <TopMenuBar>
            <h2>AI 분석 Q&A</h2>
            <div className="actions">
              <button onClick={() => alert('전체 차트를 저장합니다.')}>차트 저장</button>
              <button>공유</button>
            </div>
          </TopMenuBar>
          
          <StreamMessageArea ref={scrollRef} style={{ flex: 1, overflowY: 'auto' }}>
            {messages.map((m) => (
              <div key={m.id}>
                {m.role === 'ai' ? (
                  <AiRow>
                    <div className="ai-icon">AI</div>
                    <div className="ai-box">{m.text}</div>
                  </AiRow>
                ) : m.role === 'user' ? (
                  <UserRow><div className="user-box">{m.text}</div></UserRow>
                ) : m.role === 'system' ? (
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', margin: '15px 0' }}>{m.text}</div>
                ) : m.role === 'asset' ? (
                  /* 시각화 결과물 카드 */
                  <div style={{ 
                    margin: '20px auto', padding: '20px', width: '80%',
                    border: '2px solid #3b82f6', borderRadius: '12px', background: '#fff' 
                  }}>
                    <strong style={{ color: '#1e40af', fontSize: '16px' }}>{m.title}</strong>
                    <p style={{ margin: '10px 0', fontSize: '14px', color: '#475569' }}>{m.text}</p>
                    <button 
                      style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => { setSelectedAsset(m); setShowSaveModal(true); }}
                    >
                      보관함에 저장하기
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </StreamMessageArea>

          {/* 하단 입력창 */}
          <BottomPromptInput>
            <div className="input-wrapper">
              <i className="fa-solid fa-plus" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}></i>
              <input 
                type="text" 
                value={promptText} 
                onChange={(e) => setPromptText(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="여기에 논문 분석 질문을 입력하세요..." 
              />
              <button onClick={handleSendMessage}>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </BottomPromptInput>
        </MainQAEngine>
      </MainLayout>

      {/* 저장 확인 모달 */}
      {showSaveModal && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '15px' }}>시각화 데이터 저장</h3>
            <p style={{ marginBottom: '20px', color: '#64748b' }}>이 차트를 "{projectTitle}" 프로젝트 보관함에 저장하시겠습니까?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={handleSaveToProject} style={{ padding: '10px 20px', background: '#0ea5a4', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>저장</button>
              <button onClick={() => setShowSaveModal(false)} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>취소</button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default AnalysisC;