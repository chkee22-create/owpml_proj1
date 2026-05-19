import { palette } from './src/shared/palette'; // 💡 palette.js의 실제 위치에 맞게 경로를 꼭 확인해 주세요!

// [0]~[9] 배열을 Tailwind의 50~900 오브젝트로 자동 변환해주는 꿀함수
const transformArrayToTailwind = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return {
    50: arr[0],
    100: arr[1],
    200: arr[2],
    300: arr[3],
    400: arr[4],
    500: arr[5],
    600: arr[6],
    700: arr[7],
    800: arr[8],
    900: arr[9],
  };
};
// 1. config라는 변수에 객체를 먼저 할당하고
const config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kakao: palette.kakao,
        naver: palette.naver,
        gray: transformArrayToTailwind(palette.gray),
        slate: transformArrayToTailwind(palette.slate),
        teal: transformArrayToTailwind(palette.teal),
        google: transformArrayToTailwind(palette.google),
        red: transformArrayToTailwind(palette.red),
        pink: transformArrayToTailwind(palette.pink),
        grape: transformArrayToTailwind(palette.grape),
        violet: transformArrayToTailwind(palette.violet),
        indigo: transformArrayToTailwind(palette.indigo),
        blue: transformArrayToTailwind(palette.blue),
        cyan: transformArrayToTailwind(palette.cyan),
        green: transformArrayToTailwind(palette.green),
        lime: transformArrayToTailwind(palette.lime),
        yellow: transformArrayToTailwind(palette.yellow),
        orange: transformArrayToTailwind(palette.orange),
      },
    },
  },
  plugins: [],
};

// 2. 그 변수를 export default 해줍니다.
export default config;