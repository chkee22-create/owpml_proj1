import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { palette } from '../shared/palette';

const SHARE_ROOM_KEY = 'papermate.shareRoom.v1';
const PROJECTS_KEY = 'papermate.projects.v1';
const DEFAULT_INVITE_CODE = 'aa33ddf';

// 공유 페이지에서 불러올 수 있는 기본 프로젝트 목록입니다.
// 추후 백엔드가 연결되면 이 배열 대신 API 응답이나 내 프로젝트 저장 데이터를 사용하면 됩니다.
const seedProjects = [
  {
    id: 'image-classification',
    title: '딥러닝 이미지 분류 연구 비교',
    type: 'PDF x 3',
    updatedAt: '2026.05.04',
    files: ['attention_is_all_you_need.pdf', 'BERT_pretraining.pdf', 'GPT4_technical_report.pdf'],
    thread: [
      {
        id: 1,
        role: 'ai',
        text: '3개의 논문을 업로드하셨네요! 어떤 내용이 궁금하신가요? 각 논문의 핵심 내용, 실험 결과 비교, 또는 방법론 차이점을 분석해드릴 수 있어요.',
        time: '오늘 14:30',
      },
      {
        id: 2,
        role: 'user',
        text: '세 논문의 정확도 성능을 비교해줘',
        time: '오늘 14:32',
      },
      {
        id: 3,
        role: 'ai',
        text: '논문별 주요 벤치마크 정확도 비교를 진행하고 있습니다.',
        time: '오늘 14:32',
      },
      {
        id: 4,
        role: 'asset',
        title: '정확도 비교표',
        text: '분석 비교창에서 생성된 표와 이미지는 공유 페이지 타임라인에 함께 표시됩니다.',
        rows: [
          ['논문', '데이터셋', '정확도'],
          ['Attention', 'WMT 2014', '94.2%'],
          ['BERT', 'GLUE / SQuAD', '92.8%'],
          ['GPT-4', 'MMLU / HumanEval', '분석 중'],
        ],
        time: '오늘 14:33',
      },
      {
        id: 5,
        role: 'user',
        text: '각 논문의 실험 데이터셋은 무엇인가요?',
        time: '오늘 14:34',
      },
      {
        id: 6,
        role: 'ai',
        text: '각 논문에서 사용한 핵심 실험 데이터셋을 문서별로 추출하고 있습니다. Attention 논문은 WMT 2014 번역 벤치마크, BERT는 GLUE와 SQuAD 중심으로 정리됩니다.',
        time: '오늘 14:34',
      },
      {
        id: 7,
        role: 'user',
        text: '주요 논문의 정확도 분석해줘',
        time: '오늘 14:36',
      },
    ],
  },
  {
    id: 'nlp-research',
    title: '자연어 처리',
    type: 'hwp',
    updatedAt: '2026.05.04',
    files: ['NLP_summary.hwp'],
    thread: [
      { id: 1, role: 'ai', text: '자연어 처리 프로젝트의 최근 분석 내용을 불러왔습니다.', time: '오늘 13:10' },
      { id: 2, role: 'user', text: '토큰화 방식별 차이를 비교해줘', time: '오늘 13:12' },
      { id: 3, role: 'ai', text: '형태소 기반 토큰화와 BPE 계열 토큰화의 차이를 실험 조건 중심으로 정리했습니다.', time: '오늘 13:13' },
    ],
  },
  {
    id: 'paper-analysis',
    title: '논문 분석 처리',
    type: 'PDF',
    updatedAt: '2026.05.04',
    files: ['paper_analysis.pdf'],
    thread: [
      { id: 1, role: 'ai', text: '논문 분석 처리 프로젝트를 공유 화면에 불러왔습니다.', time: '어제 17:20' },
      { id: 2, role: 'user', text: '초록과 결론의 핵심 차이를 알려줘', time: '어제 17:22' },
      { id: 3, role: 'ai', text: '초록은 연구 목적과 방법을, 결론은 실험 결과의 의미와 한계를 중심으로 서술하고 있습니다.', time: '어제 17:23' },
    ],
  },
];

