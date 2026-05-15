import React from 'react';
import styled from 'styled-components';
import { palette } from '../shared/palette';

const Container = styled.div`padding: 40px 40px 40px 300px;`;
const HistoryItem = styled.div`
  display: flex; justify-content: space-between; /* 양 끝 정렬 */
  align-items: center; padding: 15px 0;
  border-bottom: 1px solid ${palette.gray[2]};
`;

function Dashboard() {
  return (
    <Container>
      <h2>저장된 시각화 보관함 <small style={{fontSize:'12px', float:'right'}}>전체 보기</small></h2>
      <div style={{display:'flex', gap:'20px', marginBottom:'60px'}}>
        {['정확도 비교 차트', '데이터셋 분포', '모델 성능 비교표'].map(title => (
          <div key={title} style={{flex:1, border:`1px solid ${palette.gray[2]}`, borderRadius:'10px'}}>
            <div style={{height:100, background:palette.gray[1]}} />
            <div style={{padding:15}}>{title}</div>
          </div>
        ))}
      </div>

      <h2>최근 분석 히스토리 <small style={{fontSize:'12px', float:'right'}}>전체 보기</small></h2>
      <HistoryItem>
        <span>📄 딥러닝 이미지 분류 연구 비교</span>
        <span style={{color:palette.gray[4], fontSize:'12px'}}>2026.05.13</span>
      </HistoryItem>
      <HistoryItem>
        <span>📄 자연어처리 감정분석 최신 동향</span>
        <span style={{color:palette.gray[4], fontSize:'12px'}}>2026.04.22</span>
      </HistoryItem>
      <HistoryItem>
        <span>📄 강화학습 보상 함수 설계 논문</span>
        <span style={{color:palette.gray[4], fontSize:'12px'}}>2026.03.04</span>
      </HistoryItem>
    </Container>
  );
}
export default Dashboard;