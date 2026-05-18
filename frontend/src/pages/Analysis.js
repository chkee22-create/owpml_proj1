import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex; width: 100%; height: 100vh; background: #ffffff; box-sizing: border-box;
`;

/* 🎨 1. 좌측 파일 업로드 트리 영역 (파일 패널) */
const LeftUploadPanel = styled.div`
  width: 260px; 
  border-right: 1px solid #e2e8f0;      /* 💡 사이드바 경계선과 동일한 슬레이트 라인 적용 */
  background: #f8fafc;                  /* 💡 메인 대시보드 배경과 통일감을 주는 부드러운 화이트 그레이 */
  display: flex; flex-direction: column; padding: 20px; box-sizing: border-box;
  
  /* 문서 업로드 드롭존 구역 */
  .drop-zone {
    border: 2px dashed #cbd5e1; 
    border-radius: 12px; padding: 32px 16px; 
    text-align: center; color: #64748b; /* 💡 텍스트 가독성을 위해 살짝 톤 업 (Slate 500) */
    font-weight: 700; font-size: 12.5px;/* 💡 기획안의 조밀한 서체 스펙 매칭 */
    display: flex; flex-direction: column; align-items: center; gap: 12px; 
    margin-bottom: 24px; 
    background: #ffffff;
    cursor: pointer;
    transition: all 0.15s ease-in-out;

    &:hover {
      background: #f1f5f9;              /* 💡 마우스 올렸을 때 업로드 유도 피드백 */
      border-color: #94a3b8;
    }
    i { font-size: 26px; color: #94a3b8; }
  }

  /* 업로드 완료되어 리스트업된 파일 아이템 카드 */
  .file-item {
    display: flex; align-items: center; gap: 8px; 
    background: white; padding: 12px; 
    border: 1px solid #e2e8f0;          /* 💡 선명하되 과하지 않은 연한 테두리 */
    border-radius: 8px;                 /* 💡 라운드 값 6px에서 8px로 통일감 상향 */
    margin-bottom: 8px; 
    font-size: 12.5px; font-weight: 700; 
    color: #1e293b;                     /* 💡 파일명이 눈에 쏙 들어오도록 다크 슬레이트 지정 */
    box-shadow: none;                   /* 💡 플랫한 UI를 위해 그림자는 깔끔하게 제거 */
    
    span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .size { color: #94a3b8; font-size: 11px; font-weight: 600; }
  }

  /* 분석 완료 상태 표시 바 (하단 고정) */
  .status-bar { 
    background: #e6f4f4;                /* 💡 서비스 포인트 컬러와 어울리는 연한 민트/틸 배경 전환 */
    color: #0ea5a4;                     /* 💡 텍스트 색상도 메인 시그니처 틸 컬러로 매칭 */
    padding: 12px; border-radius: 8px; 
    font-size: 12.5px; font-weight: 800; 
    display: flex; align-items: center; justify-content: center; gap: 8px; 
    margin-top: auto; 
    border: 1px solid #bce3e3;
  }
`;

/* 🎨 2. 우측 메인 질의응답 분석 엔진 워크스페이스 */
const MainQAEngine = styled.div`
  flex: 1; display: flex; flex-direction: column; height: 100vh; background: #ffffff;
`;

/* 🎨 3. 우측 상단 타이틀 메뉴 바 */
const TopMenuBar = styled.div`
  padding: 18px 32px;                   /* 💡 위아래 여백을 주어 타이틀바 뼈대 안정감 구축 */
  border-bottom: 1px solid #e2e8f0;     /* 💡 라인 컬러 통일 (#f1f5f9 -> #e2e8f0) */
  display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
  
  h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0; }
  
  /* 우측 액션 버튼 군 (프로젝트 저장, 내보내기 등) */
  .actions { 
    display: flex; gap: 8px; 
    button { 
      background: #ffffff;              /* 💡 버튼 배경을 흰색으로 전환하여 더 정갈하게 변경 */
      border: 1px solid #cbd5e1; 
      padding: 8px 14px; border-radius: 6px; 
      font-weight: 700; font-size: 13px; 
      cursor: pointer; color: #475569;
      transition: all 0.15s;
      
      &:hover { background: #f8fafc; color: #1e293b; border-color: #94a3b8; }
    } 
  }
`;

/* 🎨 4. AI와 유저의 대화가 흘러가는 스트리밍 스크롤 영역 */
const StreamMessageArea = styled.div`
  flex: 1; padding: 40px 60px;          /* 💡 좌우 여백을 60px로 넓혀서 논문 읽을 때 시야가 답답하지 않게 가로폭 확장 */
  overflow-y: auto; display: flex; flex-direction: column; gap: 28px;
`;

/* 🎨 5. AI 답변 줄 레이아웃 */
const AiRow = styled.div`
  display: flex; gap: 16px;
  
  /* AI 로봇 프로필 원형/사각 아이콘 */
  .ai-icon { 
    width: 36px; height: 36px; border-radius: 8px; 
    background: #e6f4f4; color: #0ea5a4; 
    display: flex; align-items: center; justify-content: center; 
    font-size: 18px; flex-shrink: 0; border: 1px solid #bce3e3; 
  }
  
  /* AI 답변 말풍선 박스 */
  .ai-box { 
    background: #f1f5f9;                /* 💡 차분하고 정돈된 Light Slate 회색 배경 */
    padding: 16px 24px;                 /* 💡 줄글이 가로로 길어지므로 가로 패딩을 24px로 넉넉히 확보 */
    border-radius: 4px 16px 16px 16px;  /* 💡 AI 아이콘 시작점 기준으로 말풍선 모서리 엣지 포인트 부여 */
    color: #1e293b; 
    font-size: 14.5px; 
    font-weight: 600;                   /* 💡 기획서 폰트 두께 스펙 반영 */
    line-height: 1.65;                  /* 💡 논문 분석 데이터 판독 시 줄간격이 꼬이지 않도록 최적화 */
    max-width: 80%; white-space: pre-wrap; 
  }
`;

/* 🎨 6. 유저 질문 질문 줄 레이아웃 */
const UserRow = styled.div`
  display: flex; justify-content: flex-end;
`;

/* 유저 질문 말풍선 박스 */
const UserBox = styled.div`
  background: #0ea5a4;                  /* 💡 서비스 메인 테마 컬러 매칭 */
  color: white; 
  padding: 14px 22px; 
  border-radius: 16px 4px 16px 16px;    /* 💡 우측 정렬 기준에 맞춰 모서리 엣지 포인트 부여 */
  font-size: 14px; font-weight: 700; 
  max-width: 75%; 
  box-shadow: 0 4px 12px rgba(14, 165, 164, 0.15); /* 💡 유저 질문 창에만 포인트로 은은한 브라이트 컬러 섀도우 가미 */
`;

/* 🎨 7. 딥러닝 답변 대기 중 로딩 로우 */
const LoadingSection = styled.div`
  display: flex; align-items: center; gap: 12px; 
  color: #0ea5a4;                       /* 💡 연동 대기선 색상을 초록색(#2ecc71)에서 브랜드 민트색으로 통일 */
  font-weight: 700; font-size: 15px; 
  padding-left: 52px;                   /* 💡 AI 아이콘 가로선 오프셋 정렬 정밀 세팅 */
  
  .spinner { animation: spin 1.5s linear infinite; font-size: 18px; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

/* 🎨 8. 최하단 프롬프트 인풋 영역 (대화 바) */
const BottomPromptInput = styled.div`
  padding: 24px 40px;                   /* 💡 본문 폭(60px)에 자연스럽게 이어지도록 여백 밸런스 상향 */
  border-top: 1px solid #e2e8f0; 
  display: flex; gap: 14px; align-items: center;
  
  /* 검색 입력창 주머니 테두리 */
  .input-wrapper {
    flex: 1; display: flex; align-items: center; 
    background: #fff; 
    border: 2px solid #e2e8f0;          /* 💡 채팅창과 똑같은 2px 선명한 경계선으로 수정 */
    border-radius: 14px; padding: 6px 18px;
    transition: border-color 0.15s;
    
    &:focus-within { border-color: #64748b; } /* 💡 마우스 클릭 시 테두리 색상 부드럽게 점등 */
    
    input { 
      flex: 1; border: none; padding: 10px 0; 
      font-size: 14px; font-weight: 600; outline: none; 
      color: #1e293b;
      &::placeholder { color: #94a3b8; }
    }
    i { 
      color: #94a3b8; font-size: 18px; cursor: pointer; 
      transition: color 0.15s;
      &:hover { color: #0ea5a4; }       /* 💡 전송 종이비행기 아이콘 호버 시 민트색으로 전환 */
    }
  }
`;

function AnalysisC({ restoredData, clearRestore }) {
  // 💡 복구 데이터 적재 여부에 따라 동적 렌더링 컨텐츠 스위칭 변수 가동
  const currentQuestion = restoredData ? restoredData.q : "세 논문의 정확도 성능을 비교해줘";
  const currentAnswer = restoredData 
    ? restoredData.a 
    : "3개의 논문을 업로드하셨네요! 어떤 내용이 궁금하신가요? 각 논문의 핵심 내용, 실험 결과 비교, 또는 방법론 차이점을 분석해드릴 수 있어요.";

  return (
    <Container>
      <LeftUploadPanel>
        <div className="drop-zone">
          <i className="fa-solid fa-cloud-arrow-up"></i>
          <div>Drag & Drop<br /><span style={{fontSize:'11px',color:'#cbd5e1'}}>HWP, PDF, HWPX 지원</span></div>
        </div>

        <div className="file-item">
          <i className="fa-regular fa-file-pdf" style={{color:'#e74c3c'}}></i>
          <span>attention_is_all_you_need.pdf</span>
          <span className="size">2.1MB</span>
        </div>
        <div className="file-item">
          <i className="fa-regular fa-file-pdf" style={{color:'#e74c3c'}}></i>
          <span>BERT_pretraining.pdf</span>
          <span className="size">1.8MB</span>
        </div>
        <div className="file-item">
          <i className="fa-regular fa-file-pdf" style={{color:'#cbd5e1'}}></i>
          <span style={{color:'#94a3b8'}}>GPT4_technical_report.pdf</span>
          <span className="size" style={{color:'#0ea5a4'}}>분석 중</span>
        </div>

        <div className="status-bar">
          <i className="fa-solid fa-circle-notch fa-spin"></i> AI가 문서를 분석하고 있어요...
        </div>
      </LeftUploadPanel>

      <MainQAEngine>
        <TopMenuBar>
          <h2>AI 분석 Q&A {restoredData && <span style={{fontSize:'12px', background:'#e6f7f2', color:'#2ecc71', padding:'2px 8px', borderRadius:'4px'}}>⏳ 과거 시점 복원됨</span>}</h2>
          <div className="actions">
            {restoredData && <button onClick={clearRestore} style={{borderColor:'#e74c3c', color:'#e74c3c'}}>최신으로 가기</button>}
            <button><i className="fa-regular fa-floppy-disk"></i> 차트 저장</button>
            <button><i className="fa-solid fa-paperclip"></i> 공유</button>
          </div>
        </TopMenuBar>

        <StreamMessageArea>
          {/* 기본 고정 안내 대화 스레드 */}
          <AiRow>
            <div className="ai-icon"><i className="fa-solid fa-robot"></i></div>
            <div className="ai-box">3개의 논문을 업로드하셨네요! 어떤 내용이 궁금하신가요? 각 논문의 핵심 내용, 실험 결과 비교, 또는 방법론 차이점을 분석해드릴 수 있어요.</div>
          </AiRow>

          {/* 질문 내용 스레드 */}
          <UserRow>
            <div className="user-box">{currentQuestion}</div>
          </UserRow>

          {/* 답변 내용 스레드 */}
          <AiRow>
            <div className="ai-icon"><i className="fa-solid fa-robot"></i></div>
            <div className="ai-box">{restoredData ? currentAnswer : "논문별 주요 벤치마크 정확도를 비교를 진행하고 있습니다."}</div>
          </AiRow>

          {/* 로딩 애니메이션 샌드박스 (복구 시점이 아닐 때만 노출) */}
          {!restoredData && (
            <LoadingSection>
              <i className="fa-solid fa-rotate spinner"></i>
              <span>AI가 비교 차트를 생성하고 있습니다...</span>
            </LoadingSection>
          )}
        </StreamMessageArea>

        <BottomPromptInput>
          <div className="input-wrapper">
            <i className="fa-solid fa-plus" style={{marginRight:'14px'}}></i>
            <input type="text" placeholder="여기에 논문 분석 질문을 입력하세요..." readOnly />
            <i className="fa-regular fa-paper-plane"></i>
          </div>
        </BottomPromptInput>
      </MainQAEngine>
    </Container>
  );
}

export default AnalysisC;