import React from 'react';
import styled from 'styled-components';
import { palette } from '../shared/palette';

const InviteBox = styled.div`
  background: ${palette.gray[1]};
  padding: 20px;
  border-radius: 12px;
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
`;

function ProjectPage() {
  return (
    <div style={{ paddingLeft: '280px', padding: '40px' }}>
      <h2>내 프로젝트</h2>
      <InviteBox>
        <span>초대 코드로 팀 프로젝트 참여 :</span>
        <input value="aa33ddf" readOnly />
        <button>참여하기</button>
      </InviteBox>
      {/* 여기에 프로젝트 카드들을 배치 */}
    </div>
  );
}

export default ProjectPage;