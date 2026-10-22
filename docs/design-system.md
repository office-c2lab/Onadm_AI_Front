# UI와 디자인 토큰 관리

사용자 AI Store·라이브러리·등록·내 도구·채팅, 관리자 Discover·내부/외부 Control·Manage·사용자/권한·시스템, 다운로드·캐릭터 화면의 JSX/CSS를 조사하고 공통 UI와 디자인 값을 분리했습니다. 파일별 컴포넌트·테이블·모달 목록은 [UI 인벤토리](ui-inventory.md)에 있습니다.

## 수정할 위치

| 변경할 내용 | 관리 위치 | 대표 사용법 |
| --- | --- | --- |
| 브랜드·배경·본문·상태·차트 색상 | `src/styles/tokens.css` | `bg-brand`, `text-text-secondary`, `bg-canvas` |
| 글꼴·글자 크기·굵기·행간·자간 | `src/styles/tokens.css` | `font-sans`, `text-control`, `text-page-title`, `tracking-heading` |
| 그림자·고정 모서리 크기 | `src/styles/tokens.css` | `shadow-card`, `shadow-table`, `rounded-card` |
| 간격·폼 높이·반응형 모서리·페이지/모달 너비 | `src/styles/layout-tokens.css` | `gap-[var(--app-gap-md)]`, `h-[var(--app-control-lg)]` |
| 사이드바 너비·레이어·전환 시간 | `src/styles/layout-tokens.css` | `--layout-sidebar-width`, `--z-modal`, `--duration-normal` |
| UI 컴포넌트 기본 스타일 | `src/styles/components.css` | 모달·사이드바 프레임·토글 |
| Control 화면 전용 스타일 | `src/styles/control.css` | 모달 패널·스크롤바·정책 강도 슬라이더 |
| 테이블·필드·카드 공통 클래스 | `src/styles/table.js`, `fields.js`, `surfaces.js` | `tableCellClass()`, `inputClass`, `cardClass` |
| 캐릭터 효과 색상 | `src/styles/artwork-tokens.css` | `--artwork-effect-*` |
| Three.js 셰이더 팔레트 | `src/styles/artworkTokens.js` | `ORB_THEMES.light`, `ORB_THEMES.dark` |

스타일 진입점은 `src/index.css`입니다. 특정 페이지를 먼저 열어야 CSS 변수가 생기던 구조를 없애고 전역 토큰을 한 번 로드합니다. Tailwind v4의 CSS `@theme static`을 사용하므로 실제 토큰은 `tailwind.config.js`가 아닌 `tokens.css`에서 수정합니다. `static`은 JS/SVG/Recharts에서만 참조하는 토큰도 빌드에 포함하기 위해 필요합니다.

폰트 스택은 `--font-sans`에서 관리합니다. 페이지네이션은 `--font-pagination`을 사용합니다. 폰트 파일이 설치되지 않은 환경에서는 스택의 다음 글꼴을 사용합니다. 기본 Tailwind 간격·크기 토큰도 계속 사용할 수 있습니다.

## 토큰 추가와 변경 기준

기존 `brand`, `canvas`, `text-primary`, `text-secondary`, `focus-border`, `border-subtle`, `selection` 같은 용도 토큰을 먼저 사용합니다. 차트의 CSS/SVG 색상도 `var(--color-chart-blue)`처럼 같은 토큰을 참조합니다. JSX에 HEX·RGB 값이나 `text-[13px]` 같은 크기를 추가하지 않습니다.

`palette-*`, `text-fluid-*`, `shadow-detail-*` 등은 기존 화면의 세부 값을 보존하기 위한 토큰입니다. 이번 정리에서는 서로 다른 색상을 임의로 같은 값으로 합치지 않았습니다. 새 공통 UI에는 용도 토큰을 우선 사용하고, 세부 색상 통합이 필요하면 팔레트의 사용처를 확인한 뒤 시각 변경으로 검토합니다. 팔레트 번호는 식별자이므로 새 색상을 넣을 때 기존 번호를 다시 매기지 않습니다.

Three.js는 CSS 변수 문자열을 색상으로 해석하지 않으므로 셰이더 색상은 별도 JS 팔레트로 관리합니다. SVG/PNG 로고 원본의 내부 색상은 이미지 자산으로 관리합니다. 캐릭터의 정적인 CSS는 `src/components/character/character.css`로 분리하여 인스턴스마다 `<style>` 태그를 만들지 않습니다.

## 공통 컴포넌트

