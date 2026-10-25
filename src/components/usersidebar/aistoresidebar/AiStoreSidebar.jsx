import {
  Atom,
  CircleHelp,
  ClipboardCheck,
  Grid2X2,
  LibraryBig,
  PanelLeft,
  Store,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import UserAccountMenu from '../UserAccountMenu.jsx';
import UserServiceSwitcher from '../UserServiceSwitcher.jsx';

const toolItems = [
  { label: '내 도구', to: '/user/aistore/mytools', icon: Grid2X2 },
  { label: '등록 및 심사', to: '/user/aistore/register', icon: ClipboardCheck },
];

const storeItems = [
  { label: '스토어', to: '/user/aistore/store', icon: Store },
  { label: '라이브러리', to: '/user/aistore/library', icon: LibraryBig },
];

const supportItems = [{ label: '이용 가이드', to: '/user/aistore/guide', icon: CircleHelp }];

function SidebarLink({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[14px] font-normal text-[#0d0d0d] transition-colors ${
          isActive ? 'bg-[#e8e8e8]' : 'hover:bg-[#ececec]'
        }`
      }
    >
      <Icon
        className="h-[18px] w-[18px] shrink-0 text-[#2f2f2f]"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </NavLink>
  );
}

function SectionLabel({ children, isFirst = false }) {
  return (
    <p
      className={`mb-1 px-2.5 text-[12px] font-medium leading-5 text-[#8f8f8f] ${
        isFirst ? 'mt-0' : 'mt-5'
      }`}
    >
      {children}
    </p>
  );
}

const railItems = [...storeItems, ...toolItems, ...supportItems];

export function AiStoreSidebarRail({ onOpen, onNavigate }) {
  return (
    <aside
      id="ai-store-sidebar"
      className="flex h-full min-h-screen w-12 flex-col border-r border-black/5 bg-white text-[#0d0d0d]"
      aria-label="접힌 AI App Store 메뉴"
    >
      <div className="flex flex-1 flex-col items-center gap-1 px-1.5 py-3">
        <div className="group relative mb-4 h-9 w-9 shrink-0">
          <img
            src="/store.png"
            alt="AI App Store"
            className="absolute inset-0 h-9 w-9 object-contain transition-opacity group-hover:opacity-0 group-focus-within:opacity-0"
          />
          <button
            type="button"
            onClick={onOpen}
            className="absolute inset-0 grid place-items-center rounded-lg bg-white opacity-0 transition-[opacity,background-color] hover:bg-[#ececec] focus:opacity-100 group-hover:opacity-100"
            aria-label="사이드바 열기"
            aria-controls="ai-store-sidebar"
            aria-expanded="false"
            title="사이드바 열기"
          >
            <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </button>
        </div>

        <nav className="flex w-full flex-col items-center gap-1" aria-label="빠른 메뉴">
          {railItems.map(item => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `grid h-9 w-9 place-items-center rounded-lg text-[#191919] transition-colors ${
                    isActive ? 'bg-[#e8e8e8]' : 'hover:bg-[#ececec]'
                  }`
                }
                aria-label={item.label}
                title={item.label}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="flex shrink-0 justify-center border-t border-black/5 px-1.5 py-3">
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-full bg-[#e3e3e3] text-[#4b4b4b] transition-opacity hover:opacity-85"
          aria-label="ONDAM AI 계정"
          title="ONDAM AI"
        >
          <Atom className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

export default function AiStoreSidebar({ className = '', onNavigate, onClose }) {
  return (
    <aside
      id="ai-store-sidebar"
      className={`flex h-full min-h-screen w-[260px] shrink-0 flex-col border-r border-black/5 bg-white text-[#0d0d0d] ${className}`.trim()}
      aria-label="AI App Store 메뉴"
    >
      <header className="flex h-14 shrink-0 items-center gap-1 px-3">
        <UserServiceSwitcher />

        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#5d5d5d] transition-colors hover:bg-[#ececec] hover:text-[#0d0d0d]"
          aria-label="사이드바 닫기"
          aria-controls="ai-store-sidebar"
        >
          <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.7} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 [scrollbar-color:#d9d9d9_transparent] [scrollbar-width:thin]">
        <nav aria-label="주요 메뉴">
          <SectionLabel isFirst>AI APP Store</SectionLabel>
          <div className="space-y-0.5">
            {storeItems.map(item => (
              <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>

          <SectionLabel>내 도구 관리</SectionLabel>
          <div className="space-y-0.5">
            {toolItems.map(item => (
              <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>

          <SectionLabel>지원</SectionLabel>
          <div className="space-y-0.5">
            {supportItems.map(item => (
              <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </nav>
      </div>

      <div className="shrink-0 border-t border-black/5 p-2">
        <UserAccountMenu />
      </div>
    </aside>
  );
}
