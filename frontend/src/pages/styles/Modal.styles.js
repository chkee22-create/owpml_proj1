import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white; padding: 32px; border-radius: 12px;
  width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  h3 { margin-bottom: 20px; color: #1e293b; }
  input { width: 100%; padding: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 6px; }
`;

export const ButtonGroup = styled.div`
  display: flex; gap: 10px; justify-content: flex-end;
  button { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; }
  .save { background: #0ea5a4; color: white; }
  .cancel { background: #f1f5f9; color: #475569; }
`;