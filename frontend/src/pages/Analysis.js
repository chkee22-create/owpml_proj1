import React, { useEffect, useRef, useState } from 'react';
import {
  AiRow,
  BottomPromptInput,
  Container,
  MainQAEngine,
  StreamMessageArea,
  TopMenuBar,
  UserRow,
} from './styles/Analysis.styles';
import {
  InviteCodePill,
  MainLayout,
  SaveInlinePanel,
  VisualArtifact,
  VisualPanel,
} from './styles/AnalysisLocal.styles';
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
  return latest?.text || '?낅줈?쒗븳 臾몄꽌???듭떖 ?댁슜??癒쇱? 遺꾩꽍?????쒓컖?붾? ?앹꽦?섏꽭??';
};

const splitMeaningfulLines = (text) =>
  String(text || '')
    .split(/\n+/)
    .map((line) => line.replace(/^[-\d.쨌\s]+/, '').trim())
    .filter((line) => line.length > 8)
    .slice(0, 8);

const buildLocalFallbackAnswer = (question, files, messages) => {
  const sourceText = messages
    .filter((message) => ['ai', 'asset', 'system'].includes(message.role))
    .map((message) => [message.text, message.desc, ...(message.details || []).map((detail) => detail.val)].filter(Boolean).join(' '))
    .join('\n');
  const lines = splitMeaningfulLines(sourceText);
  const fileNames = files.length > 0 ? files.map((file) => file.name || '????뚯씪') : ['?꾩옱 ????댁슜'];
  const keywords = lines
    .flatMap((line) => line.split(/[,\s/]+/))
    .map((word) => word.replace(/[^\w가-힣]/g, ''))
    .filter((word) => word.length >= 2 && !['파일', '업로드', '분석', '문서'].includes(word))
    .slice(0, 10);

  return [
    '濡쒖뺄 湲곕낯 遺꾩꽍?쇰줈 泥섎━?덉뒿?덈떎.',
    '',
    '[?듭떖 ?댁슜 ?붿빟]',
    ...(lines.length ? lines.slice(0, 4).map((line, index) => `${index + 1}. ${line}`) : [
      `1. ${fileNames.join(', ')} 湲곗??쇰줈 遺꾩꽍 以鍮꾧? ?섏뼱 ?덉뒿?덈떎.`,
      '2. ?꾩옱 釉뚮씪?곗????먮Ц ?띿뒪?멸? 異⑸텇?섏? ?딆븘 ?뚯씪紐낃낵 湲곗〈 ???以묒떖?쇰줈留??뺣━?덉뒿?덈떎.',
    ]),
    '',
    '[以묒슂 臾몄옣 諛쒖톸]',
    ...(lines.length ? lines.slice(0, 6).map((line) => `- ${line}`) : ['- ?꾩쭅 諛쒖톸??蹂몃Ц ?띿뒪?멸? ?놁뒿?덈떎.']),
    '',
    '[以묒슂 ?ㅼ썙??',
    keywords.length ? keywords.join(', ') : fileNames.join(', '),
    '',
    '[吏덈Ц 諛섏쁺]',
    question ? `吏덈Ц "${question}"??留욎떠 ???댁슜???곗꽑 ?뺣━?덉뒿?덈떎.` : '吏덈Ц??鍮꾩뼱 ?덉뼱 ?꾩껜 ?붿빟 湲곗??쇰줈 ?뺣━?덉뒿?덈떎.',
  ].join('\n');
};

const makeVisualRows = (fileNames, lines) => {
  const sources = fileNames.length > 0 ? fileNames : ['?낅줈??臾몄꽌'];
  const baseLines = lines.length
    ? lines
    : ['핵심 주제와 연구 목적', '실험 결과와 수치 정보', '방법론 차이점', '추가 검토가 필요한 내용'];

  return Array.from({ length: Math.max(4, Math.min(6, sources.length + baseLines.length - 1)) }, (_, index) => ({
    label: sources[index % sources.length],
    point: baseLines[index % baseLines.length],
    score: Math.max(36, Math.min(96, 88 - index * 7 + ((index % 2) * 9))),
  }));
};

const buildVisualAsset = (type, files, messages) => {
  const analysisText = getLatestAnalysisText(messages);
  const lines = splitMeaningfulLines(analysisText);
  const fileNames = files.length > 0 ? files.map((file) => file.name) : ['?낅줈??臾몄꽌'];
  const createdAt = Date.now();
  const baseTitle = {
    table: '문서 핵심 비교표',
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
    text: `${fileNames.join(', ')} 湲곗??쇰줈 ?앹꽦??${baseTitle}?낅땲??`,
    desc: lines.slice(0, 2).join(' ') || '?낅줈??臾몄꽌??二쇱슂 ?댁슜???쒓컖?뷀뻽?듬땲??',
    rows,
    branches,
    keywords: keywords.length ? keywords : ['?듭떖', '鍮꾧탳', '寃곌낵'],
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
    { id: 'intro', role: 'ai', text: '遺꾩꽍???쒖옉?섎젮硫??뚯씪???낅줈?쒗븯嫄곕굹 李⑦듃瑜??앹꽦?섏꽭??' },
  ]);
  const [draftConversationId] = useState(() => `conversation-${Date.now()}`);
  const [visuals, setVisuals] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [generatedVisuals, setGeneratedVisuals] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [creatingVisualType, setCreatingVisualType] = useState(null);
  const [isProjectSaveOpen, setIsProjectSaveOpen] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState('');

  const currentInviteCode = currentProject?.inviteCode || restoredData?.inviteCode || '??????앹꽦';

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
    if (!currentInviteCode || currentInviteCode === '??????앹꽦') {
      window.alert('?꾨줈?앺듃瑜???ν븯硫?珥덈?肄붾뱶媛 ?앹꽦?⑸땲??');
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
    window.alert(`珥덈?肄붾뱶媛 蹂듭궗?섏뿀?듬땲?? ${currentInviteCode}`);
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
    if (!restoredData) return;
    const sourceThread = restoredData.thread?.length
      ? restoredData.thread
      : [
          restoredData.q && { id: 'restored-question', role: 'user', text: restoredData.q },
          restoredData.a && { id: 'restored-answer', role: 'ai', text: restoredData.a },
        ].filter(Boolean);

    if (!sourceThread.length) return;

    const restoredMessages = sourceThread
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
    if (restoredMessages.length > 0) setMessages(restoredMessages);
    setSavedProjectId(restoredData.projectId || null);
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
      text: `?뚯씪: ${file.name}??媛) ?낅줈?쒕릺?덉뒿?덈떎.`,
    }));
    setMessages((prev) => [...prev, ...newMessages]);
  };

  const handleRemoveFile = (targetFile) => {
    const targetKey = getFileKey(targetFile);
    setFiles((prev) => prev.filter((file) => getFileKey(file) !== targetKey));
    setMessages((prev) =>
      prev.filter((message) => message.text !== `?뚯씪: ${targetFile.name}??媛) ?낅줈?쒕릺?덉뒿?덈떎.`)
    );
  };

  const rememberRecentConversation = (question, threadMessages) => {
    const recentConversationsKey = getRecentConversationsKey();
    const savedRecents = readJson(recentConversationsKey, []);
    const conversationId = effectiveProjectId || draftConversationId;
    const title =
      currentProject?.title ||
      restoredData?.projectTitle ||
      question.slice(0, 36) ||
      '새 분석 대화';
    const today = formatDate();
    const nextRecent = {
      id: conversationId,
      projectId: effectiveProjectId,
      title,
      question,
      date: today,
      inviteCode: currentProject?.inviteCode || restoredData?.inviteCode,
      thread: toStoredThread(threadMessages),
    };

    writeJson(recentConversationsKey, [
      nextRecent,
      ...(Array.isArray(savedRecents)
        ? savedRecents.filter((item) => item.projectId !== conversationId && item.id !== conversationId)
        : []),
    ].slice(0, 20));
  };

  const handleSendMessage = async () => {
    const nextQuestion = promptText.trim();
    if (!nextQuestion || isAnalyzing) return;

    setPromptText('');
    const userMessage = { id: Date.now(), role: 'user', text: nextQuestion };
    setMessages((prev) => {
      const nextMessages = [...prev, userMessage];
      rememberRecentConversation(nextQuestion, nextMessages);
      return nextMessages;
    });

    if (files.length === 0) {
      setMessages((prev) => {
        const aiMessage = { id: Date.now() + 1, role: 'ai', text: buildLocalFallbackAnswer(nextQuestion, files, prev) };
        const nextMessages = [...prev, aiMessage];
        rememberRecentConversation(nextQuestion, nextMessages);
        return nextMessages;
      });
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
        ? `\n\n遺꾩꽍 ?붿쭊: ${response.data.provider === 'google' ? 'Google Gemini' : 'OpenAI'} (${response.data.model})`
        : '\n\n遺꾩꽍 ?붿쭊: 湲곕낯 臾몄꽌 異붿텧';
      setMessages((prev) => {
        const aiMessage = { id: Date.now() + 1, role: 'ai', text: `${response.data.answer}${sourceLabel}` };
        const nextMessages = [...prev, aiMessage];
        rememberRecentConversation(nextQuestion, nextMessages);
        return nextMessages;
      });
    } catch (error) {
      const serverMessage = error.response?.data?.detail || '';
      const message = [
        serverMessage && `?쒕쾭 遺꾩꽍 ?ㅽ뙣: ${serverMessage}`,
        buildLocalFallbackAnswer(nextQuestion, files, messages),
      ].filter(Boolean).join('\n\n');
      setMessages((prev) => {
        const aiMessage = { id: Date.now() + 1, role: 'ai', text: message };
        const nextMessages = [...prev, aiMessage];
        rememberRecentConversation(nextQuestion, nextMessages);
        return nextMessages;
      });
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
        text: 'FastAPI ?쒓컖???앹꽦???ㅽ뙣??釉뚮씪?곗? 湲곕낯 ?앹꽦湲곕줈 ?꾩떆 ?먮즺瑜?留뚮뱾?덉뒿?덈떎.',
      };
      setGeneratedVisuals((prev) => [newAsset, ...prev].slice(0, 12));
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'ai', text: error.response?.data?.detail || '?쒓컖??API? ?곌껐?????놁뼱 ?꾩떆 ?먮즺瑜??앹꽦?덉뒿?덈떎.' },
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
      window.alert('?꾨줈?앺듃??理쒕? 10媛쒓퉴吏 ??λ맗?덈떎. ???꾨줈?앺듃瑜???ν븯?ㅻ㈃ 湲곗〈 ?꾨줈?앺듃瑜???젣?댁＜?몄슂.');
      return;
    }
    if (existingProject && (existingProject.visuals || []).filter(isVisualStorageItem).length >= MAX_VISUALS) {
      window.alert('?쒓컖??蹂닿??⑥? 理쒕? 10媛쒓퉴吏 ??λ맗?덈떎. ???쒓컖?붾? ??ν븯?ㅻ㈃ 湲곗〈 ?쒓컖?붾? ??젣?댁＜?몄슂.');
      return;
    }
    const fallbackTitle =
      existingProject?.title ||
      projectTitle ||
      restoredData?.projectTitle ||
      files[0]?.name?.replace(/\.[^.]+$/, '') ||
      '?쒓컖??遺꾩꽍 ?꾨줈?앺듃';
    const title = existingProject?.title || window.prompt('??ν븷 ?꾨줈?앺듃紐낆쓣 ?낅젰?섏꽭??', fallbackTitle);
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
      type: existingProject?.type || '遺꾩꽍',
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
      window.alert('?꾨줈?앺듃 ?섏씠吏???쒓컖??蹂닿??⑥뿉 ??λ릺?덉뒿?덈떎.');
    } finally {
      setIsSavingProject(false);
    }
  };

  const renderVisualPreview = (asset) => {
    if (asset.kind === 'table') {
      const rows = asset.rows?.length ? asset.rows : makeVisualRows(['?낅줈??臾몄꽌'], splitMeaningfulLines(asset.text || asset.desc));
      return (
        <div className="mini-table">
          <div className="th">?먮즺</div>
          <div className="th">?듭떖 ?댁슜</div>
          <div className="th">?먯닔</div>
          {rows.slice(0, 6).flatMap((row) => [
            <div key={`${row.label}-label`}>{row.label}</div>,
            <div key={`${row.label}-point`}>{row.point}</div>,
            <div key={`${row.label}-score`}>{row.score}</div>,
          ])}
        </div>
      );
    }

    if (asset.kind === 'graph') {
      const rows = asset.rows?.length ? asset.rows : [{ label: '?듭떖', score: 70 }, { label: '鍮꾧탳', score: 62 }];
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
          <div className="axis y-axis">?먯닔</div>
          <div className="axis x-axis">?먮즺</div>
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
      '??遺꾩꽍 ?꾨줈?앺듃';
    setProjectNameInput(defaultTitle);
    setIsProjectSaveOpen(true);
  };

  const handleSaveAnalysisProject = async () => {
    if (isSavingProject) return;

    const title = projectNameInput.trim();
    if (!title) {
      window.alert('?꾨줈?앺듃紐낆쓣 ?낅젰?댁＜?몄슂.');
      return;
    }

    const projectsKey = getProjectsKey();
    const recentConversationsKey = getRecentConversationsKey();
    const savedProjects = readJson(projectsKey, []);
    const existingProject = Array.isArray(savedProjects)
      ? savedProjects.find((project) => project.id === effectiveProjectId)
      : null;
    if (!existingProject && Array.isArray(savedProjects) && savedProjects.length >= MAX_PROJECTS) {
      window.alert('?꾨줈?앺듃??理쒕? 10媛쒓퉴吏 ??λ맗?덈떎. ???꾨줈?앺듃瑜???ν븯?ㅻ㈃ 湲곗〈 ?꾨줈?앺듃瑜???젣?댁＜?몄슂.');
      return;
    }
    const storedVisuals = visuals.filter(isVisualStorageItem).slice(0, MAX_VISUALS);
    if (visuals.filter(isVisualStorageItem).length > MAX_VISUALS) {
      window.alert('?쒓컖??蹂닿??⑥? 理쒕? 10媛쒓퉴吏 ??λ맗?덈떎. 10媛쒕쭔 ??λ릺怨? 異붽? ??ぉ? 湲곗〈 ?쒓컖?붾? ??젣?????ㅼ떆 ??ν빐二쇱꽭??');
    }
    const today = formatDate();
    const projectRecord = {
      ...(existingProject || {}),
      id: existingProject?.id || effectiveProjectId || `project-${Date.now()}`,
      type: files.some((file) => file.name.toLowerCase().endsWith('.hwp') || file.name.toLowerCase().endsWith('.hwpx'))
        ? 'HWP'
        : '遺꾩꽍',
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
      // ?뮕 ?ш린??`.slice(0, 3)`???쒓굅?섏뿬 臾댁젣????λ릺?꾨줉 蹂寃쏀뻽?듬땲??
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
      window.alert('?꾨줈?앺듃 ?섏씠吏? 理쒓렐 ??붿뿉 ??λ릺?덉뒿?덈떎.');
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
          <p className="hint">?꾩옱 ?낅줈??臾몄꽌? 理쒓렐 遺꾩꽍 ?듬???湲곗??쇰줈 ?먮즺瑜?留뚮벊?덈떎.</p>
          <div className="asset-list">
            {[...generatedVisuals, ...visuals.filter((visual) => !generatedVisuals.some((item) => item.id === visual.id))]
              .map((visual, index) => (
                <div key={`${visual.id}-${index}`} className="asset-item">
                  <strong>{visual.title}</strong>
                  <span>{visual.saved ? '프로젝트 보관함에 저장됨' : '채팅창에 생성됨'}</span>
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
            <h2>AI 遺꾩꽍 Q&A</h2>
            <div className="actions">
              <div className="api-key-box">
                <i className="fa-solid fa-key"></i>
                <select value={llmProvider} onChange={handleProviderChange} aria-label="LLM ?쒓났???좏깮">
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
                    aria-label="API ??吏?곌린"
                  >
                    횞
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
            {isAnalyzing && <AiRow><div className="ai-box">GPT媛 臾몄꽌瑜?遺꾩꽍?섍퀬 ?덉뒿?덈떎...</div></AiRow>}
          </StreamMessageArea>

          <BottomPromptInput>
            {files.length > 0 && (
              <div className="file-island-list" aria-label="?낅줈?쒕맂 ?뚯씪 紐⑸줉">
                {files.map((file) => (
                  <div className="file-island" key={getFileKey(file)} title={file.name}>
                    <i className="fa-regular fa-file-lines"></i>
                    <span>{file.name}</span>
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => handleRemoveFile(file)}
                      aria-label={`${file.name} ??젣`}
                      title="?뚯씪 ??젣"
                    >
                      횞
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
              <button type="button" onClick={handleSendMessage}>?꾩넚</button>
            </div>
          </BottomPromptInput>
        </MainQAEngine>
      </MainLayout>
    </Container>
  );
}

export default AnalysisC;

