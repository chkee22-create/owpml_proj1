import React from 'react';
import styled from 'styled-components';

const ModalContainer = styled.div`
  width: 400px; background: white; border-radius: 20px; padding: 30px;
  display: flex; flex-direction: column; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
`;

const IconWrapper = styled.div` font-size: 50px; color: #0ea5a4; margin-bottom: 10px; `;

const GridBox = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; margin: 20px 0;
`;

const StatItem = styled.div`
  border: 1px solid #e2e8f0; padding: 10px; border-radius: 10px; text-align: center;
`;

export const ProfileModal = ({ onClose }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <ModalContainer>
      <IconWrapper><i className="fa-solid fa-robot"></i></IconWrapper>
      <h3>user14530</h3>
      <button style={{ width: '100%', padding: '10px', background: '#0ea5a4', color: 'white', borderRadius: '8px', border: 'none', margin: '5px 0' }}>Profile Edit</button>
      <button style={{ width: '100%', padding: '10px', background: '#0ea5a4', color: 'white', borderRadius: '8px', border: 'none' }}>Change Password</button>
      
      <GridBox>
        <StatItem>0 Projects</StatItem>
        <StatItem>0 Analysis Questions</StatItem>
        <StatItem>0 Resources</StatItem>
        <StatItem>0 Participating Teams</StatItem>
      </GridBox>
      
      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
        <button style={{ flex: 1, padding: '10px' }}>Logout</button>
        <button style={{ flex: 1, padding: '10px', color: 'red' }}>Delete Account</button>
      </div>
    </ModalContainer>
  </div>
);