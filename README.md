# ONDAM AI

React·Vite·Tailwind 기반 사용자 AI Store/채팅과 관리자 화면입니다.

```bash
npm install
npm run dev
```

공통 컴포넌트와 디자인 토큰의 수정 위치·사용 기준은 [디자인 시스템 가이드](docs/design-system.md), 화면·모달·테이블별 목록은 [UI 인벤토리](docs/ui-inventory.md)에 정리되어 있습니다.

```bash
npm run lint:check
npm run check:ui
npm test
npm run build
npm run audit:ui
```

브라우저 회귀 검사는 Chromium을 준비한 뒤 실행합니다.

```bash
npx playwright install chromium
npm run test:ui
```
