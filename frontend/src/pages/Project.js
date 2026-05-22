import React, { useEffect, useMemo, useState } from 'react';
import {
  ProjectsContainer,
  HeaderSection,
  SectionTitleRow,
  VisualSection,
  VisualBoxContainer,
  VisualCard,
  ProjectGrid,
  ProjectCard,
  EmptyCard,
  ModalOverlay,
  ModalContent,
  DrawerBackdrop,
  DrawerContainer
} from './styles/Project.styles';
import {
  getProjectsKey,
  getRecentConversationsKey,
  getSharedRoomKey,
  getShareRoomKey,
  readJson,
  SHARED_PROJECTS_KEY,
  writeJson,
} from '../utils/storageKeys';

const defaultProjects = [];

const legacyDummyProjectTitles = [
  '이미지 분류',
  '자연어 처리',
  '논문 분석 처리',
  '딥러닝 이미지 분류 연구 비교',
];

const sanitizeProjects = (projects) =>
  (Array.isArray(projects) ? projects : []).filter(
    (project) => project && !legacyDummyProjectTitles.includes(project.title)
  );

const asArray = (value) => (Array.isArray(value) ? value : []);

const createInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const loadProjects = () => {
  try {
    const saved = localStorage.getItem(getProjectsKey());
    if (!saved) return defaultProjects;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? sanitizeProjects(parsed) : defaultProjects;
  } catch {
    return defaultProjects;
  }
};

const deleteProjectEverywhere = (projectId) => {
  const projectsKey = getProjectsKey();
  const recentConversationsKey = getRecentConversationsKey();
  const shareRoomKey = getShareRoomKey();
  const savedProjects = readJson(projectsKey, []);
  const deletedProject = Array.isArray(savedProjects) ? savedProjects.find((project) => project.id === projectId) : null;
  if (Array.isArray(savedProjects)) {
    writeJson(projectsKey, savedProjects.filter((project) => project.id !== projectId));
  }

  const sharedProjects = readJson(SHARED_PROJECTS_KEY, []);
  if (Array.isArray(sharedProjects)) {
    writeJson(
      SHARED_PROJECTS_KEY,
      sharedProjects.filter((project) => project.id !== projectId && project.inviteCode !== deletedProject?.inviteCode)
    );
  }

  const savedRecents = readJson(recentConversationsKey, []);
  if (Array.isArray(savedRecents)) {
    writeJson(
      recentConversationsKey,
      savedRecents.filter((item) => item.projectId !== projectId && item.id !== projectId)
    );
  }

  const savedRoom = readJson(shareRoomKey, null);
  if (savedRoom) {
    writeJson(shareRoomKey, {
      ...savedRoom,
      loadedProjectIds: (savedRoom.loadedProjectIds || []).filter((id) => id !== projectId),
      comments: savedRoom.comments || [],
      members: savedRoom.members || [],
    });
  }

  if (deletedProject?.inviteCode) {
    writeJson(getSharedRoomKey(deletedProject.inviteCode), {
      inviteCode: deletedProject.inviteCode,
      joinedCode: deletedProject.inviteCode,
      loadedProjectIds: [],
      comments: [],
      members: [],
    });
  }
};

const copyText = async (text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
  window.alert(`초대코드가 복사되었습니다: ${text}`);
};

