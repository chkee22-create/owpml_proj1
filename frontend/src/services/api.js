import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

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
      localStorage.removeItem('userId');
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

  updateProfile: (username) =>
    apiClient.patch('/api/auth/profile', { username }),

  changePassword: (currentPassword, newPassword) =>
    apiClient.patch('/api/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  deleteAccount: () => apiClient.delete('/api/auth/account'),

  // 헬스 체크
  healthCheck: () => apiClient.get('/api/health'),
};

export const analysisAPI = {
  chat: (question, files, openaiApiKey = '') => {
    const formData = new FormData();
    formData.append('question', question);
    if (openaiApiKey) formData.append('openai_api_key', openaiApiKey);
    files.forEach((file) => formData.append('files', file));

    return apiClient.post('/api/analysis/chat', formData, {
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
