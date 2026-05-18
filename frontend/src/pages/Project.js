import React from 'react';
import styled from 'styled-components';
import { palette } from '../shared/palette';

/* ── 전체 페이지 레이아웃 ── */
const ProjectsContainer = styled.div`
  flex: 1;
  padding: 40px 52px;                   /* 💡 마이페이지 우측 패딩(52px)과 수치를 맞춰 라우팅 이동 시 덜컥거림 방지 */
  background: #ffffff;
  overflow-y: auto;
  box-sizing: border-box;
`;

/* ── 상단 타이틀 및 새 프로젝트 생성 버튼 영역 ── */
const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    font-size: 22px;                    /* 💡 타이틀 크기를 26px에서 22px로 살짝 조율하여 시스템 전체 서체 위계 통일 */
    font-weight: 800;
    color: #1e293b;
    margin: 0;
  }

  .new-project-btn {
    background: #0ea5a4;                /* 💡 기존 연두색(#22c55e)을 서비스 시그니처인 민트/틸 컬러로 변경! */
    color: #ffffff;                     /* 💡 메인 테마색에 맞춰 텍스트 컬러를 화이트로 선명하게 변경 */
    border: none;
    border-radius: 8px;                 /* 💡 타원형(20px)에서 모던하고 차분한 각진 라운드(8px)로 커스텀 */
    padding: 10px 18px;                 /* 💡 버튼이 가로로 너무 뚱뚱해지지 않게 컴팩트 패딩 조정 */
    font-size: 14px;                    /* 💡 기본 본문 700 굵기와 매칭 유도 */
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s ease-in-out;
    &:hover { background: #0d9493; }    /* 💡 호버 시 한 톤 어두운 민트색으로 감도 조절 */
  }
`;

/* ── 초대 코드 입력 바 영역 ── */
const InviteCodeBar = styled.div`
  display: flex;
  align-items: center;
  background: #f8fafc;                  /* 💡 어두운 연회색(#e2e8f0)에서 분석 페이지 좌측 패널과 같은 산뜻한 Slate 50으로 변경 */
  border: 1px solid #e2e8f0;            /* 💡 외곽 실선을 얇게 추가하여 마이페이지 가이드라인과 패밀리 룩 완성 */
  border-radius: 12px;                  /* 💡 둥글기 값을 8px에서 12px로 부드럽게 상향 */
  padding: 14px 20px;
  margin-bottom: 32px;
  gap: 12px;

  /* 열쇠 아이콘 */
  .key-icon {
    font-size: 16px;
    color: #0ea5a4;                     /* 💡 튀는 황금색(#f59e0b) 대신 브랜드 아이덴티티 컬러로 포인트를 주어 세련미 가미 */
  }

  /* 안내 문구 라벨 */
  .label-text {
    font-size: 13.5px;                  /* 💡 조금 더 조밀한 서체 크기로 최적화 */
    font-weight: 700;
    color: #475569;                     /* 💡 Slate 600 계열로 차분하게 세팅 */
  }

  /* 실제 초대 코드 입력 컴포넌트 */
  .code-input {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    font-family: monospace;
    font-weight: 700;
    color: #1e293b;
    width: 110px;                       /* 💡 여백을 고려하여 10px 확장 */
    text-align: center;
    &:focus { border-color: #64748b; outline: none; }
  }

  /* 참여하기(Join) 버튼 */
  .join-btn {
    margin-left: auto;
    background: #ffffff;                /* 💡 무거운 그레이 톤 배경에서 정갈한 화이트 버튼 스타일로 전환 */
    color: #475569;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 8px 18px;                  /* 💡 패딩 규격 슬림하게 다듬기 */
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    &:hover { background: #f1f5f9; color: #1e293b; border-color: #94a3b8; }
  }
`;

/* ── 프로젝트 카드 격자 그리드 (3열 구조) ── */
const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;                            /* 💡 격자 간격 24px 유지 (시원한 배열 구도 완성) */
`;

/* 기존 프로젝트 카드 스타일 */
const ProjectCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;            /* 💡 경계 테두리를 조금 더 은은하게 조정 (#cbd5e1 -> #e2e8f0) */
  border-radius: 12px;
  padding: 24px;                        /* 💡 카드 내부 숨통을 트기 위해 20px에서 24px로 확장 */
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: none;                     /* 💡 전체적인 플랫 감성을 유지하기 위해 그림자 제거 */
  height: 180px;                        /* 💡 늘어난 패딩과 내부 요소를 감당하도록 높이를 160px에서 180px로 여유 있게 조율 */
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  /* 💡 마우스 올렸을 때 메인 기능 카드들과 동일한 모션 룩앤필 동기화 */
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
    border-color: #cbd5e1;
  }

  /* 카드 내 상단 카테고리 태그 (예: OWPML 필터링 등) */
  .tag {
    align-self: flex-start;
    background: #f1f5f9;
    color: #475569;
    font-size: 11px;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: 12px;
    margin-bottom: 12px;
    
    /* HWPX/HWP 필터 커스텀 컬러 */
    &.hwp { 
      background: #e6f4f4;              /* 💡 쨍한 연두색 대신 메인 소프트 민트 계열 배경 부여 */
      color: #0ea5a4;                   /* 💡 텍스트 컬러 민트색 매칭 */
    } 
  }

  /* 프로젝트 명 타이틀 */
  h3 {
    font-size: 16px;                    /* 💡 20px에서 16px로 내밀하게 압축하여 서체가 카드 밖으로 넘치지 않게 방어 */
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 6px 0;
    overflow: hidden;                   /* 💡 프로젝트 제목이 길어져도 두 줄 이상 안 깨지게 말줄임표 안전장치 */
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 80%;                     /* 💡 우측 프로필 아바타 영역 침범 방지 */
  }

  /* 생성 및 수정 날짜 */
  .date {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 700;
    margin-bottom: auto;                /* 💡 하단 푸터 영역을 바닥으로 밀어내기 위한 오토 마진 */
  }

  /* 카드 최하단 정보부 바 */
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f1f5f9;
    padding-top: 12px;
    margin-top: 12px;
  }

  /* 하단 메타 정보 (참여 인원, 업로드 문서 수 등) */
  .meta-info {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: #64748b;
    font-weight: 700;
    i { color: #94a3b8; }                /* 💡 아이콘 톤을 부드럽게 세팅 */
  }

  /* 더보기/수정 아이콘 단추 */
  .edit-icon-btn {
    background: none;
    border: none;
    font-size: 15px;
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.1s;
    &:hover { color: #1e293b; }
  }

  /* 우측 상단 배치용 유저 프로필 썸네일 아바타 (정밀 조율 완료) */
  .profile-thumbnail {
    position: absolute;
    right: 24px;                        /* 💡 카드 우측 패딩(24px)과 정렬 선 일치 */
    top: 24px;                          /* 💡 카드 상단 패딩(24px)과 정렬 선 일치 */
    width: 32px;                        /* 💡 사이드바 프로필 규격과 매칭하여 32px 밸런싱 */
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;

    /* 💡 [수정 포인트] 아바타 영역 아이콘 핏 맞춤형 설계 */
    i {
      font-size: 32px;
      color: ${palette.slate[4]};
    }
  }
`;

/* 💡 비어있는 [새 프로젝트 추가] 더미 카드 스펙 구체화 */
const EmptyCard = styled.div`
  background: #ffffff;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 180px;                        /* 💡 메인 프로젝트 카드와 완전히 높이를 동기화 (160px -> 180px) */
  cursor: pointer;
  color: #94a3b8;
  font-weight: 700;
  font-size: 13.5px;                    /* 💡 조밀한 서체 스펙 적용 */
  gap: 6px;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);        /* 💡 빈 카드도 호버 시 같이 부드럽게 들리는 모션 동기화 */
    border-color: #0ea5a4;              /* 💡 호버 시 테두리 점등선을 브랜드 틸 컬러로 밝혀 시각적 만족도 상향 */
    color: #0ea5a4;
  }

  .plus-icon {
    font-size: 16px;                    /* 💡 폰트어썸 플러스 마크 크기 핏 매칭 */
  }
`;

function Projects() {
  
  const handlePreventAction = (e) => {
    e.preventDefault();
  };

  return (
    <ProjectsContainer>
      {/* 1. 상단 헤더 영역 */}
      <HeaderSection>
        <h2>내 프로젝트</h2>
        <button type="button" className="new-project-btn" onClick={handlePreventAction}>
          + 새 프로젝트...
        </button>
      </HeaderSection>

      {/* 2. 초대 코드 입력 바 */}
      <InviteCodeBar>
        <i className="fa-solid fa-key key-icon"></i>
        <span className="label-text">초대 코드로 팀 프로젝트 참여 :</span>
        <input type="text" className="code-input" value="aa33ddf" readOnly />
        <button type="button" className="join-btn" onClick={handlePreventAction}>참여하기</button>
      </InviteCodeBar>

      {/* 3. 프로젝트 카드 배치 보드 */}
      <ProjectGrid>
        {/* 카드 1: 이미지 분류 */}
        <ProjectCard>
          <div className="tag">PDF x 3</div>
          <h3>이미지 분류</h3>
          <div className="date">최근 수정 2026.05.04</div>
          
          {/* 💡 [반영 포인트] 👤 이모지 제거 및 세팅된 원형 서클 아이콘 적용 */}
          <div className="profile-thumbnail">
            <i className="fa-regular fa-circle-user"></i>
          </div>

          <div className="card-footer">
            <div className="meta-info">
              <span><i className="fa-solid fa-users"></i> 개인</span>
              <span><i className="fa-solid fa-box-archive"></i> 차트 2개</span>
            </div>
            <button type="button" className="edit-icon-btn" onClick={handlePreventAction}>
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
        </ProjectCard>

        {/* 카드 2: 자연어 처리 */}
        <ProjectCard>
          <div className="tag hwp">hwp</div>
          <h3>자연어 처리</h3>
          <div className="date">최근 수정 2026.05.04</div>
          
          {/* 아바타 반영 */}
          <div className="profile-thumbnail">
            <i className="fa-regular fa-circle-user"></i>
          </div>

          <div className="card-footer">
            <div className="meta-info">
              <span><i className="fa-solid fa-user"></i> 개인</span>
              <span><i className="fa-solid fa-book"></i> 차트 2개</span>
            </div>
            <button type="button" className="edit-icon-btn" onClick={handlePreventAction}>
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
        </ProjectCard>

        {/* 카드 3: 논문 분석 처리 */}
        <ProjectCard>
          <div className="tag">PDF</div>
          <h3>논문 분석 처리</h3>
          <div className="date">최근 수정 2026.05.04</div>

          {/* 아바타 반영 */}
          <div className="profile-thumbnail">
            <i className="fa-regular fa-circle-user"></i>
          </div>

          <div className="card-footer">
            <div className="meta-info">
              <span><i className="fa-solid fa-user-astronaut"></i> 개인</span>
            </div>
            <button type="button" className="edit-icon-btn" onClick={handlePreventAction}>
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
        </ProjectCard>

        {/* 카드 4: 빈 슬롯 */}
        <EmptyCard onClick={handlePreventAction}>
          <span className="plus-icon">+</span>
          <span>새 프로젝트 추가</span>
        </EmptyCard>

        {/* 카드 5: 빈 슬롯 */}
        <EmptyCard onClick={handlePreventAction}>
          <span className="plus-icon">+</span>
          <span>새 프로젝트 추가</span>
        </EmptyCard>

        {/* 카드 6: 빈 슬롯 */}
        <EmptyCard onClick={handlePreventAction}>
          <span className="plus-icon">+</span>
          <span>새 프로젝트 추가</span>
        </EmptyCard>
      </ProjectGrid>
    </ProjectsContainer>
  );
}

export default Projects;