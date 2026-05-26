// 초보자 안내: 프론트엔드에서 백엔드 API를 호출할 때 공통으로 사용하는 axios 설정 파일입니다.

import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (typeof window !== 'undefined' && ['3000', '3001'].includes(window.location.port)) {
    return `http://${window.location.hostname}:8000`;
  }

  return '';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 401 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const authAPI = {
  // 회원가입
  signup: (username, password) =>
    apiClient.post('/api/auth/signup', { username, password }),

  // 로그인
  login: (username, password) =>
    apiClient.post('/api/auth/login', { username, password }),

  // 헬스 체크
  healthCheck: () => apiClient.get('/api/health'),

  updateProfile: (username) =>
    apiClient.patch('/api/auth/profile', { username }),

  changePassword: (currentPassword, newPassword) =>
    apiClient.patch('/api/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  deleteAccount: () => apiClient.delete('/api/auth/account'),
};

export const analysisAPI = {
  chat: (question, files, options = {}) => {
    const formData = new FormData();
    formData.append('question', question);
    formData.append('llm_provider', options.provider || 'openai');
    if (options.openaiApiKey) formData.append('openai_api_key', options.openaiApiKey);
    if (options.googleApiKey) formData.append('google_api_key', options.googleApiKey);
    files.forEach((file) => formData.append('files', file));

    return apiClient.post('/api/analysis/chat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  createVisual: (type, files, analysisText = '') => {
    const formData = new FormData();
    formData.append('analysis_text', analysisText);
    files.forEach((file) => formData.append('files', file));

    return apiClient.post(`/api/visuals/${encodeURIComponent(type)}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// 프로젝트 MongoDB 저장 API
// 지금 화면은 아직 localStorage를 많이 쓰지만, 이 함수들을 통해 같은 데이터를
// FastAPI + MongoDB에 저장하고 다시 불러오는 쪽으로 단계적으로 옮길 수 있습니다.
export const projectAPI = {
  list: () => apiClient.get('/api/projects'),
  sync: (projects) => apiClient.put('/api/projects/sync', { projects }),
  save: (project) => apiClient.post('/api/projects', { project }),
  delete: (projectId) => apiClient.delete(`/api/projects/${encodeURIComponent(projectId)}`),
  findByInviteCode: (inviteCode) => apiClient.get(`/api/projects/invite/${encodeURIComponent(inviteCode)}`),
};

export default apiClient;
