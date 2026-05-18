import React, { useState } from 'react';
import styled from 'styled-components';
import { palette } from '../shared/palette';

const Container = styled.div`
  display: flex; width: 100%; height: 100vh; background: #ffffff; box-sizing: border-box;
`;

/* ── 1. 좌측 메인 타임라인 콘텐츠 영역 ── */
const MainTimelineContent = styled.div`
  flex: 1; display: flex; flex-direction: column; padding: 40px 52px; box-sizing: border-box; overflow-y: auto;
  
  /* 상단 페이지 타이틀 라인 */
  .header-area { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
  .menu-toggle { font-size: 22px; color: #1e293b; cursor: pointer; }
  
  h2 { font-size: 22px; font-weight: 800; color: #1e293b; margin: 0; }
  h3 { font-size: 14px; font-weight: 700; color: #64748b; margin: 0 0 28px 0; } /* 서브 타이틀 가득 차게 조율 */
`;

/* 타임라인 수직 기둥 축 선 */
const TimelineWrapper = styled.div`
  display: flex; flex-direction: column; position: relative; margin-left: 10px; padding-left: 30px;
  &::before { 
    content: ''; position: absolute; 
    left: 6px; top: 12px; bottom: 12px; 
    width: 2px; 
    background: #e2e8f0;                /* 💡 수직 축 기준선을 좀 더 소프트한 Slate 200으로 완화 */
  }
`;

/* 타임라인 개별 노드/카드 레이아웃 */
const TimelineNode = styled.div`
  display: flex; flex-direction: column; margin-bottom: 32px; position: relative;
  
  /* 축 위에 얹어지는 타임라인 점(Dot) */
  .dot {
    position: absolute; left: -30px; top: 4px; 
    width: 14px; height: 14px; border-radius: 50%; 
    background: #cbd5e1; z-index: 2;
    border: 2px solid white;            /* 💡 점이 선 위에 자연스럽게 얹어지도록 화이트 림 추가 */
    box-sizing: border-box;
    
    /* 현재 활성화되거나 선택된 최신 노드 표시 */
    &amp;.active { 
      background: #0ea5a4;              /* 💡 기존 초록색(#2ecc71)에서 브랜드 메인 민트색으로 변경 */
      box-shadow: 0 0 0 4px rgba(14, 165, 164, 0.15); /* 💡 메인 틸 컬러 기반 링 섀도우 동기화 */
    }
  }
  
  .arrow-line { position: absolute; left: -24px; top: 18px; color: #cbd5e1; font-size: 12px; }

  /* 역사 이력 카드 내용물 */
  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;          /* 💡 기획안 패밀리 룩 테두리 추가 */
    border-radius: 12px;
    padding: 20px;
    transition: all 0.15s;
    
    &amp;:hover { border-color: #cbd5e1; background: #f8fafc; } /* 💡 마우스 오버 시 가벼운 피드백 */

    h4 { margin: 0 0 6px 0; font-size: 15px; font-weight: 800; color: #1e293b; }
    .meta { font-size: 11.5px; color: #94a3b8; font-weight: 600; margin-bottom: 10px; }
    
    /* 이 버전으로 복원 버튼 */
    .restore-btn {
      background: #f1f5f9;              /* 💡 맨글씨 대신 정갈한 미니 캡슐 버튼 형태로 업그레이드 */
      border: 1px solid #e2e8f0; 
      color: #475569; 
      font-weight: 700; font-size: 12px; cursor: pointer;
      display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 6px;
      transition: all 0.15s;
      
      &amp;:hover { 
        background: #e6f4f4;            /* 💡 복원 유도 시 메인 포인트 컬러 점등 */
        color: #0ea5a4; 
        border-color: #bce3e3;
        text-decoration: none; 
      }
    }
  }
`;