function Projects({ onProjectRestore, onShareProjectOpen }) {
  const [projects, setProjects] = useState(loadProjects);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [selectedVisual, setSelectedVisual] = useState(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  const visuals = useMemo(
    () =>
      asArray(projects).flatMap((project) =>
        asArray(project.visuals).map((visual) => ({
          ...visual,
          projectId: project.id,
          projectTitle: visual.projectTitle || project.title,
        }))
      ),
    [projects]
  );

  useEffect(() => {
    writeJson(getProjectsKey(), asArray(projects));
    const sharedProjects = readJson(SHARED_PROJECTS_KEY, []);
    const ownProjectsWithInvite = asArray(projects).filter((project) => project?.inviteCode);
    if (ownProjectsWithInvite.length === 0) return;

    const ownIds = new Set(ownProjectsWithInvite.map((project) => project.id));
    const ownInviteCodes = new Set(ownProjectsWithInvite.map((project) => project.inviteCode));
    const otherSharedProjects = Array.isArray(sharedProjects)
      ? sharedProjects.filter((project) => !ownIds.has(project.id) && !ownInviteCodes.has(project.inviteCode))
      : [];

    writeJson(SHARED_PROJECTS_KEY, [...ownProjectsWithInvite, ...otherSharedProjects].slice(0, 100));
  }, [projects]);

  useEffect(() => {
    const syncProjects = (event) => {
      if (event.detail?.key && event.detail.key !== getProjectsKey()) return;
      setProjects(loadProjects());
    };

    window.addEventListener('storage', syncProjects);
    window.addEventListener('papermate-storage-updated', syncProjects);
    return () => {
      window.removeEventListener('storage', syncProjects);
      window.removeEventListener('papermate-storage-updated', syncProjects);
    };
  }, []);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (asArray(projects).length >= 10) { alert("프로젝트는 최대 10개까지 생성 가능합니다."); return; }
    const today = new Date().toLocaleDateString('ko-KR').replace(/. /g, '.').slice(0, -1);
    setProjects([...asArray(projects), {
      id: `project-${Date.now()}`,
      type: 'New',
      title: `새 프로젝트 ${asArray(projects).length + 1}`,
      updatedAt: today,
      date: today,
      charts: 0,
      isHwp: false,
      inviteCode: createInviteCode(),
      files: [],
      thread: [],
      visuals: [],
    }]);
  };

  const handleDeleteProject = (e, project) => {
    e.preventDefault(); e.stopPropagation();
    const firstConfirm = window.confirm(`"${project.title}" 프로젝트를 정말 삭제하시겠습니까?`);
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      '삭제하면 이 프로젝트의 저장 문서, 파일 목록, 분석 대화, 공유 타임라인 연결, 최근대화 기록이 모두 영구 삭제됩니다. 계속 진행할까요?'
    );
    if (!secondConfirm) return;

    deleteProjectEverywhere(project.id);
    setProjects((prev) => prev.filter((item) => item.id !== project.id));
    if (editingProjectId === project.id) setEditingProjectId(null);
    window.alert('프로젝트가 영구 삭제되었습니다.');
  };

  const handleEditClick = (e, project) => { e.preventDefault(); e.stopPropagation(); setEditingProjectId(project.id); setEditTitle(project.title); };
  const handleTitleSave = () => { if (!editTitle.trim()) return; const today = new Date().toLocaleDateString('ko-KR').replace(/. /g, '.').slice(0, -1); setProjects(asArray(projects).map(p => p.id === editingProjectId ? { ...p, title: editTitle.trim(), updatedAt: today, date: today } : p)); setEditingProjectId(null); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleTitleSave(); else if (e.key === 'Escape') setEditingProjectId(null); };
  
  const handleProjectRestore = (project) => {
    if (project.source === 'shared-discussion') {
      onShareProjectOpen?.({
        projectId: project.id,
        projectTitle: project.title,
        inviteCode: project.inviteCode,
      });
      return;
    }

    if (!onProjectRestore) return;
    const thread = Array.isArray(project.thread) ? project.thread : [];
    onProjectRestore({
      projectId: project.id,
      q: '저장된 프로젝트를 이어서 작업합니다.',
      a: '저장된 프로젝트를 이어서 작업합니다.',
      projectTitle: project.title,
      inviteCode: project.inviteCode,
      files: asArray(project.files),
      thread,
    });
  };

  const handleInviteCopy = (event, inviteCode) => {
    event.preventDefault();
    event.stopPropagation();
    copyText(inviteCode);
  };

  const handleDeleteVisual = (e, id) => {
    e.preventDefault(); 
    e.stopPropagation();
    if(window.confirm("이 시각화 데이터를 삭제하시겠습니까?")) {
      setProjects((prev) =>
        prev.map((project) => {
          const nextVisuals = asArray(project.visuals).filter((visual) => visual.id !== id);
          return { ...project, visuals: nextVisuals, charts: nextVisuals.length };
        })
      );
      if (selectedVisual && selectedVisual.id === id) {
        setSelectedVisual(null);
      }
    }
  };

  const renderVisualPreview = (visual) => {
    if (visual?.kind === 'table') return <div className="mini-visual table"><span></span></div>;
    if (visual?.kind === 'graph') return <div className="mini-visual graph"><i></i></div>;
    return <div className="mini-visual chart"><span></span></div>;
  };

  return (
    <ProjectsContainer>
      <HeaderSection><h2>내 프로젝트</h2></HeaderSection>

      <VisualSection>
        <SectionTitleRow>
          <h3>저장된 시각화 보관함 <span style={{fontSize: '14px', color: '#94a3b8', fontWeight: '600', marginLeft: '6px'}}>({visuals.length}/10)</span></h3>
          <div className="btn-group">
            <button type="button" className="sub-btn" onClick={() => setIsViewAllOpen(true)}>전체 보기</button>
          </div>
        </SectionTitleRow>
        
        <VisualBoxContainer>
          {visuals.length === 0 ? (
            <EmptyCard as="div"><span>저장된 시각화가 없습니다.</span></EmptyCard>
          ) : visuals.slice(0, 3).map((visual) => (
            <VisualCard key={visual.id} onClick={() => setSelectedVisual(visual)}>
              <button className="delete-visual-btn" onClick={(e) => handleDeleteVisual(e, visual.id)} title="삭제">
                <i className="fa-solid fa-trash"></i>
              </button>
              <div className="mock-img">{renderVisualPreview(visual)}</div>
              <h4>{visual.title}</h4>
              <span>{visual.projectTitle} · {visual.date}</span>
            </VisualCard>
          ))}
        </VisualBoxContainer>
      </VisualSection>

      <SectionTitleRow>
        <h3>진행 중인 프로젝트 <span style={{fontSize: '14px', color: '#94a3b8', fontWeight: '600', marginLeft: '8px'}}>({asArray(projects).length}/10)</span></h3>
        <button type="button" className="primary-btn" onClick={handleAddProject}>+ 새 프로젝트...</button>
      </SectionTitleRow>

      <ProjectGrid>
        {asArray(projects).map((project) => (
          <ProjectCard key={project.id} onClick={() => handleProjectRestore(project)}>
            <h3>{project.title}</h3>
            <button onClick={(e) => handleInviteCopy(e, project.inviteCode)}>초대코드: {project.inviteCode}</button>
            <button onClick={(e) => handleDeleteProject(e, project)}>삭제</button>
          </ProjectCard>
        ))}
      </ProjectGrid>

      {isViewAllOpen && (
        <ModalOverlay onClick={() => setIsViewAllOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            {visuals.map((visual) => (
               <VisualCard key={visual.id} onClick={() => setSelectedVisual(visual)}>
                 <h4>{visual.title}</h4>
               </VisualCard>
            ))}
          </ModalContent>
        </ModalOverlay>
      )}

      <DrawerBackdrop $show={!!selectedVisual} onClick={() => setSelectedVisual(null)} />
      <DrawerContainer $show={!!selectedVisual}>
        {selectedVisual && (
          <>
            <h3>{selectedVisual.title}</h3>
            <button onClick={() => setSelectedVisual(null)}>닫기</button>
          </>
        )}
      </DrawerContainer>
    </ProjectsContainer>
  );
}

export default Projects;