import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;                            /* 💡 컴포넌트 간 여백을 20px에서 24px로 넓혀 대시보드의 시원한 개방감 확보 */
  max-width: 800px;                     /* 💡 메인 그리드 및 검색바 폭(800px)과 라인을 칼같이 맞춰 일체감 형성 */
  width: 100%;
  margin: 0 auto;
  text-align: left;
`;

/* 🎨 1. 상단 3열 통계 카드 행 */
const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;                            /* 💡 카드 간의 여백 20px 유지 (그리드 세션과 패밀리 룩) */
`;

/* 🎨 2. 개별 통계 요약 카드 (총 분석 건수, 이번 달 질문 수 등) */
const StatCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;                        /* 💡 내부 여백을 20px에서 24px로 확장하여 숫자가 답답해 보이지 않게 조율 */
  box-shadow: none;                     /* 💡 피그마의 미니멀 톤에 맞춰 기본 그림자 제거 (혹은 은은하게 유지) */
  transition: all 0.15s ease-in-out;

  &:hover {
    border-color: #cbd5e1;              /* 💡 마우스 올렸을 때 테두리가 살짝 짙어지며 정돈된 피드백 유도 */
  }
  
  /* 카드의 작은 상단 소제목 라벨 */
  .label { 
    font-size: 12.5px;                  /* 💡 조금 더 오밀조밀한 텍스트 규격으로 보정 */
    font-weight: 700;                   /* 💡 라벨 서체 굵기 상향 */
    color: #94a3b8;                     /* 💡 부드러운 Slate 400 계열로 색상 통일 */
    margin-bottom: 8px; 
  }
  
  /* 가장 눈에 띄어야 하는 핵심 수치 데이터 (예: 42건) */
  .value { 
    font-size: 28px;                    /* 💡 가독성을 위해 크기를 24px에서 28px로 과감하게 상향 */
    font-weight: 800;                   /* 💡 서체를 아주 두껍게 세팅하여 데이터 정보성 극대화 */
    color: #1e293b;                     /* 💡 텍스트 색상을 더 깊고 명확한 Slate 800으로 변경 */
    line-height: 1.2;
  }
  
  /* 전주 대비/전월 대비 상승세 표시 트렌드 문구 */
  .trend { 
    font-size: 12px; 
    color: #0ea5a4;                     /* 💡 상승 곡선은 메인 테마 틸/민트 컬러 유지 */
    margin-top: 6px; 
    font-weight: 700;                   /* 💡 서체를 더 두껍게 하여 플러스 지표 강조 */
  }
`;

/* 🎨 3. 하단 데이터 시각화 차트 영역 */
const ChartPlaceholder = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px 24px;                   /* 💡 상하 패딩을 넓혀 차트가 들어설 공간을 쾌적하게 레이아웃 */
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #64748b;
  min-height: 200px;                    /* 💡 차트 가시성을 높이기 위해 최소 높이를 16px에서 200px로 확장 */
  
  /* 가상 막대그래프 하우징 */
  .mock-chart {
    width: 100%; 
    height: 120px;                      /* 💡 차트 막대 높이 한계선을 조금 더 높여 역동성 부여 */
    display: flex; 
    align-items: flex-end;              /* 💡 막대그래프가 바닥에서부터 차오르도록 아래 정렬 유지 */
    gap: 24px; 
    justify-content: center;
    border-bottom: 2px solid #e2e8f0;   /* 💡 차트 바닥면을 가로지르는 깔끔한 X축 기준선 추가 */
    padding-bottom: 4px;
  }
  
  /* 개별 막대(Bar) 디자인 */
  .bar {
    width: 44px;                        /* 💡 막대 가로폭을 40px에서 44px로 살짝 도톰하게 변경 */
    background: #e6f4f4;                /* 💡 메인 홈의 아이콘 주머니와 일치하는 투명하고 산뜻한 파스텔 민트색 */
    border-radius: 6px 6px 0 0; 
    transition: all 0.2s ease-in-out;
    display: flex; align-items: center; justify-content: center; 
    font-size: 11px; 
    color: #0ea5a4; 
    font-weight: 800;                   /* 💡 막대 위 수치 두께 선명화 */
    cursor: pointer;

    /* 마우스 올렸을 때 차트가 꽉 차오르는 묵직한 인터랙션 효과 */
    &:hover { 
      background: #0ea5a4;              /* 💡 호버 시 메인 브랜드 민트색으로 풀 드레스업 */
      color: white; 
      transform: scaleY(1.03);          /* 💡 호버한 막대만 수직으로 살짝 탱글하게 튕기는 애니메이션 추가 */
      transform-origin: bottom;         /* 💡 튕기는 축을 바닥으로 고정하여 정렬 유지 */
    }
  }
`;

function DashbordC() {
  return (
    <PageContainer>
      <h3 style={{ fontSize: '20px', fontTitle: '700', color: '#2d3748', margin: 0 }}>종합 대시보드</h3>
      
      <StatRow>
        <StatCard>
          <div className="label">분석된 총 논문 수</div>
          <div className="value">42개 문서</div>
          <div className="trend"><i className="fa-solid fa-arrow-trend-up"></i> 이번 주 +5개</div>
        </StatCard>
        <StatCard>
          <div className="label">팀 프로젝트 공간</div>
          <div className="value">3개 공간</div>
          <div className="trend" style={{ color: '#3182ce' }}>공유 멤버 총 8명</div>
        </StatCard>
        <StatCard>
          <div className="label">AI 질문 호출 수</div>
          <div className="value">1,284회</div>
          <div className="trend"><i className="fa-solid fa-arrow-trend-up"></i> 전일 대비 12% 상승</div>
        </StatCard>
      </StatRow>

      <ChartPlaceholder>
        <div style={{ alignSelf: 'flex-start', color: '#2d3748', fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>문서 유형별 업로드 비율</div>
        <div className="mock-chart">
          <div className="bar" style={{ height: '80%' }}>PDF</div>
          <div className="bar" style={{ height: '60%' }}>HWPX</div>
          <div className="bar" style={{ height: '35%' }}>HWP</div>
          <div className="bar" style={{ height: '20%' }}>TXT</div>
        </div>
      </ChartPlaceholder>
    </PageContainer>
  );
}

export default DashbordC;