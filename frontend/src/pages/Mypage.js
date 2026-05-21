import React, { useState, useEffect } from 'react'; // 1. useState, useEffect 임포트 추가
import { MypageWrapper, ProfileCard } from './styles/Mypage.styles';

function Mypage({ username, onLogoutClick }) {
  // 2. data 상태 정의 (초기값 설정)
  const [data, setData] = useState({
    projects: [],
    analysisQuestions: [],
    resources: [],
    teams: []
  });

  const handleWithdraw = () => {
    if (window.confirm("정말로 탈퇴하시겠습니까?")) {
      if (window.confirm("여태까지 작업했던 프로젝트들과 채팅 내역들이 모두 사라집니다. 그래도 삭제하시겠습니까?")) {
        console.log("최종 탈퇴 처리");
        onLogoutClick();
      }
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      // 나중에 실제 API로 교체될 부분
      setData({
        projects: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        analysisQuestions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        resources: [1, 2, 3, 4, 5],
        teams: [1, 2]
      });
    };
    fetchStats();
  }, []);

  return (
    <MypageWrapper>
      <ProfileCard>
        <div className="avatar"><i className="fa-solid fa-user"></i></div>
        <div className="username">{username}</div>
        
        <button className="btn-full">프로필 수정</button>
        <button className="btn-full">비밀번호 변경</button>

        <div className="stats-grid">
          <div className="stat-item"><div className="val">{data.projects.length}</div><div className="lbl">프로젝트</div></div>
          <div className="stat-item"><div className="val">{data.analysisQuestions.length}</div><div className="lbl">분석 질문</div></div>
          <div className="stat-item"><div className="val">{data.resources.length}</div><div className="lbl">자료</div></div>
          <div className="stat-item"><div className="val">{data.teams.length}</div><div className="lbl">참여 팀</div></div>
        </div>

        <div className="bottom-btns">
          <button className="logout" onClick={onLogoutClick}>로그아웃</button>
          <button className="withdraw" onClick={handleWithdraw}>회원탈퇴</button>
        </div>
      </ProfileCard>
    </MypageWrapper>
  );
}

export default Mypage;