| 영역 | 컴포넌트 | 적용 내용 |
| --- | --- | --- |
| 버튼 | `components/ui/Button.jsx` | primary·secondary·danger, disabled, 공통 토큰 |
| 검색 | `SearchField.jsx`, `ValueSearchField.jsx`, `components/search/SearchHeader.jsx` | outline·filled 스타일, 아이콘, 접근성 이름 |
| 토글 | `Toggle.jsx` | 반응형·고정 크기, switch 상태, 접근성 이름, disabled |
| 테이블 | `DataTable.jsx`, `styles/table.js` | 헤더·열 너비·스크롤·행/셀 스타일 공유; 모델·프롬프트·요청 이력·크레딧 내역 적용 |
| 상태/빈 화면/카드 | `Badge.jsx`, `StatusBadge.jsx`, `EmptyState.jsx`, `SectionCard.jsx` 등 | 상태 표시·카드 표면의 공통 관리 |
| 기본 모달 | `Modal.jsx`, `Drawer.jsx` | 헤더·설명·닫기·본문·푸터 공유; 사용자 도구 모달도 같은 셸 사용 |
| 개별 구조의 모달 | `DialogLayer.jsx` | Discover·Control·사용자 관리·배포 설정 등 기존 내용을 유지하고 모달 수명주기를 공유 |
| 페이지네이션 | `components/pagination/GlassPagination.jsx`, `FixedPaginationBar.jsx` | 중복 구현/CSS 제거, 범위 보정, 인스턴스별 SVG 필터 ID |
| 페이지/내비게이션 | `components/layout/PageLayout.jsx`, `SidebarFrame.jsx`, `ui/RouteTabs.jsx` | 공통 콘텐츠 너비·간격, 사이드바 프레임, 라이브러리·Control 라우트 탭 |
| 서비스/도구 시각 요소 | `components/identity/*`, `components/tools/*`, `ui/ToolAvatar.jsx` | 로고 조회·도구 아이콘·스토어 미리보기를 관리자/사용자 페이지에서 공유 |
| 상태 훅 | `hooks/usePersistentSidebar.js`, `useDraftState.js`, `useEntryAnimation.js` | 사이드바 저장, 원본 변경 시 편집 초안 초기화, 차트 진입 애니메이션 |

`SearchField`의 `onChange`는 React 이벤트를 받습니다. 기존 값 기반 API가 필요한 화면은 `ValueSearchField`를 사용하며, 이 컴포넌트는 `onChange(value)`로 전달합니다. 두 컴포넌트의 입력·아이콘·스타일 구현은 하나입니다. `Toggle`과 `SearchField`는 `ariaLabel`과 표준 `aria-label` 속성을 모두 지원합니다.

모달은 `DialogLayer`가 `document.body`에 포털로 표시하므로 페이지의 stacking context나 사이드바에 가려지지 않습니다. 원래 위치의 글꼴·글자 크기·텍스트 색상·`--app-*` 변수를 전달하고 화면 크기 변경 시 갱신합니다. Escape, Tab/Shift+Tab 순환, 포커스 복원, 중첩 모달, 전체 모달이 닫혔을 때의 스크롤 복원을 공통 처리합니다. 기본 모달은 `Modal`, 특별한 레이아웃이 필요한 경우에는 `DialogLayer` 안에 접근성 이름이 있는 `role="dialog"` 패널을 구성합니다.

```jsx
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';

<Modal
  title="도구 수정"
  description="도구의 기본 정보를 변경합니다."
  onClose={onClose}
  bodyClassName="min-h-0 flex-1 overflow-y-auto p-6"
  footer={<Button onClick={onSave}>저장</Button>}
>
  {fields}
</Modal>
```

`DataTable`은 행 데이터의 정렬·검색·선택·수정을 소유하지 않습니다. 열 헤더와 너비를 넘기고 기능별 행을 children으로 전달합니다. 모니터링의 확장 행, 드래그 가능한 부서 설정, 복합 차트/표, 정책 상세처럼 구조가 다른 영역은 해당 기능에 남기고 공통 `table*` 스타일을 공유합니다. 새 테이블에 검색·선택 등 기능을 넣을 때는 실제 요구에 맞는 영역을 조합합니다.

## 조사에서 확인한 경계

- 내부·외부 Control과 사용자 관리가 특정 외부 Control 폴더의 버튼·레이아웃·테이블 스타일에 의존하던 구조를 공통 폴더로 변경했습니다.
- 관리자와 사용자 도구 모달의 중복 셸, 페이지네이션 두 벌, 세 가지 사이드바 상태 저장, 라우트 탭, 정책 토글, 도구 아바타의 중복 구현을 통합했습니다.
- 폼 단계·도구 등록 검토 흐름·모니터링 확장 패널·서비스별 차트 데이터처럼 동작이 다른 내용은 기능 컴포넌트로 유지했습니다.
- 관리자 대시보드·역할·시스템 운영 등 일부 페이지는 기존에 제목만 있는 자리표시자입니다. 인벤토리에 포함했고 기존 범위에서 토큰을 적용했습니다.
- 페이지별 mock 데이터/쿼리, 라우팅의 권한 제어와 API 연동은 별도 기능 영역입니다. 공통 UI는 이를 가져오거나 변경하지 않습니다.

## 검증과 관리 명령

```bash
npm run lint:check # 자동 수정 없이 전체 ESLint 검사
npm run check:ui   # 직접 지정한 색상/글자 크기, 공통 UI의 페이지 의존, 모달 계층 검사
npm test           # 페이지네이션 범위/입력 경계 검사
npm run build      # 프로덕션 빌드
npm run audit:ui   # docs/ui-inventory.md 재생성
npm run test:ui    # Chromium으로 화면·모달·토큰·사이드바·모바일 회귀 검사
```

브라우저를 처음 준비하는 환경에서는 `npx playwright install chromium`을 실행합니다. Linux에서는 Chromium 실행용 시스템 라이브러리도 필요합니다. `test:ui`는 기본적으로 임시 Vite 서버를 직접 열고 검사가 끝나면 서버와 브라우저를 닫습니다. 이미 실행 중인 서버는 `UI_TEST_BASE_URL=http://127.0.0.1:5173 npm run test:ui`로 사용할 수 있습니다. mock 데이터 변경 검사는 테스트 브라우저 메모리에서 실행됩니다.

`check:ui`는 빠른 정적 규칙 검사입니다. 컴포넌트의 실제 동작과 화면 크기는 `test:ui`로 확인합니다. 빌드에는 기존의 큰 JS 청크 경고가 있으며, 페이지별 코드 분할은 이 UI 정리와 별도 최적화 항목입니다.
