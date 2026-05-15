import React from 'react';
import styled from 'styled-components';
import { palette } from '../shared/palette';

const ChatInput = styled.div`
  border: 2px solid ${palette.gray[8]};
  border-radius: 15px;
  padding: 10px 20px;
  display: flex;
  position: fixed;
  bottom: 30px;
  width: 600px;
`;

function QAPage() {
  return (
    <div style={{ paddingLeft: '280px', padding: '40px' }}>
      <h2>AI 분석 Q&A</h2>
      <div style={{ border: '2px dashed #ccc', padding: '40px', textAlign: 'center', marginBottom: '20px' }}>
        Drag & Drop (HWP, PDF 지원)
      </div>
      {/* 채팅 메시지 영역 */}
      <ChatInput>
        <input style={{ flex: 1, border: 'none', outline: 'none' }} placeholder="질문을 입력하세요" />
        <button style={{ border: 'none', background: 'none' }}>➡️</button>
      </ChatInput>
    </div>
  );
}

export default QAPage;