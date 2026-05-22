import axios from 'axios';

// 백엔드 주소를 직접 지정하거나, 환경변수가 있다면 그것을 사용하도록 수정
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

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

export const projectAPI = {
  list: () => apiClient.get('/api/projects'),
  sync: (projects) => apiClient.put('/api/projects/sync', { projects }),
  save: (project) => apiClient.post('/api/projects', { project }),
  delete: (projectId) => apiClient.delete(`/api/projects/${encodeURIComponent(projectId)}`),
  findByInviteCode: (inviteCode) => apiClient.get(`/api/projects/invite/${encodeURIComponent(inviteCode)}`),
};

export default apiClient;