/* ── 2. 우측 원스톱 협업 제어 판넬 ── */
const RightCoopPanel = styled.div`
  width: 320px;                         /* 💡 좌측 업로드 패널들과 통일감을 주도록 340px -> 320px 최적화 */
  background: #f8fafc;                  /* 💡 이질적인 초록색(#eef9ec)을 부드러운 Slate 워크스페이스 배경으로 교체 */
  border-left: 1px solid #e2e8f0;       /* 💡 외곽 실선 공통 그레이 매칭 */
  display: flex; flex-direction: column; box-sizing: border-box;
  
  /* 상단 팀원 초대 링크 복사 대형 버튼 */
  .invite-btn { 
    background: #0ea5a4;                /* 💡 블루 계열(#3498db)에서 시그니처 틸 메인 컬러로 변환 */
    color: white; border: none; 
    margin: 24px 20px 16px 20px; 
    padding: 12px; border-radius: 8px;  /* 💡 캡슐 알약 형태에서 단정한 라운드 각(8px) 형태로 커스텀 */
    font-weight: 700; font-size: 13.5px; cursor: pointer;
    transition: background 0.15s;
    &amp;:hover { background: #0d9493; }
  }
  
  /* 초대 코드 스펙 표시 줄 */
  .code-row {
    margin: 0 20px 24px 20px; display: flex; border-radius: 6px; overflow: hidden; 
    border: 1px solid #cbd5e1;          /* 💡 초록 테두리 제거 후 시스템 슬레이트 보더 적용 */
    
    .code-label { 
      background: #64748b;              /* 💡 눈이 아픈 초록색 대신 묵직하고 신뢰감 있는 Slate 500 적용 */
      color: white; padding: 10px 14px; font-weight: 700; font-size: 12px; 
    }
    .code-val { 
      background: white; flex: 1; display: flex; align-items: center; justify-content: center; 
      font-weight: 800; color: #1e293b; font-size: 13.5px; font-family: monospace;
    }
    .copy-action { 
      background: #f1f5f9;              /* 💡 형광 민트색에서 정갈하고 매끄러운 그레이 단추로 전환 */
      color: #475569; border: none; border-left: 1px solid #cbd5e1; 
      padding: 0 12px; font-weight: 700; font-size: 12px; cursor: pointer; 
      transition: all 0.15s;
      &amp;:hover { background: #e2e8f0; color: #1e293b; }
    }
  }

  /* 현재 접속/참여 중인 팀 멤버 박스 */
  .members-box {
    padding: 0 20px; margin-bottom: 16px;
    border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; /* 💡 하단 대화창과의 시각적 층위 격리 */
    
    h5 { 
      margin: 0 0 12px 4px; font-size: 11px; 
      color: #94a3b8;                   /* 💡 라벨 색상을 Slate 400으로 차분화 */
      font-weight: 800; letter-spacing: 0.5px;
    }
    .m-item { 
      font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; 
      display: flex; align-items: center; gap: 8px; padding-left: 4px;

      /* 💡 [수정 포인트] 참여자 리스트의 프로필 아이콘 색상 설정 */
      i {
        font-size: 16px;
        color: ${palette.slate[4]};
      }
    }
  }
`;

/* ── 3. 우측 패널 하부 실시간 협업 워크 피드 (채팅 룸) ── */
const ChatTimelineFeed = styled.div`
  flex: 1; padding: 16px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;
  background: #ffffff;                  /* 💡 대화 가독성을 위해 대화창 내부 바닥은 깔끔한 하얀색으로 세팅 */
`;

/* 개별 실시간 대화 버블 */
const TalkBubble = styled.div`
  display: flex; flex-direction: column; 
  align-items: ${props => props.$isMe ? 'flex-end' : 'flex-start'};
  align-self: ${props => props.$isMe ? 'flex-end' : 'flex-start'};
  max-width: 85%;

  /* 💡 [수정 포인트] 대화방 내부 상대방 아이디 가이드라인 가로 배치 조율 */
  .user-id { 
    display: flex; align-items: center; gap: 4px;
    font-size: 11.5px; font-weight: 700; color: #64748b; margin-bottom: 6px; padding-left: 2px; 
    
    i {
      font-size: 14px;
      color: ${palette.slate[4]};
    }
  }
  .msg-row { display: flex; align-items: flex-end; gap: 6px; flex-direction: ${props => props.$isMe ? 'row-reverse' : 'row'}; }
  
  /* 실제 대화 말풍선 */
  .bubble {
    background: ${props => props.$isMe ? '#0ea5a4' : '#f1f5f9'}; /* 💡 내가 보낸 건 시그니처 민트색, 상대방은 Light Slate 그레이 */
    color: ${props => props.$isMe ? 'white' : '#1e293b'};
    padding: 10px 14px; 
    border-radius: ${props => props.$isMe ? '12px 2px 12px 12px' : '2px 12px 12px 12px'}; /* 💡 엣지 비대칭 포인트 통일 */
    font-size: 13px; font-weight: 600; line-height: 1.45; box-shadow: none;
  }
  
  /* 메시지 작성 타임스탬프 */
  .timestamp { 
    font-size: 10px; 
    color: #94a3b8;                     /* 💡 카톡 느낌 그레이 연두에서 세련된 무채색 그레이로 전환 */
    font-weight: 600; min-width: 45px; 
    text-align: ${props => props.$isMe ? 'right' : 'left'}; 
  }
`;

/* 최하단 실시간 워크 피드 인풋 필드 */
const FooterInputBox = styled.div`
  padding: 16px; display: flex; gap: 8px; background: #ffffff; 
  border-top: 1px solid #e2e8f0;        /* 💡 테두리 선 가이드 일치화 */
  
  input { 
    flex: 1; padding: 10px 14px; 
    border-radius: 8px;                 /* 💡 타원형에서 단정한 스퀘어 라운드형(8px)으로 통일 */
    border: 1px solid #cbd5e1; 
    font-size: 13px; font-weight: 600; color: #1e293b;
    outline: none;
    &amp;::placeholder { color: #94a3b8; }
    &amp;:focus { border-color: #64748b; }
  }
  
  button { 
    background: #0ea5a4;                /* 💡 전송 버튼 테마 민트색 주입 */
    color: white; border: none; padding: 0 14px; 
    border-radius: 8px;                 /* 💡 단추 모양 인풋창과 동기화 */
    font-weight: 700; font-size: 13px; cursor: pointer; 
    transition: background 0.15s;
    &amp;:hover { background: #0d9493; }
  }
`;

