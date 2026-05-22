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

const MAX_PROJECTS = 10;
const MAX_VISUALS = 10;

const MainLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  height: 100%;

  @media (max-width: 900px) {
    flex-direction: column;
    overflow: auto;
  }
`;

const VisualPanel = styled.div`
  flex: 0 0 30%;
  min-width: 280px;
  border-right: 1px solid #e2e8f0;
  padding: 16px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .title {
    font-size: 14px;
    font-weight: 850;
    color: #0f172a;
  }

  .hint {
    margin: -4px 0 4px 0;
    color: #64748b;
    font-size: 12px;
    font-weight: 650;
    line-height: 1.45;
  }

  .asset-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    min-height: 38px;
    padding: 9px 10px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 850;
    color: #334155;
    transition: all 0.15s ease;

    &:hover {
      border-color: #0ea5a4;
      color: #0f766e;
      background: #f0fdfa;
    }
  }

  .visual-actions {
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .asset-item {
    font-size: 12px;
    padding: 10px 11px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #ffffff;
    color: #475569;
    font-weight: 750;
    line-height: 1.45;

    strong {
      display: block;
      margin-bottom: 4px;
      color: #0f172a;
      font-size: 12.5px;
    }

    span {
      color: #94a3b8;
      font-size: 11px;
    }
  }

  @media (max-width: 900px) {
    flex: none;
    width: 100%;
    max-width: none;
    min-width: 0;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    max-height: 44vh;
  }
`;

const VisualArtifact = styled.div`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);

  .artifact-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;

    h4 {
      margin: 0;
      color: #0f172a;
      font-size: 15px;
      font-weight: 850;
    }

    span {
      flex: 0 0 auto;
      color: #0ea5a4;
      font-size: 11px;
      font-weight: 850;
    }
  }

  .artifact-body {
    padding: 16px;
  }

  .artifact-desc {
    margin: 0 0 12px 0;
    color: #475569;
    font-size: 13px;
    font-weight: 650;
    line-height: 1.55;
  }

  .save-visual {
    width: 100%;
    min-height: 38px;
    border: none;
    border-top: 1px solid #e2e8f0;
    background: #0ea5a4;
    color: #ffffff;
    font-size: 13px;
    font-weight: 850;
    cursor: pointer;
  }

  .mini-table {
    display: grid;
    grid-template-columns: minmax(96px, 0.85fr) minmax(150px, 1.5fr) 72px;
    border: 2px solid #94a3b8;
    border-radius: 10px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #e2e8f0;

    div {
      padding: 9px 10px;
      border-bottom: 1px solid #cbd5e1;
      border-right: 1px solid #cbd5e1;
      color: #334155;
      font-size: 12px;
      font-weight: 700;
      min-height: 34px;
      line-height: 1.35;
      display: flex;
      align-items: center;
    }

    div:nth-child(3n) {
      border-right: none;
      justify-content: center;
      font-variant-numeric: tabular-nums;
    }

    div:nth-last-child(-n + 3) {
      border-bottom: none;
    }

    .th {
      background: #0f766e;
      color: #ffffff;
      font-weight: 900;
      justify-content: center;
    }
  }

  .mini-graph {
    position: relative;
    height: 220px;
    display: flex;
    align-items: flex-end;
    gap: 14px;
    padding: 32px 22px 34px 42px;
    border: 2px solid #cbd5e1;
    border-radius: 10px;
    background:
      linear-gradient(#e2e8f0 1px, transparent 1px) 0 0 / 100% 25%,
      linear-gradient(90deg, #e2e8f0 1px, transparent 1px) 0 0 / 20% 100%,
      linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);

    &::before {
      content: '';
      position: absolute;
      left: 34px;
      top: 18px;
      bottom: 30px;
      width: 2px;
      background: #334155;
      border-radius: 999px;
    }

    &::after {
      content: '';
      position: absolute;
      left: 34px;
      right: 16px;
      bottom: 30px;
      height: 2px;
      background: #334155;
      border-radius: 999px;
    }

    .axis {
      position: absolute;
      color: #64748b;
      font-size: 10px;
      font-weight: 900;
    }

    .y-axis {
      top: 10px;
      left: 10px;
    }

    .x-axis {
      right: 14px;
      bottom: 8px;
    }

    .graph-line {
      position: absolute;
      left: 34px;
      right: 16px;
      top: 18px;
      bottom: 30px;
      width: calc(100% - 50px);
      height: calc(100% - 48px);
      overflow: visible;
      z-index: 2;

      polyline {
        fill: none;
        stroke: #dc2626;
        stroke-width: 3.4;
        stroke-linecap: round;
        stroke-linejoin: round;
        filter: drop-shadow(0 2px 3px rgba(220, 38, 38, 0.22));
      }

      circle {
        fill: #ffffff;
        stroke: #dc2626;
        stroke-width: 2.4;
      }
    }

    .bar-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      min-width: 0;
      height: 100%;
      position: relative;
      z-index: 1;
    }

    .bar {
      width: 100%;
      max-width: 46px;
      border-radius: 8px 8px 2px 2px;
      background: linear-gradient(180deg, #14b8a6 0%, #2563eb 100%);
      box-shadow: 0 6px 12px rgba(37, 99, 235, 0.18);
    }

    strong {
      color: #0f172a;
      font-size: 11px;
      font-weight: 900;
      font-variant-numeric: tabular-nums;
    }

    span {
      max-width: 70px;
      color: #64748b;
      font-size: 11px;
      font-weight: 750;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .mini-image {
    min-height: 180px;
    border: 1px solid #dbeafe;
    border-radius: 12px;
    background:
      radial-gradient(circle at 20% 18%, rgba(20, 184, 166, 0.18), transparent 28%),
      linear-gradient(135deg, #eff6ff 0%, #ffffff 52%, #f0fdfa 100%);
    padding: 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;

    .image-title {
      color: #0f172a;
      font-size: 18px;
      font-weight: 900;
      line-height: 1.35;
    }

    &::before {
      content: '';
      width: 100%;
      height: 54px;
      border-radius: 10px;
      background:
        linear-gradient(135deg, rgba(14, 165, 164, 0.2), rgba(37, 99, 235, 0.12)),
        repeating-linear-gradient(135deg, transparent 0 8px, rgba(14, 165, 164, 0.08) 8px 12px);
      border: 1px solid #bfdbfe;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chips span {
      padding: 6px 9px;
      border-radius: 999px;
      background: #ffffff;
      border: 1px solid #bae6fd;
      color: #0369a1;
      font-size: 11px;
      font-weight: 850;
    }
  }

  .mini-mindmap {
    position: relative;
    min-height: 230px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 22px;
    display: grid;
    grid-template-columns: minmax(120px, 0.8fr) minmax(190px, 1.4fr);
    gap: 30px;
    align-items: center;
    background:
      radial-gradient(circle at 18% 50%, rgba(14, 165, 164, 0.12), transparent 28%),
      #ffffff;

    .center-node {
      position: relative;
      z-index: 2;
      min-height: 96px;
      border-radius: 50%;
      background: #0ea5a4;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 14px;
      font-size: 13px;
      font-weight: 900;
      box-shadow: 0 12px 22px rgba(14, 165, 164, 0.22);
    }

    .tree-trunk {
      position: absolute;
      left: 34%;
      top: 50%;
      width: 16%;
      height: 3px;
      background: #94a3b8;
      transform: translateY(-50%);
      border-radius: 999px;
    }

    .branches {
      position: relative;
      z-index: 1;
      display: grid;
      gap: 10px;

      &::before {
        content: '';
        position: absolute;
        left: -17px;
        top: 16px;
        bottom: 16px;
        width: 3px;
        background: #94a3b8;
        border-radius: 999px;
      }
    }

    .branches span {
      position: relative;
      border: 1px solid #cbd5e1;
      border-left: 5px solid #2563eb;
      border-radius: 8px;
      padding: 8px 10px;
      color: #334155;
      font-size: 12px;
      font-weight: 800;
      background: #f8fafc;
      line-height: 1.35;

      &::before {
        content: '';
        position: absolute;
        left: -20px;
        top: 50%;
        width: 20px;
        height: 2px;
        background: #94a3b8;
      }
    }
  }
`;

const InviteCodePill = styled.button`
  min-height: 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  padding: 0;
  cursor: copy;

  span {
    align-self: stretch;
    display: inline-flex;
    align-items: center;
    padding: 0 10px;
    background: #64748b;
    color: #ffffff;
    font-size: 12px;
    font-weight: 850;
  }

  strong {
    min-width: 86px;
    padding: 0 12px;
    font-family: monospace;
    font-size: 13px;
    color: #0f172a;
  }

  &:hover {
    border-color: #0ea5a4;
  }
`;

const SaveInlinePanel = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 32px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;

  input {
    flex: 1;
    min-width: 0;
    height: 38px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 0 12px;
    outline: none;
    color: #0f172a;
    font-size: 13px;
    font-weight: 750;

    &:focus {
      border-color: #0ea5a4;
      box-shadow: 0 0 0 3px rgba(14, 165, 164, 0.12);
    }
  }

  button {
    min-height: 38px;
    border-radius: 8px;
    padding: 0 14px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #334155;
    font-size: 13px;
    font-weight: 850;
    cursor: pointer;
  }

  .primary {
    border-color: #0ea5a4;
    background: #0ea5a4;
    color: #ffffff;
  }

  @media (max-width: 680px) {
    padding: 10px 16px;
    flex-wrap: wrap;

    input {
      flex-basis: 100%;
    }
  }
`;

const createInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const formatDate = () => new Date().toLocaleDateString('ko-KR').replace(/. /g, '.').slice(0, -1);
const visualStorageKinds = new Set(['table', 'graph', 'image', 'mindmap']);
const isVisualStorageItem = (visual) => visualStorageKinds.has(visual?.kind || 'chart');

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

const getFileKey = (file) => `${file.name}-${file.size}-${file.lastModified || 0}`;

const getLatestAnalysisText = (messages) => {
  const latest = [...messages].reverse().find((message) => message.role === 'ai' && message.text);
  return latest?.text || '업로드한 문서의 핵심 내용을 먼저 분석한 뒤 시각화를 생성하세요.';
};

const splitMeaningfulLines = (text) =>
  String(text || '')
    .split(/\n+/)
    .map((line) => line.replace(/^[-\d.·\s]+/, '').trim())
    .filter((line) => line.length > 8)
    .slice(0, 8);

const buildLocalFallbackAnswer = (question, files, messages) => {
  const sourceText = messages
    .filter((message) => ['ai', 'asset', 'system'].includes(message.role))
    .map((message) => [message.text, message.desc, ...(message.details || []).map((detail) => detail.val)].filter(Boolean).join(' '))
    .join('\n');
  const lines = splitMeaningfulLines(sourceText);
  const fileNames = files.length > 0 ? files.map((file) => file.name || '저장 파일') : ['현재 대화 내용'];
  const keywords = lines
    .flatMap((line) => line.split(/[,\s/]+/))
    .map((word) => word.replace(/[^\w가-힣]/g, ''))
    .filter((word) => word.length >= 2 && !['파일', '업로드', '분석', '문서'].includes(word))
    .slice(0, 10);

  return [
    '로컬 기본 분석으로 처리했습니다.',
    '',
    '[핵심 내용 요약]',
    ...(lines.length ? lines.slice(0, 4).map((line, index) => `${index + 1}. ${line}`) : [
      `1. ${fileNames.join(', ')} 기준으로 분석 준비가 되어 있습니다.`,
      '2. 현재 브라우저에 원문 텍스트가 충분하지 않아 파일명과 기존 대화 중심으로만 정리했습니다.',
    ]),
    '',
    '[중요 문장 발췌]',
    ...(lines.length ? lines.slice(0, 6).map((line) => `- ${line}`) : ['- 아직 발췌할 본문 텍스트가 없습니다.']),
    '',
    '[중요 키워드]',
    keywords.length ? keywords.join(', ') : fileNames.join(', '),
    '',
    '[질문 반영]',
    question ? `질문 "${question}"에 맞춰 위 내용을 우선 정리했습니다.` : '질문이 비어 있어 전체 요약 기준으로 정리했습니다.',
  ].join('\n');
};

const makeVisualRows = (fileNames, lines) => {
  const sources = fileNames.length > 0 ? fileNames : ['업로드 문서'];
  const baseLines = lines.length
    ? lines
    : ['핵심 주제와 연구 목적', '실험 결과와 수치 후보', '방법론 차이점', '추가 검토가 필요한 내용'];

  return Array.from({ length: Math.max(4, Math.min(6, sources.length + baseLines.length - 1)) }, (_, index) => ({
    label: sources[index % sources.length],
    point: baseLines[index % baseLines.length],
    score: Math.max(36, Math.min(96, 88 - index * 7 + ((index % 2) * 9))),
  }));
};

const buildVisualAsset = (type, files, messages) => {
  const analysisText = getLatestAnalysisText(messages);
  const lines = splitMeaningfulLines(analysisText);
  const fileNames = files.length > 0 ? files.map((file) => file.name) : ['업로드 문서'];
  const createdAt = Date.now();
  const baseTitle = {
    table: '문서 핵심 비교 표',
    graph: '키워드 중요도 그래프',
    image: '분석 요약 이미지',
    mindmap: '핵심 내용 마인드맵',
  }[type];

  const rows = makeVisualRows(fileNames, lines);

  const branches = (lines.length ? lines : ['핵심 내용', '실험 결과', '차이점', '추가 확인']).slice(0, 4);
  const keywords = branches
    .flatMap((line) => line.split(/[,\s/]+/))
    .map((word) => word.replace(/[^\w가-힣]/g, ''))
    .filter((word) => word.length >= 2)
    .slice(0, 5);

  return {
    id: `visual-${type}-${createdAt}`,
    role: 'asset',
    kind: type,
    title: baseTitle,
    text: `${fileNames.join(', ')} 기준으로 생성한 ${baseTitle}입니다.`,
    desc: lines.slice(0, 2).join(' ') || '업로드 문서의 주요 내용을 시각화했습니다.',
    rows,
    branches,
    keywords: keywords.length ? keywords : ['핵심', '비교', '결과'],
    details: rows.map((row) => ({ lbl: row.label, val: `${row.point} (${row.score})` })),
    date: formatDate(),
    saved: false,
  };
};

function AnalysisC({ projectId, projectTitle, restoredData }) {
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const [savedProjectId, setSavedProjectId] = useState(null);
  const effectiveProjectId = savedProjectId || projectId || restoredData?.projectId;

  const [files, setFiles] = useState([]);
  const [promptText, setPromptText] = useState('');
  const [llmProvider, setLlmProvider] = useState(() => sessionStorage.getItem('papermate.llmProvider') || 'openai');
  const [openaiApiKey, setOpenaiApiKey] = useState(() => sessionStorage.getItem('papermate.openaiApiKey') || '');
  const [googleApiKey, setGoogleApiKey] = useState(() => sessionStorage.getItem('papermate.googleApiKey') || '');
  const [messages, setMessages] = useState([
    { id: 'intro', role: 'ai', text: '분석을 시작하려면 파일을 업로드하거나 차트를 생성하세요.' },
  ]);
  const [visuals, setVisuals] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [generatedVisuals, setGeneratedVisuals] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [creatingVisualType, setCreatingVisualType] = useState(null);
  const [isProjectSaveOpen, setIsProjectSaveOpen] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState('');

  const currentInviteCode = currentProject?.inviteCode || restoredData?.inviteCode || '저장 후 생성';

  const handleOpenaiApiKeyChange = (event) => {
    const nextKey = event.target.value.trim();
    setOpenaiApiKey(nextKey);
    if (nextKey) sessionStorage.setItem('papermate.openaiApiKey', nextKey);
    else sessionStorage.removeItem('papermate.openaiApiKey');
  };

  const handleGoogleApiKeyChange = (event) => {
    const nextKey = event.target.value.trim();
    setGoogleApiKey(nextKey);
    if (nextKey) sessionStorage.setItem('papermate.googleApiKey', nextKey);
    else sessionStorage.removeItem('papermate.googleApiKey');
  };

  const handleProviderChange = (event) => {
    const nextProvider = event.target.value;
    setLlmProvider(nextProvider);
    sessionStorage.setItem('papermate.llmProvider', nextProvider);
  };

  const clearOpenaiApiKey = () => {
    setOpenaiApiKey('');
    sessionStorage.removeItem('papermate.openaiApiKey');
  };

  const clearGoogleApiKey = () => {
    setGoogleApiKey('');
    sessionStorage.removeItem('papermate.googleApiKey');
  };

  const copyInviteCode = async () => {
    if (!currentInviteCode || currentInviteCode === '저장 후 생성') {
      window.alert('프로젝트를 저장하면 초대코드가 생성됩니다.');
      return;
    }
    try {
      await navigator.clipboard.writeText(currentInviteCode);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = currentInviteCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    window.alert(`초대코드가 복사되었습니다: ${currentInviteCode}`);
  };

  useEffect(() => {
    const allProjects = readJson(getProjectsKey(), []);
    const currentProject = allProjects.find((project) => project.id === effectiveProjectId);
    if (currentProject) {
      setVisuals((currentProject.visuals || []).filter(isVisualStorageItem));
      setCurrentProject(currentProject);
    }
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
        kind: item.kind,
        desc: item.desc,
        branches: item.branches,
        keywords: item.keywords,
        details: item.details,
      }));
    setMessages(restoredMessages.length > 0 ? restoredMessages : messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoredData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAnalyzing]);

  const handleFileChange = (event) => {
    const nextFiles = Array.from(event.target.files || []);
    event.target.value = '';
    if (nextFiles.length === 0) return;

    const newFiles = nextFiles.filter((file) => !files.some((item) => getFileKey(item) === getFileKey(file)));
    if (newFiles.length === 0) return;

    setFiles((prev) => [...prev, ...newFiles]);
    const newMessages = newFiles.map((file) => ({
      id: Date.now() + Math.random(),
      role: 'system',
      text: `파일: ${file.name}이(가) 업로드되었습니다.`,
    }));
    setMessages((prev) => [...prev, ...newMessages]);
  };

  const handleRemoveFile = (targetFile) => {
    const targetKey = getFileKey(targetFile);
    setFiles((prev) => prev.filter((file) => getFileKey(file) !== targetKey));
    setMessages((prev) =>
      prev.filter((message) => message.text !== `파일: ${targetFile.name}이(가) 업로드되었습니다.`)
    );
  };

  const handleSendMessage = async () => {
    const nextQuestion = promptText.trim();
    if (!nextQuestion || isAnalyzing) return;

    setPromptText('');
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: nextQuestion }]);

    if (files.length === 0) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: buildLocalFallbackAnswer(nextQuestion, files, prev) },
      ]);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await analysisAPI.chat(nextQuestion, files, {
        provider: llmProvider,
        openaiApiKey,
        googleApiKey,
      });
      const sourceLabel = response.data.llm_used
        ? `\n\n분석 엔진: ${response.data.provider === 'google' ? 'Google Gemini' : 'OpenAI'} (${response.data.model})`
        : '\n\n분석 엔진: 기본 문서 추출';
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: `${response.data.answer}${sourceLabel}` },
      ]);
    } catch (error) {
      const serverMessage = error.response?.data?.detail || '';
      const message = [
        serverMessage && `서버 분석 실패: ${serverMessage}`,
        buildLocalFallbackAnswer(nextQuestion, files, messages),
      ].filter(Boolean).join('\n\n');
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', text: message }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateVisual = async (type) => {
    if (creatingVisualType) return;

    setCreatingVisualType(type);
    try {
      const response = await analysisAPI.createVisual(type, files, getLatestAnalysisText(messages));
      const newAsset = response.data.visual || buildVisualAsset(type, files, messages);
      setGeneratedVisuals((prev) => [newAsset, ...prev].slice(0, 12));
      setMessages((prev) => [...prev, newAsset]);
    } catch (error) {
      const newAsset = {
        ...buildVisualAsset(type, files, messages),
        text: 'FastAPI 시각화 생성에 실패해 브라우저 기본 생성기로 임시 자료를 만들었습니다.',
      };
      setGeneratedVisuals((prev) => [newAsset, ...prev].slice(0, 12));
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'ai', text: error.response?.data?.detail || '시각화 API와 연결할 수 없어 임시 자료를 생성했습니다.' },
        newAsset,
      ]);
    } finally {
      setCreatingVisualType(null);
    }
  };

  const saveVisualAssetToProject = async (asset) => {
    if (!asset || isSavingProject) return;

    const projectsKey = getProjectsKey();
    const savedProjects = readJson(projectsKey, []);
    const existingProject = Array.isArray(savedProjects)
      ? savedProjects.find((project) => project.id === effectiveProjectId)
      : null;
    if (!existingProject && Array.isArray(savedProjects) && savedProjects.length >= MAX_PROJECTS) {
      window.alert('프로젝트는 최대 10개까지 저장됩니다. 새 프로젝트를 저장하려면 기존 프로젝트를 삭제해주세요.');
      return;
    }
    if (existingProject && (existingProject.visuals || []).filter(isVisualStorageItem).length >= MAX_VISUALS) {
      window.alert('시각화 보관함은 최대 10개까지 저장됩니다. 새 시각화를 저장하려면 기존 시각화를 삭제해주세요.');
      return;
    }
    const fallbackTitle =
      existingProject?.title ||
      projectTitle ||
      restoredData?.projectTitle ||
      files[0]?.name?.replace(/\.[^.]+$/, '') ||
      '시각화 분석 프로젝트';
    const title = existingProject?.title || window.prompt('저장할 프로젝트명을 입력하세요.', fallbackTitle);
    if (!title?.trim()) return;

    const today = formatDate();
    const nextVisual = {
      ...asset,
      saved: true,
      date: today,
      projectTitle: title.trim(),
    };
    const projectRecord = {
      ...(existingProject || {}),
      id: existingProject?.id || effectiveProjectId || `project-${Date.now()}`,
      type: existingProject?.type || '분석',
      title: title.trim(),
      owner: localStorage.getItem('username') || 'Guest',
      updatedAt: today,
      date: today,
      charts: [nextVisual, ...(existingProject?.visuals || []).filter((visual) => visual.id !== asset.id)]
        .filter(isVisualStorageItem)
        .slice(0, MAX_VISUALS).length,
      isHwp: files.some((file) => file.name.toLowerCase().endsWith('.hwp') || file.name.toLowerCase().endsWith('.hwpx')),
      inviteCode: existingProject?.inviteCode || restoredData?.inviteCode || createInviteCode(),
      files: existingProject?.files?.length ? existingProject.files : toStoredFiles(files),
      thread: toStoredThread(messages),
      visuals: [nextVisual, ...(existingProject?.visuals || []).filter((visual) => visual.id !== asset.id)]
        .filter(isVisualStorageItem)
        .slice(0, MAX_VISUALS),
    };

    const nextProjects = [
      projectRecord,
      ...(Array.isArray(savedProjects)
        ? savedProjects.filter((project) => project.id !== projectRecord.id)
        : []),
    ].slice(0, MAX_PROJECTS);

    setIsSavingProject(true);
    try {
      writeJson(projectsKey, nextProjects);
      setSavedProjectId(projectRecord.id);
      setCurrentProject(projectRecord);
      setVisuals(projectRecord.visuals);
      setGeneratedVisuals((prev) =>
        prev.map((visual) => (visual.id === asset.id ? { ...visual, saved: true, projectTitle: projectRecord.title } : visual))
      );
      setMessages((prev) =>
        prev.map((message) => (message.id === asset.id ? { ...message, saved: true, projectTitle: projectRecord.title } : message))
      );
      try {
        await projectAPI.save(projectRecord);
      } catch (error) {
        console.warn('MongoDB visual save skipped:', error);
      }
      window.alert('프로젝트 페이지의 시각화 보관함에 저장되었습니다.');
    } finally {
      setIsSavingProject(false);
    }
  };

  const renderVisualPreview = (asset) => {
    if (asset.kind === 'table') {
      const rows = asset.rows?.length ? asset.rows : makeVisualRows(['업로드 문서'], splitMeaningfulLines(asset.text || asset.desc));
      return (
        <div className="mini-table">
          <div className="th">자료</div>
          <div className="th">핵심 내용</div>
          <div className="th">점수</div>
          {rows.slice(0, 6).flatMap((row) => [
            <div key={`${row.label}-label`}>{row.label}</div>,
            <div key={`${row.label}-point`}>{row.point}</div>,
            <div key={`${row.label}-score`}>{row.score}</div>,
          ])}
        </div>
      );
    }

    if (asset.kind === 'graph') {
      const rows = asset.rows?.length ? asset.rows : [{ label: '핵심', score: 70 }, { label: '비교', score: 62 }];
      const points = rows.slice(0, 5).map((row, index) => {
        const x = 12 + index * (76 / Math.max(1, Math.min(rows.length, 5) - 1));
        const y = 92 - Math.max(12, Math.min(row.score || 50, 96)) * 0.78;
        return `${x},${y}`;
      });
      return (
        <div className="mini-graph">
          <svg className="graph-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={points.join(' ')} />
            {points.map((point) => {
              const [cx, cy] = point.split(',');
              return <circle key={point} cx={cx} cy={cy} r="2.2" />;
            })}
          </svg>
          <div className="axis y-axis">점수</div>
          <div className="axis x-axis">자료</div>
          {rows.slice(0, 5).map((row) => (
            <div className="bar-wrap" key={row.label}>
              <div className="bar" style={{ height: `${Math.max(28, Math.min(row.score, 96))}%` }} />
              <strong>{row.score}</strong>
              <span>{row.label}</span>
            </div>
          ))}
        </div>
      );
    }

    if (asset.kind === 'mindmap') {
      const branches = asset.branches?.length
        ? asset.branches
        : splitMeaningfulLines(asset.text || asset.desc).slice(0, 4);
      return (
        <div className="mini-mindmap">
          <div className="center-node">{asset.title}</div>
          <div className="tree-trunk" aria-hidden="true"></div>
          <div className="branches">
            {branches.slice(0, 5).map((branch, index) => (
              <span className={`branch branch-${index + 1}`} key={`${branch}-${index}`}>{branch}</span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mini-image">
        <div className="image-title">{asset.desc || asset.title}</div>
        <div className="chips">
          {(asset.keywords || []).slice(0, 6).map((keyword) => <span key={keyword}>{keyword}</span>)}
        </div>
      </div>
    );
  };

  const renderVisualArtifact = (asset, compact = false) => (
    <VisualArtifact>
      <div className="artifact-head">
        <h4>{asset.title}</h4>
        <span>{asset.saved ? '저장됨' : '생성됨'}</span>
      </div>
      <div className="artifact-body">
        {!compact && <p className="artifact-desc">{asset.text}</p>}
        {renderVisualPreview(asset)}
      </div>
      {!compact && (
        <button
          type="button"
          className="save-visual"
          onClick={() => saveVisualAssetToProject(asset)}
          disabled={asset.saved || isSavingProject}
        >
          {asset.saved ? '프로젝트에 저장됨' : '프로젝트 시각화 보관함에 저장하기'}
        </button>
      )}
    </VisualArtifact>
  );

  const openProjectSavePanel = () => {
    const defaultTitle =
      currentProject?.title ||
      projectTitle ||
      restoredData?.projectTitle ||
      files[0]?.name?.replace(/\.[^.]+$/, '') ||
      '새 분석 프로젝트';
    setProjectNameInput(defaultTitle);
    setIsProjectSaveOpen(true);
  };

  const handleSaveAnalysisProject = async () => {
    if (isSavingProject) return;

    const title = projectNameInput.trim();
    if (!title) {
      window.alert('프로젝트명을 입력해주세요.');
      return;
    }

    const projectsKey = getProjectsKey();
    const recentConversationsKey = getRecentConversationsKey();
    const savedProjects = readJson(projectsKey, []);
    const existingProject = Array.isArray(savedProjects)
      ? savedProjects.find((project) => project.id === effectiveProjectId)
      : null;
    if (!existingProject && Array.isArray(savedProjects) && savedProjects.length >= MAX_PROJECTS) {
      window.alert('프로젝트는 최대 10개까지 저장됩니다. 새 프로젝트를 저장하려면 기존 프로젝트를 삭제해주세요.');
      return;
    }
    const storedVisuals = visuals.filter(isVisualStorageItem).slice(0, MAX_VISUALS);
    if (visuals.filter(isVisualStorageItem).length > MAX_VISUALS) {
      window.alert('시각화 보관함은 최대 10개까지 저장됩니다. 10개만 저장되고, 추가 항목은 기존 시각화를 삭제한 뒤 다시 저장해주세요.');
    }
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
      charts: storedVisuals.length,
      isHwp: files.some((file) => file.name.toLowerCase().endsWith('.hwp') || file.name.toLowerCase().endsWith('.hwpx')),
      inviteCode: existingProject?.inviteCode || restoredData?.inviteCode || createInviteCode(),
      files: toStoredFiles(files.length > 0 ? files : []),
      thread: toStoredThread(messages),
      visuals: storedVisuals,
    };

    const nextProjects = [
      projectRecord,
      ...(Array.isArray(savedProjects)
        ? savedProjects.filter((project) => project.id !== projectRecord.id)
        : []),
    ].slice(0, MAX_PROJECTS);

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
      // 💡 여기서 `.slice(0, 3)`을 제거하여 무제한 저장되도록 변경했습니다.
      writeJson(recentConversationsKey, [
        nextRecent,
        ...(Array.isArray(savedRecents)
          ? savedRecents.filter((item) => item.projectId !== projectRecord.id && item.id !== projectRecord.id)
          : []),
      ]);

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
      setCurrentProject(projectRecord);
      setIsProjectSaveOpen(false);
      window.alert('프로젝트 페이지와 최근 대화에 저장되었습니다.');
    } finally {
      setIsSavingProject(false);
    }
  };

  return (
    <Container>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} multiple />
      <MainLayout>
        <VisualPanel>
          <div className="title">시각화 보관함</div>
          <p className="hint">현재 업로드 문서와 최근 분석 답변을 기준으로 자료를 만듭니다.</p>
          <div className="asset-list">
            {[...generatedVisuals, ...visuals.filter((visual) => !generatedVisuals.some((item) => item.id === visual.id))]
              .map((visual, index) => (
                <div key={`${visual.id}-${index}`} className="asset-item">
                  <strong>{visual.title}</strong>
                  <span>{visual.saved ? '프로젝트 보관함 저장됨' : '채팅창에 생성됨'}</span>
                  {renderVisualArtifact(visual, true)}
                </div>
              ))}
          </div>
          <div className="visual-actions">
            <button className="action-btn" type="button" onClick={() => handleCreateVisual('table')}>
              <i className="fa-solid fa-table"></i>{creatingVisualType === 'table' ? '생성 중' : '표'}
            </button>
            <button className="action-btn" type="button" onClick={() => handleCreateVisual('graph')}>
              <i className="fa-solid fa-chart-column"></i>{creatingVisualType === 'graph' ? '생성 중' : '그래프'}
            </button>
            <button className="action-btn" type="button" onClick={() => handleCreateVisual('image')}>
              <i className="fa-regular fa-image"></i>{creatingVisualType === 'image' ? '생성 중' : '이미지'}
            </button>
            <button className="action-btn" type="button" onClick={() => handleCreateVisual('mindmap')}>
              <i className="fa-solid fa-diagram-project"></i>{creatingVisualType === 'mindmap' ? '생성 중' : '마인드맵'}
            </button>
          </div>
        </VisualPanel>

        <MainQAEngine>
          <TopMenuBar>
            <h2>AI 분석 Q&A</h2>
            <div className="actions">
              <div className="api-key-box">
                <i className="fa-solid fa-key"></i>
                <select value={llmProvider} onChange={handleProviderChange} aria-label="LLM 제공자 선택">
                  <option value="openai">OpenAI</option>
                  <option value="google">Google</option>
                </select>
                <input
                  type="password"
                  value={llmProvider === 'google' ? googleApiKey : openaiApiKey}
                  placeholder={llmProvider === 'google' ? 'Google Gemini API key' : 'OpenAI API key'}
                  onChange={llmProvider === 'google' ? handleGoogleApiKeyChange : handleOpenaiApiKeyChange}
                  autoComplete="off"
                />
                {((llmProvider === 'google' && googleApiKey) || (llmProvider === 'openai' && openaiApiKey)) && (
                  <button
                    type="button"
                    className="clear-key"
                    onClick={llmProvider === 'google' ? clearGoogleApiKey : clearOpenaiApiKey}
                    aria-label="API 키 지우기"
                  >
                    ×
                  </button>
                )}
              </div>
              <button type="button" onClick={openProjectSavePanel} disabled={isSavingProject}>
                프로젝트 저장
              </button>
              <InviteCodePill type="button" onClick={copyInviteCode} title="클릭하면 초대코드가 복사됩니다">
                <span>초대코드</span>
                <strong>{currentInviteCode}</strong>
              </InviteCodePill>
            </div>
          </TopMenuBar>

          {isProjectSaveOpen && (
            <SaveInlinePanel>
              <input
                value={projectNameInput}
                placeholder="프로젝트 제목을 입력하세요"
                onChange={(event) => setProjectNameInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSaveAnalysisProject();
                  if (event.key === 'Escape') setIsProjectSaveOpen(false);
                }}
                autoFocus
              />
              <button type="button" className="primary" onClick={handleSaveAnalysisProject} disabled={isSavingProject}>
                {isSavingProject ? '저장 중...' : '저장'}
              </button>
              <button type="button" onClick={() => setIsProjectSaveOpen(false)}>
                취소
              </button>
            </SaveInlinePanel>
          )}

          <StreamMessageArea ref={scrollRef}>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'ai' ? (
                  <AiRow><div className="ai-box">{message.text}</div></AiRow>
                ) : message.role === 'user' ? (
                  <UserRow><div className="user-box">{message.text}</div></UserRow>
                ) : message.role === 'asset' ? (
                  renderVisualArtifact(message)
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>{message.text}</div>
                )}
              </div>
            ))}
            {isAnalyzing && <AiRow><div className="ai-box">GPT가 문서를 분석하고 있습니다...</div></AiRow>}
          </StreamMessageArea>

          <BottomPromptInput>
            {files.length > 0 && (
              <div className="file-island-list" aria-label="업로드된 파일 목록">
                {files.map((file) => (
                  <div className="file-island" key={getFileKey(file)} title={file.name}>
                    <i className="fa-regular fa-file-lines"></i>
                    <span>{file.name}</span>
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => handleRemoveFile(file)}
                      aria-label={`${file.name} 삭제`}
                      title="파일 삭제"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="input-wrapper">
              <button
                type="button"
                className="clip-upload"
                onClick={() => fileInputRef.current?.click()}
                aria-label="파일 업로드"
                title="파일 업로드"
              >
                <i className="fa-solid fa-paperclip"></i>
              </button>
              <input
                value={promptText}
                placeholder={files.length > 0 ? `${files.length}개 파일 기준으로 질문을 입력하세요...` : '분석 질문을 입력하세요...'}
                onChange={(event) => setPromptText(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
              />
              <button type="button" onClick={handleSendMessage}>전송</button>
            </div>
          </BottomPromptInput>
        </MainQAEngine>
      </MainLayout>
    </Container>
  );
}

export default AnalysisC;