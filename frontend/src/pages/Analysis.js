import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  AiRow,
  BottomPromptInput,
  Container,
  MainQAEngine,
  StreamMessageArea,
  TopMenuBar,
  UserRow,
} from './styles/Analysis.styles';
import { analysisAPI, projectAPI } from '../services/api';
import {
  getProjectsKey,
  getRecentConversationsKey,
  readJson,
  SHARED_PROJECTS_KEY,
  writeJson,
} from '../utils/storageKeys';

const MainLayout = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  min-width: 0;
  overflow: hidden;
`;

const VisualPanel = styled.div`
  width: 220px;
  flex: 0 0 220px;
  border-right: 1px solid #e2e8f0;
  padding: 16px;
  overflow-y: auto;
  background: #fcfcfc;
  box-sizing: border-box;

  .title {
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 12px;
    color: #64748b;
  }

  .action-btn {
    display: block;
    width: 100%;
    margin-bottom: 8px;
    padding: 10px;
    background: #e0f2fe;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 800;
    color: #0369a1;
  }

  .asset-item {
    font-size: 13px;
    padding: 10px;
    border-bottom: 1px solid #eee;
    color: #475569;
    font-weight: 650;
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

const ApiKeyBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 8px;
  background: #ffffff;

  input {
    width: 180px;
    border: none;
    outline: none;
    font-size: 12px;
    font-weight: 700;
    color: #334155;
  }

  button {
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    min-width: 18px;
    color: #94a3b8 !important;
  }
`;

const AssetCard = styled.div`
  width: min(720px, 92%);
  margin: 8px auto;
  padding: 18px;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  background: #f8fbff;
  color: #1e293b;

  strong {
    display: block;
    margin-bottom: 8px;
    font-size: 15px;
  }

  p {
    margin: 0 0 12px 0;
    color: #475569;
    line-height: 1.55;
  }

  button {
    border: none;
    border-radius: 8px;
    padding: 9px 13px;
    background: #0ea5a4;
    color: #ffffff;
    font-weight: 800;
    cursor: pointer;
  }
`;

const SaveModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.36);
`;

const SaveModal = styled.div`
  width: min(360px, calc(100vw - 32px));
  background: #ffffff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.18);

  h3 {
    margin: 0 0 18px 0;
    color: #0f172a;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  button {
    flex: 1;
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
    font-weight: 800;
    cursor: pointer;
  }

  .primary {
    background: #0ea5a4;
    color: #ffffff;
  }

  .secondary {
    background: #f1f5f9;
    color: #475569;
  }
`;

const createInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const formatDate = () => new Date().toLocaleDateString('ko-KR').replace(/. /g, '.').slice(0, -1);

const toStoredThread = (messages) =>
  messages
    .filter((message) => ['ai', 'user', 'asset', 'system'].includes(message.role))
    .map((message, index) => ({
      id: message.id || `thread-${Date.now()}-${index}`,
      role: message.role,
      title: message.title,
      text: message.text || message.title || '',
      rows: message.rows,
      kind: message.kind,
    }));

const toStoredFiles = (files) =>
  files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified || Date.now()}`,
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  }));

function AnalysisC({ projectId, projectTitle, restoredData }) {
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const [savedProjectId, setSavedProjectId] = useState(null);
  const effectiveProjectId = savedProjectId || projectId || restoredData?.projectId;

  const [files, setFiles] = useState([]);
  const [promptText, setPromptText] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState(() => sessionStorage.getItem('papermate.openaiApiKey') || '');
  const [messages, setMessages] = useState([
    { id: 'intro', role: 'ai', text: '분석을 시작하려면 파일을 업로드하거나 질문을 입력하세요.' },
  ]);
  const [visuals, setVisuals] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);

  const handleOpenaiApiKeyChange = (event) => {
    const nextKey = event.target.value.trim();
    setOpenaiApiKey(nextKey);
    if (nextKey) sessionStorage.setItem('papermate.openaiApiKey', nextKey);
    else sessionStorage.removeItem('papermate.openaiApiKey');
  };

  const clearOpenaiApiKey = () => {
    setOpenaiApiKey('');
    sessionStorage.removeItem('papermate.openaiApiKey');
  };

  useEffect(() => {
    const allProjects = readJson(getProjectsKey(), []);
    const currentProject = Array.isArray(allProjects)
      ? allProjects.find((project) => project.id === effectiveProjectId)
      : null;
    if (currentProject) setVisuals(currentProject.visuals || []);
  }, [effectiveProjectId]);

  useEffect(() => {
    if (!restoredData?.thread?.length) return;
    const restoredMessages = restoredData.thread
      .filter((item) => item.role === 'ai' || item.role === 'user' || item.role === 'asset')
      .map((item, index) => ({
        id: `restored-${item.id || index}`,
        role: item.role,
        title: item.title,
        text: item.text || item.title || '',
        rows: item.rows,
      }));
    if (restoredMessages.length > 0) setMessages(restoredMessages);
  }, [restoredData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAnalyzing]);

  const handleFileChange = (event) => {
    const nextFiles = Array.from(event.target.files || []);
    if (nextFiles.length === 0) return;

    setFiles((prev) => [...prev, ...nextFiles]);
    setMessages((prev) => [
      ...prev,
      ...nextFiles.map((file) => ({
        id: Date.now() + Math.random(),
        role: 'system',
        text: `파일: ${file.name}이(가) 업로드되었습니다.`,
      })),
    ]);
  };

  const handleSendMessage = async () => {
    const nextQuestion = promptText.trim();
    if (!nextQuestion || isAnalyzing) return;

    setPromptText('');
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: nextQuestion }]);

    if (files.length === 0) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: 'GPT 분석을 하려면 먼저 문서나 이미지를 업로드해주세요.' },
      ]);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await analysisAPI.chat(nextQuestion, files, openaiApiKey);
      const sourceLabel = response.data.llm_used
        ? `\n\n분석 엔진: LLM (${response.data.model})`
        : '\n\n분석 엔진: 기본 문서 추출';
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: `${response.data.answer}${sourceLabel}` },
      ]);
    } catch (error) {
      const message = error.response?.data?.detail || '분석 서버와 연결할 수 없습니다. 백엔드를 실행한 뒤 다시 시도해주세요.';
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', text: message }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateVisual = (type) => {
    const newAsset = {
      id: Date.now(),
      role: 'asset',
      kind: type,
      title: type === 'table' ? '분석 결과 비교 표' : '정확도 성능 비교 그래프',
      text: 'AI가 분석한 논문별 주요 데이터를 시각화했습니다.',
    };
    setMessages((prev) => [...prev, newAsset]);
  };

  const handleSaveAnalysisProject = async () => {
    if (isSavingProject) return;

    const defaultTitle =
      projectTitle ||
      restoredData?.projectTitle ||
      files[0]?.name?.replace(/\.[^.]+$/, '') ||
      '새 분석 프로젝트';
    const title = window.prompt('프로젝트명을 입력하세요.', defaultTitle);
    if (!title?.trim()) return;

    const projectsKey = getProjectsKey();
    const recentConversationsKey = getRecentConversationsKey();
    const savedProjects = readJson(projectsKey, []);
    const existingProject = Array.isArray(savedProjects)
      ? savedProjects.find((project) => project.id === effectiveProjectId)
      : null;
    const today = formatDate();
    const projectRecord = {
      ...(existingProject || {}),
      id: existingProject?.id || effectiveProjectId || `project-${Date.now()}`,
      type: files.some((file) => file.name.toLowerCase().endsWith('.hwp') || file.name.toLowerCase().endsWith('.hwpx'))
        ? 'HWP'
        : '분석',
      title: title.trim(),
      owner: localStorage.getItem('username') || 'Guest',
      updatedAt: today,
      date: today,
      charts: visuals.length,
      isHwp: files.some((file) => file.name.toLowerCase().endsWith('.hwp') || file.name.toLowerCase().endsWith('.hwpx')),
      inviteCode: existingProject?.inviteCode || restoredData?.inviteCode || createInviteCode(),
      files: toStoredFiles(files),
      thread: toStoredThread(messages),
      visuals,
    };

    const nextProjects = [
      projectRecord,
      ...(Array.isArray(savedProjects)
        ? savedProjects.filter((project) => project.id !== projectRecord.id)
        : []),
    ].slice(0, 10);

    const savedRecents = readJson(recentConversationsKey, []);
    const lastUserMessage = [...projectRecord.thread].reverse().find((item) => item.role === 'user');
    const nextRecent = {
      id: projectRecord.id,
      projectId: projectRecord.id,
      title: projectRecord.title,
      question: lastUserMessage?.text || projectRecord.title,
      date: today,
      inviteCode: projectRecord.inviteCode,
    };

    setIsSavingProject(true);
    try {
      writeJson(projectsKey, nextProjects);
      writeJson(recentConversationsKey, [
        nextRecent,
        ...(Array.isArray(savedRecents)
          ? savedRecents.filter((item) => item.projectId !== projectRecord.id && item.id !== projectRecord.id)
          : []),
      ].slice(0, 3));

      const sharedProjects = readJson(SHARED_PROJECTS_KEY, []);
      writeJson(SHARED_PROJECTS_KEY, [
        projectRecord,
        ...(Array.isArray(sharedProjects)
          ? sharedProjects.filter((project) => project.id !== projectRecord.id && project.inviteCode !== projectRecord.inviteCode)
          : []),
      ].slice(0, 100));

      try {
        await projectAPI.save(projectRecord);
      } catch (error) {
        console.warn('MongoDB project save skipped:', error);
      }

      setSavedProjectId(projectRecord.id);
      window.alert('프로젝트 페이지와 최근 대화에 저장되었습니다.');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleSaveToProject = () => {
    if (!effectiveProjectId || !selectedAsset) return;

    const allProjects = readJson(getProjectsKey(), []);
    const updatedProjects = Array.isArray(allProjects)
      ? allProjects.map((project) => {
          if (project.id !== effectiveProjectId) return project;
          const newVisualItem = {
            ...selectedAsset,
            date: new Date().toLocaleDateString(),
            projectTitle: project.title || projectTitle || restoredData?.projectTitle,
          };
          const updatedVisuals = [...(project.visuals || []), newVisualItem];
          setVisuals(updatedVisuals);
          return { ...project, visuals: updatedVisuals, charts: updatedVisuals.length };
        })
      : [];

    writeJson(getProjectsKey(), updatedProjects);
    window.alert('보관함에 저장되었습니다.');
    setShowSaveModal(false);
    setSelectedAsset(null);
  };

  return (
    <Container>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} multiple />
      <MainLayout>
        <VisualPanel>
          <div className="title">시각화 보관함</div>
          <button className="action-btn" type="button" onClick={() => handleCreateVisual('table')}>표 그리기</button>
          <button className="action-btn" type="button" onClick={() => handleCreateVisual('graph')}>그래프 그리기</button>
          {visuals.map((visual, index) => (
            <div key={`${visual.id}-${index}`} className="asset-item">저장됨 {visual.title}</div>
          ))}
        </VisualPanel>

        <MainQAEngine>
          <TopMenuBar>
            <h2>AI 분석 Q&A</h2>
            <div className="actions">
              <ApiKeyBox>
                <input
                  type="password"
                  value={openaiApiKey}
                  placeholder="OpenAI API key"
                  onChange={handleOpenaiApiKeyChange}
                  autoComplete="off"
                />
                {openaiApiKey && (
                  <button type="button" onClick={clearOpenaiApiKey} aria-label="API 키 지우기">x</button>
                )}
              </ApiKeyBox>
              <button type="button" onClick={handleSaveAnalysisProject} disabled={isSavingProject}>
                {isSavingProject ? '저장 중...' : '프로젝트 저장'}
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}>파일 업로드</button>
            </div>
          </TopMenuBar>

          <StreamMessageArea ref={scrollRef}>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'ai' ? (
                  <AiRow><div className="ai-box">{message.text}</div></AiRow>
                ) : message.role === 'user' ? (
                  <UserRow><div className="user-box">{message.text}</div></UserRow>
                ) : message.role === 'asset' ? (
                  <AssetCard>
                    <strong>{message.title}</strong>
                    <p>{message.text}</p>
                    <button type="button" onClick={() => { setSelectedAsset(message); setShowSaveModal(true); }}>
                      저장하기
                    </button>
                  </AssetCard>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>{message.text}</div>
                )}
              </div>
            ))}
            {isAnalyzing && <AiRow><div className="ai-box">GPT가 문서를 분석하고 있습니다...</div></AiRow>}
          </StreamMessageArea>

          <BottomPromptInput>
            <div className="input-wrapper">
              <input
                value={promptText}
                placeholder="분석 질문을 입력하세요..."
                onChange={(event) => setPromptText(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
              />
              <button type="button" onClick={handleSendMessage}>전송</button>
            </div>
          </BottomPromptInput>
        </MainQAEngine>
      </MainLayout>

      {showSaveModal && (
        <SaveModalBackdrop>
          <SaveModal>
            <h3>저장하시겠습니까?</h3>
            <div className="actions">
              <button className="primary" type="button" onClick={handleSaveToProject}>확인</button>
              <button className="secondary" type="button" onClick={() => setShowSaveModal(false)}>취소</button>
            </div>
          </SaveModal>
        </SaveModalBackdrop>
      )}
    </Container>
  );
}

export default AnalysisC;