function ShareC({ onRestoreTrigger }) {
  const [comments, setComments] = useState([
    { id: 1, user: '김철수', text: '논문의 정확성을 비교 해주신 자료를 저한테 메일로 보내주세요.', time: '오늘 14:32', isMe: false },
    { id: 2, user: 'user14530', text: '네, 알겠습니다.', time: '오늘 14:34', isMe: true }
  ]);
  const [typedMsg, setTypedMsg] = useState('');

  const handleSendComment = () => {
    if (!typedMsg.trim()) return;
    const now = new Date();
    const timeStr = `오늘 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setComments([...comments, { id: Date.now(), user: 'user14530', text: typedMsg, time: timeStr, isMe: true }]);
    setTypedMsg('');
  };

  // 💡 기획 스펙 데이터 테이블 연동
  const timelineData = [
    { id: 1, q: "세 논문의 정확도 성능을 비교해줘", a: "논문별 주요 벤치마크 정확도를 비교하고 있습니다.\n\n[결과 분석]\n- attention_is_all_you_need.pdf: 94.2%\n- BERT_pretraining.pdf: 92.8%\n- GPT4_technical_report.pdf: 분석 중" },
    { id: 2, q: "각 논문의 실험 데이터셋은 무엇인가요?", a: "각 논문에서 명시한 핵심 실험군 데이터셋 인프라 리스트 스펙 파싱을 복원했습니다." },
    { id: 3, q: "주요 논문의 정확도 분석해줘", a: "최종 가중치 정확도 지표 추출 컨텍스트 가공 캔버스 화면입니다." }
  ];

  return (
    <Container>
      <MainTimelineContent>
        <div className="header-area">
          <i className="fa-solid fa-bars menu-toggle"></i>
          <h2>딥러닝 이미지 분류 연구 비교</h2>
        </div>
        <h3>질문 타임라인</h3>
        
        <TimelineWrapper>
          {timelineData.map((node, index) => (
            <TimelineNode key={node.id}>
              <div className={`dot ${index === 0 ? 'active' : ''}`}></div>
              {index < timelineData.length - 1 && <i className="fa-solid fa-arrow-down arrow-line"></i>}
              <div className="card">
                <h4>{node.q}</h4>
                <div className="meta">오늘 14:32 팀원 1</div>
                {/* 💡 복구 액션 실행 시 상위 라우터로 전환 트리거 가동 */}
                <button className="restore-btn" onClick={() => onRestoreTrigger(node)}>
                  <i className="fa-solid fa-turn-up"></i> 이 시점으로 복구
                </button>
              </div>
            </TimelineNode>
          ))}
        </TimelineWrapper>
      </MainTimelineContent>

      <RightCoopPanel>
        <button className="invite-btn">팀원 초대</button>
        <div className="code-row">
          <div className="code-label">초대코드</div>
          <div className="code-val">aa33ddf</div>
          <button className="copy-action" onClick={() => { navigator.clipboard.writeText('aa33ddf'); alert('코드가 복사되었습니다.'); }}>복사</button>
        </div>

        <div className="members-box">
          <h5>참여 인원</h5>
          {/* 💡 [반영 포인트] 단순 user 아이콘 대신 단정해진 circle-user 아이콘으로 교체 */}
          <div className="m-item"><i className="fa-regular fa-circle-user"></i> 홍길동(팀장)</div>
          <div className="m-item"><i className="fa-regular fa-circle-user"></i> 김철수</div>
          <div className="m-item"><i className="fa-regular fa-circle-user"></i> 박은희</div>
        </div>

        <ChatTimelineFeed>
          {comments.map(c => (
            <TalkBubble key={c.id} $isMe={c.isMe}>
              {/* 💡 [반영 포인트] 👤 이모지 제거 및 Account Circle 실루엣 아이콘 정밀 배치 */}
              {!c.isMe && (
                <div className="user-id">
                  <i className="fa-regular fa-circle-user"></i> {c.user}
                </div>
              )}
              <div className="msg-row">
                <div className="bubble">{c.text}</div>
                <div className="timestamp">{c.time}</div>
              </div>
            </TalkBubble>
          ))}
        </ChatTimelineFeed>

        <FooterInputBox>
          <input type="text" placeholder="코멘트 작성" value={typedMsg} onChange={(e)=>setTypedMsg(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSendComment()} />
          <button onClick={handleSendComment}>저장</button>
        </FooterInputBox>
      </RightCoopPanel>
    </Container>
  );
}

export default ShareC;