// 공유방의 기본 상태입니다.
// 초대코드, 참여자, 불러온 프로젝트 순서, 코멘트 기록을 한 묶음으로 localStorage에 저장합니다.
const fallbackRoom = {
  inviteCode: DEFAULT_INVITE_CODE,
  joinedCode: '',
  members: [],
  loadedProjectIds: ['image-classification'],
  comments: [
    {
      id: 1,
      user: '김철수',
      text: '논문의 정확성을 비교해주신 자료를 저한테 메일로 보내주세요.',
      time: '오늘 14:32',
    },
    {
      id: 2,
      user: 'user14530',
      text: '네, 알겠습니다.',
      time: '오늘 14:34',
    },
  ],
};

// 화면 전체는 좌측 분석 타임라인과 우측 협업 채팅 패널로 나뉩니다.
const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background: #ffffff;
  box-sizing: border-box;
`;

// 좌측 본문 영역입니다. 프로젝트 대화 기록을 세로 타임라인으로 보여줍니다.
const MainTimelineContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 36px 48px;
  box-sizing: border-box;
  overflow-y: auto;

  .header-area {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 22px;
  }

  .menu-toggle {
    font-size: 22px;
    color: #1e293b;
  }

  h2 {
    font-size: 22px;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
  }
`;

// 본문이 너무 넓게 퍼지지 않도록 최대 폭을 제한하는 내부 래퍼입니다.
const TimelineInner = styled.div`
  width: 100%;
  max-width: 980px;
`;

// 내 프로젝트에서 저장된 프로젝트를 선택해서 공유 본문에 누적시키는 상단 바입니다.
const ProjectLoadBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 24px;
  width: 100%;

  select {
    min-width: 240px;
    height: 36px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 0 10px;
    color: #1e293b;
    font-size: 13px;
    font-weight: 700;
    outline: none;
    background: #ffffff;
  }

  button {
    height: 36px;
    border: none;
    border-radius: 6px;
    padding: 0 16px;
    background: #0ea5a4;
    color: #ffffff;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
  }

  .hint {
    margin-left: auto;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
  }
`;

// 타임라인 카드 위에 표시되는 작은 섹션 제목입니다.
const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #64748b;
  margin-bottom: 20px;
`;

// 타임라인의 세로 축과 카드 목록을 감싸는 영역입니다.
const TimelineWrapper = styled.div`
  position: relative;
  margin-left: 10px;
  padding-left: 30px;

  &::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 12px;
    bottom: 12px;
    width: 2px;
    background: #e2e8f0;
  }
`;

// 타임라인의 개별 노드입니다. 질문, AI 답변, 표/이미지 같은 분석 산출물을 같은 카드 형태로 표시합니다.
const TimelineNode = styled.article`
  position: relative;
  margin-bottom: 20px;

  .dot {
    position: absolute;
    left: -30px;
    top: 8px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${(props) => (props.$active ? '#0ea5a4' : '#cbd5e1')};
    border: 2px solid white;
    box-shadow: ${(props) => (props.$active ? '0 0 0 4px rgba(14, 165, 164, 0.14)' : 'none')};
    box-sizing: border-box;
  }

  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px 18px;
  }

  .project-label {
    color: #0ea5a4;
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  h4 {
    margin: 0 0 6px 0;
    color: #0f172a;
    font-size: 15px;
    font-weight: 800;
  }

  .meta {
    color: #94a3b8;
    font-size: 11.5px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .body {
    color: #334155;
    font-size: 13px;
    font-weight: 650;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .restore-btn {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    color: #475569;
    font-weight: 800;
    font-size: 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 6px;
  }

  .restore-btn:hover {
    background: #e6f4f4;
    color: #0ea5a4;
    border-color: #bce3e3;
  }
`;

// 분석 비교창에서 생성된 표 형태 결과를 공유 화면에 같이 보여주기 위한 테이블 스타일입니다.
const ResultTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  font-size: 12px;

  th,
  td {
    border: 1px solid #e2e8f0;
    padding: 8px 10px;
    text-align: left;
  }

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 800;
  }

  td {
    color: #334155;
    font-weight: 650;
  }
