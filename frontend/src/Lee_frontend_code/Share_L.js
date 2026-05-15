import React from 'react';
import styled from 'styled-components';
import { palette } from '../shared/palette';

/** 1. 전체 레이아웃 (왼쪽 타임라인 | 오른쪽 팀원/채팅) */
const Container = styled.div`
  display: flex;
  gap: 30px;
  padding: 40px;
  background-color: white;
  min-height: 100vh;
`;

/** 2. 왼쪽 타임라인 영역 */
const TimelineSection = styled.div`
  flex: 2;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 40px;
`;

const TimelineContainer = styled.div`
  border-left: 2px solid ${palette.gray[3]};
  margin-left: 30px;
  padding-left: 40px;
  position: relative;
`;

const TimelineItem = styled.div`
  position: relative;
  margin-bottom: 50px;
  font-size: 18px;
  font-weight: 500;

  /* 타임라인 위의 동그라미 */
  &::before {
    content: '';
    position: absolute;
    left: -51px; /* 선 위치에 맞춤 */
    top: 5px;
    width: 20px;
    height: 20px;
    background: ${props => props.active ? palette.green[4] : palette.gray[4]};
    border-radius: 50%;
    z-index: 1;
  }
`;

const RestoreBadge = styled.div`
  font-size: 12px;
  color: ${palette.green[6]};
  margin-top: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  &:hover { text-decoration: underline; }
`;

/** 3. 오른쪽 사이드 영역 (팀원 & 채팅) */
const RightSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TeamCard = styled.div`
  background-color: ${palette.green[0]};
  padding: 25px;
  border-radius: 20px;
`;

const InviteButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${palette.blue[4]};
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  margin-bottom: 20px;
  cursor: pointer;
`;

const ChatBubble = styled.div`
  background-color: ${props => props.isMe ? palette.blue[1] : 'white'};
  padding: 12px 15px;
  border-radius: 15px;
  font-size: 14px;
  margin-top: 10px;
  border: 1px solid ${palette.gray[2]};
  align-self: ${props => props.isMe ? 'flex-end' : 'flex-start'};
`;

function SharePage() {
  return (
    <Container>
      {/* 타임라인 영역 */}
      <TimelineSection>
        <Title>딥러닝 이미지 분류 연구 비교</Title>
        <h4 style={{marginBottom: '20px'}}>질문 타임라인</h4>
        <TimelineContainer>
          <TimelineItem active>
            세 논문의 정확도 성능을 비교해줘
            <div style={{fontSize: '12px', color: palette.gray[4], marginTop: '5px'}}>오늘 14:32 팀원 1</div>
            <RestoreBadge>↩ 이 시점으로 복구</RestoreBadge>
          </TimelineItem>

          <TimelineItem>
            각 논문의 실험 데이터셋은 무엇인가요?
            <div style={{fontSize: '12px', color: palette.gray[4], marginTop: '5px'}}>오늘 14:32 팀원 1</div>
            <RestoreBadge>↩ 이 시점으로 복구</RestoreBadge>
          </TimelineItem>
        </TimelineContainer>
      </TimelineSection>

      {/* 오른쪽 정보 영역 */}
      <RightSide>
        <TeamCard>
          <InviteButton>팀원 초대</InviteButton>
          <div style={{display: 'flex', justifyContent: 'space-between', background: palette.green[3], padding: '10px', borderRadius: '10px', marginBottom: '20px'}}>
             <span>초대코드</span>
             <span style={{fontWeight: 'bold'}}>복사</span>
          </div>
          
          <h4 style={{marginBottom: '15px'}}>참여 인원</h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px'}}>
            <span>👤 홍길동(팀장)</span>
            <span>👤 김철수</span>
            <span>👤 박은희</span>
          </div>
        </TeamCard>

        <div style={{padding: '10px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
            <div style={{width: '30px', height: '30px', borderRadius: '50%', background: '#ccc'}} />
            <strong>김철수</strong>
          </div>
          <ChatBubble>논문의 정확성을 비교 해주신 자료를 저한테 메일로 보내주세요.</ChatBubble>
          <ChatBubble isMe>네, 알겠습니다.</ChatBubble>
        </div>
      </RightSide>
    </Container>
  );
}

export default SharePage;