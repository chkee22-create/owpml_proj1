import React from 'react';
import styled from 'styled-components';

const GridSection = styled.section`
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: 20px;                            /* 💡 기획안의 여백 밸런스에 맞춰 16px에서 20px로 조정 (숨통 트기) */
  max-width: 800px;                     /* 💡 검색바 폭(800px)과 칼같이 가로 라인을 맞추기 위해 840px -> 800px 축소 */
  width: 100%;
  margin: 0 auto 40px auto;             /* 💡 하단 파일 태그 및 검색바와의 세로 간격(40px)을 미리 확보 */
  box-sizing: border-box;
`;

const FeatureCard = styled.div`
  background: white; 
  border: 1px solid #e2e8f0; 
  border-radius: 16px;                  /* 💡 라운드 값 16px 유지 (메인 인풋창과 패밀리 룩 형성) */
  padding: 24px;                        /* 💡 카드 내부 요소들이 갇혀 보이지 않도록 상하좌우 24px로 넉넉하게 확장 */
  display: flex; 
  align-items: flex-start;              /* 💡 아이콘과 제목이 첫 줄부터 깔끔하게 정렬되도록 탑 정렬 유지 */
  gap: 16px;
  box-shadow: none;                     /* 💡 플랫하고 세련된 기획안 느낌을 내기 위해 기본 그림자는 제거 */
  text-align: left;
  box-sizing: border-box;
  cursor: pointer;                      /* 💡 클릭 가능한 카드임을 알리는 포인터 추가 */
  transition: all 0.2s ease-in-out;     /* 💡 마우스 올렸을 때 애니메이션을 자연스럽게 연결 */

  /* 🎨 마우스 오버(Hover) 시 피그마 프로토타입 감성 인터랙션 추가 */
  &:hover {
    transform: translateY(-2px);        /* 💡 위로 2픽셀 살짝 떠오르는 효과 */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); /* 💡 부드러운 은은한 그림자 생성 */
    border-color: #cbd5e1;              /* 💡 테두리를 살짝 더 선명하게 강조 */
  }

  /* 🎨 카드 좌측 아이콘 주머니 */
  .icon-wrap { 
    font-size: 20px; 
    color: #0ea5a4;                     /* 💡 서비스 아이덴티티 민트/틸 컬러 */
    background: #e6f4f4;                /* 💡 아이콘 배경을 너무 눈부시지 않고 산뜻한 파스텔 민트 톤으로 미세 조정 */
    width: 44px; height: 44px; 
    display: flex; align-items: center; justify-content: center; 
    border-radius: 12px;                /* 💡 둥글기 값을 카드와 매칭되게 조율 */
    flex-shrink: 0;                     /* 💡 본문이 길어져도 아이콘 박스가 찌그러지지 않도록 방어 */
  }

  /* 🎨 카드 제목 (문서 분석 요약, 다중문서 비교 등) */
  h3 { 
    font-size: 15px; 
    font-weight: 700; 
    color: #1e293b;                     /* 💡 가독성을 위해 더 깊고 선명한 Slate 800 계열로 변경 */
    margin: 0 0 6px 0;                  /* 💡 하단 설명글과의 간격을 6px로 미세 조정 */
  }

  /* 🎨 카드 본문 설명 글씨 */
  p { 
    font-size: 12.5px;                  /* 💡 기획서 특유의 조밀하고 밀도 높은 텍스트 느낌을 위해 12.5px 디자인 스펙 적용 */
    color: #64748b;                     /* 💡 서브 텍스트용 차분한 Slate 500 계열 매칭 */
    margin: 0; 
    line-height: 1.5; 
  }
`;

function FeatureGrid() {
  return (
    <GridSection>
      <FeatureCard>
        <div className="icon-wrap"><i className="fa-solid fa-file-invoice"></i></div>
        <div>
          <h3>문서 분석 · 요약</h3>
          <p>HWP, HWPX, PDF 문서의 핵심 내용을 추출하고 요약합니다.</p>
        </div>
      </FeatureCard>
      
      <FeatureCard>
        <div className="icon-wrap"><i className="fa-solid fa-copy"></i></div>
        <div>
          <h3>다중문서 비교</h3>
          <p>여러 문서를 비교하고 차이점을 시각화합니다.</p>
        </div>
      </FeatureCard>
      
      <FeatureCard>
        <div className="icon-wrap"><i className="fa-solid fa-chart-bar"></i></div>
        <div>
          <h3>데이터 시각화</h3>
          <p>문서 내 데이터를 차트, 그래프로 변환합니다.</p>
        </div>
      </FeatureCard>
      
      <FeatureCard>
        <div className="icon-wrap"><i className="fa-solid fa-user-group"></i></div>
        <div>
          <h3>협업공간</h3>
          <p>초대 코드로 팀원을 초대하고, 분석 결과를 함께 검토합니다.</p>
        </div>
      </FeatureCard>
    </GridSection>
  );
}

export default FeatureGrid;