import React, { useState } from 'react';
import { ModalOverlay, ModalContent } from '../pages/styles/Modal.styles';

const ProfileEditModal = ({ onClose }) => {
  const [nickname, setNickname] = useState("user14530");
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <h3>프로필 수정</h3>
        <input type="file" onChange={handleFileChange} />
        {preview && <img src={preview} alt="preview" style={{width: '80px', borderRadius: '50%'}} />}
        
        <input 
          value={nickname} 
          onChange={(e) => setNickname(e.target.value)} 
          placeholder="닉네임 입력" 
        />
        
        <div className="btn-group">
          <button onClick={onClose}>취소</button>
          <button onClick={() => alert("저장되었습니다!")}>저장</button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProfileEditModal;