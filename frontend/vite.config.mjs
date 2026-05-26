// 초보자 안내: Vite 개발 서버와 빌드 옵션을 정하는 프론트엔드 설정 파일입니다.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        // TypeScript 변경 표시: Vite의 React 빌드 과정에 React Compiler를 연결합니다.
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
