import { useMemo, useState } from 'react';
import {
  Blocks,
  CalendarClock,
  ChevronRight,
  Compass,
  Ellipsis,
  Folder,
  LibraryBig,
  PanelLeft,
  Search,
  SquarePen,
  X,
} from 'lucide-react';
import UserAccountMenu from '../UserAccountMenu.jsx';
import UserServiceSwitcher from '../UserServiceSwitcher.jsx';

const primaryItems = [
  { id: 'schedule', label: '예약', icon: CalendarClock },
  { id: 'library', label: '라이브러리', icon: LibraryBig },
  { id: 'plugins', label: '플러그인', icon: Blocks },
  { id: 'explore', label: '탐색', icon: Compass },
];

const defaultProjects = [
  { id: 'brand-renewal', title: '브랜드 리뉴얼' },
  { id: 'product-planning', title: '신규 서비스 기획' },
];

const defaultChats = [
  { id: 'admin-sidebar', title: '관리자 사이드바 변경' },
  { id: 'blue-version', title: '파란색 버전 제작' },
  { id: 'folder-recommendation', title: '폴더명 추천' },
  { id: 'routing-404', title: 'Vercel 라우팅 404 해결' },
  { id: 'code-structure', title: '코드 구조 설명' },
  { id: 'screen-layout', title: '온담 화면 구성 정리' },
  { id: 'brand-strategy', title: '브랜드 전략 정리' },
  { id: 'site-analysis', title: '사이트 분석 request' },
  { id: 'character-names', title: 'AI 캐릭터 명칭 비교' },
  { id: 'text-extraction', title: '텍스트 추출 코드 작성' },
  { id: 'logo-design', title: '로고 만들기' },
  { id: 'landing-copy', title: '랜딩 페이지 문구 정리' },
];

function MenuButton({ icon: Icon, label, isActive = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[14px] transition-colors ${
        isActive ? 'bg-[#e8e8e8] text-[#0d0d0d]' : 'text-[#202020] hover:bg-[#ececec]'
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function ConversationButton({ chat, isActive, onSelect, onOpenMenu }) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onSelect?.(chat)}
        className={`flex h-9 w-full items-center rounded-lg px-2.5 pr-10 text-left text-[14px] transition-colors ${
          isActive ? 'bg-[#e8e8e8] text-[#0d0d0d]' : 'text-[#202020] hover:bg-[#ececec]'
        }`}
        aria-current={isActive ? 'page' : undefined}
        title={chat.title}
      >
        <span className="truncate">{chat.title}</span>
      </button>

      <button
        type="button"
        onClick={event => {
          event.stopPropagation();
          onOpenMenu?.(chat);
        }}
        className={`absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-[#555] transition hover:bg-[#dcdcdc] focus:opacity-100 ${
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        aria-label={`${chat.title} 옵션`}
      >
        <Ellipsis className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );
}

export function OndamSidebarRail({ onOpen, onNewChat }) {
  return (
    <aside
      className="flex h-dvh w-12 flex-col border-r border-black/5 bg-white text-[#0d0d0d]"
      aria-label="접힌 ONDAM AI 채팅 메뉴"
    >
      <div className="flex flex-1 flex-col items-center gap-2 py-3">
        <button
          type="button"
          onClick={onOpen}
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#ececec]"
          aria-label="사이드바 열기"
          title="사이드바 열기"
        >
          <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onNewChat}
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#ececec]"
          aria-label="새 채팅"
          title="새 채팅"
        >
          <SquarePen className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div className="flex justify-center border-t border-black/5 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e3e3e3] text-[11px] font-semibold text-[#4b4b4b]">
          ON
        </span>
      </div>
    </aside>
  );
}

export default function OndamSidebar({
  chats = defaultChats,
  projects = defaultProjects,
  activeChatId = 'admin-sidebar',
  user = { name: 'rex307', plan: 'Plus' },
  onNewChat,
  onSelectChat,
  onSelectMenu,
  onOpenChatMenu,
  onClose,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredChats = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
    if (!normalizedQuery) return chats;
    return chats.filter(chat => chat.title.toLocaleLowerCase('ko-KR').includes(normalizedQuery));
  }, [chats, query]);

  const handleNewChat = () => {
    setQuery('');
    setIsSearchOpen(false);
    onNewChat?.();
  };

  return (
    <aside
      className="flex h-dvh w-[292px] shrink-0 flex-col border-r border-black/5 bg-white text-[#0d0d0d]"
      aria-label="ONDAM AI 채팅 메뉴"
    >
      <header className="flex h-14 shrink-0 items-center gap-1 px-3">
        <UserServiceSwitcher />

        <button
          type="button"
          onClick={() => setIsSearchOpen(value => !value)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#404040] hover:bg-[#ececec]"
          aria-label="채팅 검색"
          aria-expanded={isSearchOpen}
          title="채팅 검색"
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#404040] hover:bg-[#ececec]"
          aria-label="사이드바 닫기"
          title="사이드바 닫기"
        >
          <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </header>

      <div className="px-2 pb-2">
        {isSearchOpen && (
          <div className="relative mb-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="채팅 검색"
              className="h-9 w-full rounded-lg border border-[#d9d9d9] bg-white pl-8 pr-8 text-[13px] outline-none placeholder:text-[#999] focus:border-[#aaa]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md hover:bg-[#eee]"
                aria-label="검색어 지우기"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <MenuButton
          icon={SquarePen}
          label="새 채팅"
          isActive={!activeChatId}
          onClick={handleNewChat}
        />
        <div className="mt-1 space-y-0.5">
          {primaryItems.map(item => (
            <MenuButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              onClick={() => onSelectMenu?.(item.id)}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 [scrollbar-color:#d8d8d8_transparent] [scrollbar-width:thin]">
        <section className="pt-3" aria-labelledby="ondam-projects-heading">
          <button
            type="button"
            onClick={() => setIsProjectsOpen(value => !value)}
            className="flex h-8 w-full items-center gap-1 rounded-lg px-2.5 text-left text-[12px] font-medium text-[#777] hover:bg-[#ececec] hover:text-[#3d3d3d]"
            aria-expanded={isProjectsOpen}
          >
            <span id="ondam-projects-heading" className="flex-1">
              프로젝트
            </span>
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${isProjectsOpen ? 'rotate-90' : ''}`}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>

          {isProjectsOpen && (
            <div className="mt-0.5 space-y-0.5">
              {projects.map(project => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectMenu?.(`project:${project.id}`)}
                  className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-[#303030] hover:bg-[#ececec]"
                >
                  <Folder className="h-4 w-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                  <span className="truncate">{project.title}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="pt-5" aria-labelledby="ondam-recent-heading">
          <h2 id="ondam-recent-heading" className="mb-1 px-2.5 text-[12px] font-medium text-[#777]">
            최근
          </h2>
          <div className="space-y-0.5">
            {filteredChats.map(chat => (
              <ConversationButton
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onSelect={onSelectChat}
                onOpenMenu={onOpenChatMenu}
              />
            ))}
            {filteredChats.length === 0 && (
              <p className="px-2.5 py-5 text-center text-[12px] text-[#999]">
                일치하는 채팅이 없습니다.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="shrink-0 border-t border-black/5 p-2">
        <UserAccountMenu user={user} onAction={onSelectMenu} />
      </div>
    </aside>
  );
}
