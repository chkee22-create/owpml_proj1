import React, { useState } from 'react';

function MyLogin() {
  // 1. Counter의 [number, setNumber] 대신 아이디, 비밀번호 상자를 만듭니다.
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  // 2. 4장의 이벤트 핸들링: 인풋에 글자가 바뀔 때 실행할 함수들
  const handleIdChange = (e) => {
    // e.target.value는 현재 인풋창에 입력된 실제 글자를 뜻합니다.
    setId(e.target.value); 
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // 3. 로그인 버튼을 눌렀을 때 실행할 함수
  const handleLoginSubmit = () => {
    if (id === '' || password === '') {
      alert('아이디와 비밀번호를 모두 입력해 주세요!');
      return;
    }
    // 콘솔창(F12)에 내가 입력한 값이 잘 들어왔나 확인해 봅니다.
    console.log('로그인 시도 아이디:', id);
    console.log('로그인 시도 비밀번호:', password);
    alert(`로그인 환영합니다! ID: ${id}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '300px', margin: '0 auto' }}>
      <h2>나만의 로그인 페이지</h2>
      
      {/* 아이디 입력창 */}
      <div style={{ marginBottom: '10px' }}>
        <label>ID : </label>
        <input 
          type="text" 
          placeholder="아이디를 입력하세요" 
          value={id}               // 상자(State)와 인풋을 연결
          onChange={handleIdChange} // 글자가 바뀔 때마다 함수 실행
        />
      </div>

      {/* 비밀번호 입력창 */}
      <div style={{ marginBottom: '15px' }}>
        <label>PW : </label>
        <input 
          type="password" 
          placeholder="비밀번호를 입력하세요" 
          value={password} 
          onChange={handlePasswordChange}
        />
      </div>

      {/* 로그인 버튼 */}
      <button onClick={handleLoginSubmit}>Login</button>
    </div>
  );
}

export default MyLogin;