`;

// 우측 협업 패널입니다. 프로젝트 불러오기, 초대코드 입력, 참여자, 코멘트 채팅이 들어갑니다.
const RightCoopPanel = styled.aside`
  width: 340px;
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .load-btn {
    background: #0ea5a4;
    color: white;
    border: none;
    margin: 24px 22px 18px 22px;
    padding: 13px;
    border-radius: 8px;
    font-weight: 800;
    font-size: 14px;
    cursor: pointer;
  }

  .code-row {
    margin: 0 22px 20px 22px;
    display: flex;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #cbd5e1;
    background: #ffffff;
  }

  .code-label {
    background: #64748b;
    color: white;
    padding: 10px 12px;
    font-weight: 800;
    font-size: 12px;
  }

  .code-input {
    min-width: 0;
    flex: 1;
    border: none;
    padding: 0 12px;
    color: #1e293b;
    font-family: monospace;
    font-size: 13px;
    font-weight: 800;
    outline: none;
    text-align: center;
  }

  .join-action {
    background: #f1f5f9;
    color: #475569;
    border: none;
    border-left: 1px solid #cbd5e1;
    padding: 0 12px;
    font-weight: 800;
    font-size: 12px;
    cursor: pointer;
  }

  .notice {
    margin: -10px 22px 16px 22px;
    color: ${(props) => (props.$error ? '#dc2626' : '#64748b')};
    font-size: 11.5px;
    font-weight: 700;
    min-height: 16px;
  }
`;

// 초대코드를 입력한 사용자만 참여자로 표시되는 영역입니다.
const MembersBox = styled.div`
  padding: 0 22px 18px 22px;
  border-bottom: 1px solid #e2e8f0;

  h5 {
    margin: 0 0 12px 0;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.5px;
  }

  .m-item,
  .empty {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    color: #334155;
    font-size: 13px;
    font-weight: 750;
  }

  .empty {
    color: #94a3b8;
  }

  i {
    color: ${palette.slate[4]};
  }
`;

// 공유방 코멘트 로그가 쌓이는 스크롤 영역입니다.
const ChatTimelineFeed = styled.div`
  flex: 1;
  padding: 16px 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #ffffff;
`;

// 코멘트 말풍선입니다. 현재 사용자의 말풍선과 다른 참여자의 말풍선을 좌우로 구분합니다.
const TalkBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isMe ? 'flex-end' : 'flex-start')};
  align-self: ${(props) => (props.$isMe ? 'flex-end' : 'flex-start')};
  max-width: 88%;

  .user-id {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #64748b;
    font-size: 11.5px;
    font-weight: 800;
    margin-bottom: 6px;
  }

  .msg-row {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    flex-direction: ${(props) => (props.$isMe ? 'row-reverse' : 'row')};
  }

  .message-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-direction: ${(props) => (props.$isMe ? 'row-reverse' : 'row')};
  }

  .bubble {
    background: ${(props) => (props.$isMe ? '#0ea5a4' : '#f1f5f9')};
    color: ${(props) => (props.$isMe ? 'white' : '#1e293b')};
    padding: 10px 14px;
    border-radius: ${(props) => (props.$isMe ? '12px 2px 12px 12px' : '2px 12px 12px 12px')};
    font-size: 13px;
    font-weight: 700;
    line-height: 1.45;
    white-space: pre-wrap;
  }

  .timestamp {
    min-width: 48px;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 700;
    text-align: ${(props) => (props.$isMe ? 'right' : 'left')};
  }

  .delete-btn {
    width: 22px;
    height: 22px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 900;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.12s ease;
  }

  &:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    color: #dc2626;
    border-color: #fecaca;
    background: #fef2f2;
  }
`;

// 우측 패널 하단의 코멘트 입력창입니다.
const FooterInputBox = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;

  input {
    flex: 1;
    min-width: 0;
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    color: #1e293b;
    font-size: 13px;
    font-weight: 700;
    outline: none;
  }

  input::placeholder {
    color: #94a3b8;
  }

  button {
    background: #0ea5a4;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0 14px;
    font-weight: 800;
    font-size: 13px;
    cursor: pointer;
  }
`;

// 프로젝트 불러오기 버튼을 눌렀을 때 뜨는 선택창입니다.
// 실제 프로젝트 페이지처럼 카드 목록에서 원하는 프로젝트를 골라 공유 본문에 추가합니다.
const ProjectPickerOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.28);
  padding: 32px;
`;

const ProjectPickerPanel = styled.div`
  width: min(860px, 100%);
  max-height: min(680px, calc(100vh - 64px));
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
  }

  .picker-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  h3 {
    margin: 0;
    color: #0f172a;
    font-size: 18px;
    font-weight: 850;
  }

  .picker-desc {
    color: #64748b;
    font-size: 12.5px;
    font-weight: 700;
  }

  .close-btn {
    width: 34px;
    height: 34px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    color: #475569;
    font-size: 18px;
    font-weight: 800;
    cursor: pointer;
  }

  .close-btn:hover {
    background: #f8fafc;
    color: #0f172a;
  }
`;

const ProjectPickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 24px;
  overflow-y: auto;
`;

const ProjectPickerCard = styled.button`
  min-height: 154px;
  border: 1px solid ${(props) => (props.$loaded ? '#bce3e3' : '#e2e8f0')};
  border-radius: 8px;
  background: ${(props) => (props.$loaded ? '#f0fdfa' : '#ffffff')};
  padding: 18px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #0ea5a4;
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
  }

  .tag-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 3px 10px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #475569;
    font-size: 11px;
    font-weight: 850;
  }

  .loaded-label {
    color: #0ea5a4;
    font-size: 11px;
    font-weight: 850;
  }

  .project-name {
    color: #0f172a;
    font-size: 15px;
    font-weight: 850;
    line-height: 1.35;
  }

  .updated {
    color: #94a3b8;
    font-size: 11.5px;
    font-weight: 750;
  }

  .meta {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    color: #64748b;
    font-size: 12px;
    font-weight: 750;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
`;

// localStorage에서 JSON 데이터를 안전하게 읽는 헬퍼입니다.
// 저장값이 없거나 파싱에 실패하면 fallback을 반환합니다.
const loadJson = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

// 코멘트를 작성한 시각을 화면 표시 형식으로 변환합니다.
const formatTime = () => {
  const now = new Date();
  return `오늘 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

function ShareC({ onRestoreTrigger, username = 'user14530' }) {
  // 프로젝트 목록은 localStorage에 저장된 값이 있으면 우선 사용하고,
  // 없으면 seedProjects를 저장한 뒤 기본 프로젝트로 시작합니다.
  const [projects] = useState(() => {
    const saved = loadJson(PROJECTS_KEY, null);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(seedProjects));
    return seedProjects;
  });

  // 공유방 상태는 코멘트와 참여자 기록이 유지되어야 하므로 localStorage에서 복원합니다.
  const [room, setRoom] = useState(() => loadJson(SHARE_ROOM_KEY, fallbackRoom));
  const [selectedProjectId, setSelectedProjectId] = useState(room.loadedProjectIds[0] || seedProjects[0].id);
  const [typedMsg, setTypedMsg] = useState('');
  const [isComposingMessage, setIsComposingMessage] = useState(false);
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const chatFeedRef = useRef(null);

  // 공유방 상태가 바뀔 때마다 저장해서 로그아웃하거나 새로고침해도 기록이 남도록 합니다.
  useEffect(() => {
    localStorage.setItem(SHARE_ROOM_KEY, JSON.stringify(room));
  }, [room]);

  // 코멘트가 추가되면 채팅창을 맨 아래로 내려 최신 메시지가 바로 보이게 합니다.
  useEffect(() => {
    if (!chatFeedRef.current) return;
    chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
  }, [room.comments]);

  // 불러온 프로젝트 id 순서대로 실제 프로젝트 데이터를 찾아 타임라인에 사용할 목록을 만듭니다.
  const loadedProjects = useMemo(
    () => room.loadedProjectIds.map((id) => projects.find((project) => project.id === id)).filter(Boolean),
    [projects, room.loadedProjectIds]
  );

  // 여러 프로젝트의 대화 스레드를 하나의 타임라인 배열로 펼칩니다.
  // 마지막으로 불러온 프로젝트의 마지막 항목은 active 상태로 표시합니다.
  const timelineItems = useMemo(
    () =>
      loadedProjects.flatMap((project, projectIndex) =>
        project.thread.map((item, itemIndex) => ({
          ...item,
          projectId: project.id,
          projectTitle: project.title,
          active: projectIndex === loadedProjects.length - 1 && itemIndex === project.thread.length - 1,
        }))
      ),
    [loadedProjects]
  );

  // 선택한 프로젝트 id를 공유 본문에 추가합니다.
  // 이미 불러온 프로젝트는 중복으로 쌓지 않고 기존 순서를 유지합니다.
  const loadProjectById = (projectId) => {
    setRoom((prev) => {
      const nextIds = prev.loadedProjectIds.includes(projectId)
        ? prev.loadedProjectIds
        : [...prev.loadedProjectIds, projectId];
      return { ...prev, loadedProjectIds: nextIds };
    });
    setSelectedProjectId(projectId);
    setIsProjectPickerOpen(false);
  };

  // 프로젝트 불러오기 버튼은 바로 추가하지 않고, 프로젝트 선택창을 먼저 엽니다.
  const openProjectPicker = () => setIsProjectPickerOpen(true);

  // 초대코드를 검증하고, 맞으면 현재 사용자를 참여 인원에 등록합니다.
  // 같은 사용자는 중복 등록하지 않습니다.
  const joinWithCode = () => {
    const normalizedCode = room.joinedCode.trim();
    if (normalizedCode !== room.inviteCode) {
      setNotice('초대코드를 정확히 입력해야 참여 인원에 표시됩니다.');
      return;
    }

    setRoom((prev) => {
      const alreadyJoined = prev.members.some((member) => member.name === username);
      return {
        ...prev,
        members: alreadyJoined ? prev.members : [...prev.members, { id: Date.now(), name: username }],
      };
    });
    setNotice('참여 완료: 이제 이 공유방 기록을 계속 볼 수 있습니다.');
  };

  // 코멘트 입력값을 공유방 로그에 추가합니다.
  // room 상태에 저장되므로 useEffect를 통해 localStorage에도 자동 반영됩니다.
  const handleSendComment = () => {
    if (!typedMsg.trim()) return;
    setRoom((prev) => ({
      ...prev,
      comments: [
        ...prev.comments,
        {
          id: Date.now(),
          user: username,
          text: typedMsg.trim(),
          time: formatTime(),
        },
      ],
    }));
    setTypedMsg('');
  };

  // 현재 사용자가 작성한 코멘트만 삭제합니다.
  // 다른 참여자의 코멘트는 버튼 자체를 보여주지 않습니다.
  const handleDeleteComment = (commentId) => {
    setRoom((prev) => ({
      ...prev,
      comments: prev.comments.filter((comment) => comment.id !== commentId || comment.user !== username),
    }));
  };

  // 타임라인의 특정 시점으로 분석 비교 화면을 복구하기 위한 상위 콜백입니다.
  const handleRestore = (item) => {
    if (!onRestoreTrigger) return;
    onRestoreTrigger({ q: item.text || item.title, a: item.text || item.title });
  };

  return (
    <Container>
      <MainTimelineContent>
        <TimelineInner>
          <div className="header-area">
            <i className="fa-solid fa-bars menu-toggle"></i>
            <h2>{loadedProjects[loadedProjects.length - 1]?.title || '공유 프로젝트'}</h2>
          </div>

          <ProjectLoadBar>
            <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <button type="button" onClick={openProjectPicker}>
              프로젝트 불러오기
            </button>
            <span className="hint">불러온 순서대로 본문 기록이 쌓입니다.</span>
          </ProjectLoadBar>

          <SectionTitle>분석 비교 대화 타임라인</SectionTitle>
          <TimelineWrapper>
            {timelineItems.map((item, index) => (
              <TimelineNode key={`${item.projectId}-${item.id}-${index}`} $active={item.active}>
                <div className="dot"></div>
                <div className="card">
                  <div className="project-label">{item.projectTitle}</div>
                  <h4>{item.role === 'asset' ? item.title : item.role === 'user' ? item.text : 'AI 분석 답변'}</h4>
                  <div className="meta">
                    {item.time} {item.role === 'user' ? username : 'AI'}
                  </div>
                  {item.role !== 'user' && <div className="body">{item.text}</div>}
                  {item.rows && (
                    <ResultTable>
                      <thead>
                        <tr>
                          {item.rows[0].map((cell) => (
                            <th key={cell}>{cell}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {item.rows.slice(1).map((row) => (
                          <tr key={row.join('-')}>
                            {row.map((cell) => (
                              <td key={cell}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </ResultTable>
                  )}
                  <div className="actions">
                    <button className="restore-btn" type="button" onClick={() => handleRestore(item)}>
                      <i className="fa-solid fa-turn-up"></i> 이 시점으로 복구
                    </button>
                  </div>
                </div>
              </TimelineNode>
            ))}
          </TimelineWrapper>
        </TimelineInner>
      </MainTimelineContent>

      <RightCoopPanel $error={notice.includes('정확히')}>
        <button className="load-btn" type="button" onClick={openProjectPicker}>
          프로젝트 불러오기
        </button>

        <div className="code-row">
          <div className="code-label">초대코드</div>
          <input
            className="code-input"
            value={room.joinedCode}
            placeholder={DEFAULT_INVITE_CODE}
            onChange={(event) => setRoom((prev) => ({ ...prev, joinedCode: event.target.value }))}
            onKeyDown={(event) => event.key === 'Enter' && joinWithCode()}
          />
          <button className="join-action" type="button" onClick={joinWithCode}>
            입력
          </button>
        </div>
        <div className="notice">{notice}</div>

        <MembersBox>
          <h5>참여 인원</h5>
          {room.members.length === 0 ? (
            <div className="empty">초대코드 입력 후 표시됩니다.</div>
          ) : (
            room.members.map((member) => (
              <div className="m-item" key={`${member.id}-${member.name}`}>
                <i className="fa-regular fa-circle-user"></i> {member.name}
              </div>
            ))
          )}
        </MembersBox>

        <ChatTimelineFeed ref={chatFeedRef}>
          {room.comments.map((comment) => (
            <TalkBubble key={comment.id} $isMe={comment.user === username}>
              {comment.user !== username && (
                <div className="user-id">
                  <i className="fa-regular fa-circle-user"></i> {comment.user}
                </div>
              )}
              <div className="msg-row">
                <div className="message-actions">
                  <div className="bubble">{comment.text}</div>
                  {comment.user === username && (
                    <button
                      className="delete-btn"
                      type="button"
                      aria-label="내 코멘트 삭제"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="timestamp">{comment.time}</div>
              </div>
            </TalkBubble>
          ))}
        </ChatTimelineFeed>

        <FooterInputBox>
          <input
            type="text"
            placeholder="코멘트 작성"
            value={typedMsg}
            onChange={(event) => setTypedMsg(event.target.value)}
            onCompositionStart={() => setIsComposingMessage(true)}
            onCompositionEnd={() => setIsComposingMessage(false)}
            onKeyDown={(event) => {
              const isComposing = event.nativeEvent.isComposing || isComposingMessage;
              if (event.key === 'Enter' && !isComposing) handleSendComment();
            }}
          />
          <button type="button" onClick={handleSendComment}>
            저장
          </button>
        </FooterInputBox>
      </RightCoopPanel>

      {isProjectPickerOpen && (
        <ProjectPickerOverlay onMouseDown={() => setIsProjectPickerOpen(false)}>
          <ProjectPickerPanel onMouseDown={(event) => event.stopPropagation()}>
            <div className="picker-header">
              <div className="picker-title">
                <h3>프로젝트 선택</h3>
                <div className="picker-desc">프로젝트 창에서 공유할 프로젝트를 선택하면 본문 타임라인에 표시됩니다.</div>
              </div>
              <button className="close-btn" type="button" onClick={() => setIsProjectPickerOpen(false)} aria-label="프로젝트 선택창 닫기">
                ×
              </button>
            </div>

            <ProjectPickerGrid>
              {projects.map((project) => {
                const isLoaded = room.loadedProjectIds.includes(project.id);
                return (
                  <ProjectPickerCard
                    key={project.id}
                    type="button"
                    $loaded={isLoaded}
                    onClick={() => loadProjectById(project.id)}
                  >
                    <div className="tag-row">
                      <span className="tag">{project.type}</span>
                      {isLoaded && <span className="loaded-label">불러옴</span>}
                    </div>
                    <div className="project-name">{project.title}</div>
                    <div className="updated">최근 수정 {project.updatedAt}</div>
                    <div className="meta">
                      <span>{project.files.length}개 문서</span>
                      <span>{project.thread.length}개 기록</span>
                    </div>
                  </ProjectPickerCard>
                );
              })}
            </ProjectPickerGrid>
          </ProjectPickerPanel>
        </ProjectPickerOverlay>
      )}
    </Container>
  );
}

export default ShareC;
