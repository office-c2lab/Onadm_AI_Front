import { useEffect, useState } from 'react';
import {
  Atom,
  PanelLeft,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Boxes,
  Users,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import AdminAccountMenu from './AdminAccountMenu.jsx';

// ================================
// 관리자 메뉴 설정
// ================================
const adminMenus = [
  {
    label: '대시보드',
    icon: LayoutDashboard,
    to: '/admin/dashboard',
  },
  {
    label: 'Discover',
    icon: Search,
    children: [
      {
        label: 'AI Service Analysis',
        to: '/admin/discover/url-analysis',
      },
      {
        label: 'Intelligence DB',
        to: '/admin/discover/intelligence',
      },
    ],
  },
  {
    label: 'Control',
    icon: ShieldCheck,
    children: [
      {
        label: 'CSO 분류 관리',
        to: '/admin/control/internal/classification',
      },
      {
        label: 'AI 사용 정책 및 라우팅',
        to: '/admin/control/internal/policies',
      },
      {
        label: 'Control 내부',
        to: '/admin/control/internal/usage',
        activePaths: [
          '/admin/control/internal/usage',
          '/admin/control/internal/models',
          '/admin/control/internal/prompts',
          '/admin/control/internal/limits',
          '/admin/control/internal/credit-history',
          '/admin/control/internal/history',
        ],
      },
      {
        label: 'Control 외부',
        to: '/admin/control/external/dashboard',
        activePrefix: '/admin/control/external',
      },
    ],
  },
  {
    label: 'Manage',
    icon: Boxes,
    children: [
      {
        label: '앱·에이전트 관리',
        to: '/admin/manage/apps',
      },
      {
        label: '심사 관리',
        to: '/admin/manage/security',
      },
      {
        label: '스토어 진열 관리',
        to: '/admin/manage/catalog',
      },
      {
        label: '등록·심사 정책',
        to: '/admin/manage/policies',
      },
    ],
  },
  {
    label: '사용자 및 권한',
    icon: Users,
    children: [
      {
        label: '사용자 관리',
        to: '/admin/users',
      },
      {
        label: '부서 관리',
        to: '/admin/departments',
      },
      {
        label: '역할 및 접근 권한',
        to: '/admin/roles',
      },
    ],
  },
  {
    label: '시스템 운영',
    icon: Settings,
    children: [
      {
        label: '모듈 관리',
        to: '/admin/system/modules',
      },
      {
        label: '작업 현황',
        to: '/admin/system/jobs',
      },
      {
        label: '감사 로그',
        to: '/admin/system/audit',
      },
      {
        label: '시스템 설정 및 상태',
        to: '/admin/system/settings',
      },
    ],
  },
];

// ================================
// 경로 활성화 판단
// ================================
function isPathActive(target, pathname) {
  if (!target) return false;

  return pathname === target || pathname.startsWith(`${target}/`);
}

function isMenuActive(menu, pathname) {
  // 직접 이동하는 단일 메뉴
  if (menu.to) {
    return isPathActive(menu.to, pathname);
  }

  // 하위 메뉴가 있는 그룹
  return (
    menu.children?.some(
      item =>
        isPathActive(item.to, pathname) ||
        item.activePaths?.includes(pathname) ||
        (item.activePrefix && pathname.startsWith(item.activePrefix))
    ) ?? false
  );
}

// ================================
// 하위 메뉴
// ================================
function SidebarSubLink({ item, onNavigate }) {
  const location = useLocation();

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) => {
        const active =
          isActive ||
          item.activePaths?.includes(location.pathname) ||
          (item.activePrefix && location.pathname.startsWith(item.activePrefix));

        return `group flex min-h-8 w-full items-center gap-2
          rounded-lg py-1.5 pl-9 pr-2.5
          text-[13px] transition-colors ${
            active
              ? 'bg-[#e8e8e8] font-medium text-[#0d0d0d]'
              : 'text-[#777] hover:bg-[#f3f3f3] hover:text-[#0d0d0d]'
          }`;
      }}
    >
      <span className="h-1 w-1 shrink-0 rounded-full bg-current opacity-50" aria-hidden="true" />

      <span className="min-w-0 flex-1 leading-5">{item.label}</span>
    </NavLink>
  );
}

// ================================
// 상위 메뉴
// ================================
function SidebarGroup({ menu, expanded, onToggle, onNavigate }) {
  const Icon = menu.icon;
  const location = useLocation();

  const active = isMenuActive(menu, location.pathname);

  const menuClassName = `group flex h-9 w-full items-center gap-2.5
    rounded-lg px-2.5 text-left text-[14px] font-normal text-[#0d0d0d]
    transition-colors ${active ? 'bg-[#e8e8e8]' : 'hover:bg-[#ececec]'}`;

  const menuContent = (
    <>
      <Icon
        className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-[#0d0d0d]' : 'text-[#404040]'}`}
        strokeWidth={1.75}
        aria-hidden="true"
      />

      <span className="min-w-0 flex-1 truncate">{menu.label}</span>
    </>
  );

  return (
    <div className="mb-1">
      {menu.to ? (
        // 하위 메뉴가 없는 단일 페이지 메뉴
        <NavLink
          to={menu.to}
          onClick={onNavigate}
          className={menuClassName}
          aria-current={active ? 'page' : undefined}
        >
          {menuContent}
        </NavLink>
      ) : (
        // 하위 메뉴가 있는 그룹 메뉴
        <>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            data-active={active}
            className={menuClassName}
          >
            {menuContent}

            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0
                transition-transform duration-200 ${expanded ? 'rotate-180' : ''} ${
                  active ? 'text-[#0d0d0d]' : 'text-[#999]'
                }`}
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>

          {expanded && (
            <div className="mt-0.5 flex flex-col gap-0.5">
              {menu.children.map(item => (
                <SidebarSubLink key={item.to ?? item.label} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ================================
// 접힌 관리자 사이드바
// ================================
export function AdminSidebarRail({ onOpen, onNavigate }) {
  const location = useLocation();

  return (
    <aside
      id="admin-sidebar-rail"
      className="flex h-full min-h-screen w-12 shrink-0 flex-col
        border-r border-black/5 bg-white text-[#0d0d0d]"
      aria-label="접힌 관리자 메뉴"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center gap-1 px-1.5 py-3">
        {/* 로고 및 펼치기 */}
        <div className="group relative mb-4 h-9 w-9 shrink-0">
          <img
            src="/simbol.png"
            alt="ONDAM AI"
            className="absolute inset-0 h-9 w-9 object-contain
              transition-opacity group-hover:opacity-0
              group-focus-within:opacity-0"
          />

          <button
            type="button"
            onClick={onOpen}
            className="absolute inset-0 grid place-items-center
              rounded-lg bg-white opacity-0
              transition-[opacity,background-color]
              hover:bg-[#ececec] focus:opacity-100
              group-hover:opacity-100"
            aria-label="사이드바 열기"
            aria-controls="admin-sidebar"
            aria-expanded="false"
            title="사이드바 열기"
          >
            <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </button>
        </div>

        {/* 빠른 메뉴 */}
        <nav
          className="flex min-h-0 w-full flex-col items-center
            gap-1 overflow-y-auto [scrollbar-width:none]"
          aria-label="관리자 빠른 메뉴"
        >
          {adminMenus.map(menu => {
            const Icon = menu.icon;
            const active = isMenuActive(menu, location.pathname);

            // 단일 메뉴는 해당 경로로,
            // 그룹 메뉴는 첫 번째 하위 페이지로 이동
            const destination = menu.to ?? menu.children?.find(item => item.to)?.to;

            return (
              <NavLink
                key={menu.label}
                to={destination}
                onClick={onNavigate}
                className={`grid h-9 w-9 shrink-0
                  place-items-center rounded-lg
                  transition-colors ${
                    active ? 'bg-[#e8e8e8] text-[#0d0d0d]' : 'text-[#333] hover:bg-[#ececec]'
                  }`}
                aria-label={menu.label}
                title={menu.label}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* 계정 */}
      <div className="flex shrink-0 justify-center border-t border-black/5 px-1.5 py-3">
        <div
          className="grid h-8 w-8 place-items-center
            rounded-full bg-[#e3e3e3] text-[#4b4b4b]"
          aria-label="ONDAM AI 관리자 계정"
          title="ONDAM AI 관리자"
        >
          <Atom className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </div>
      </div>
    </aside>
  );
}

// ================================
// 펼쳐진 관리자 사이드바
// ================================
export default function AdminSidebar({ className = '', onNavigate, onClose }) {
  const location = useLocation();

  // 하위 메뉴가 있는 그룹만 펼침 상태 관리
  const [expandedMenus, setExpandedMenus] = useState(() =>
    adminMenus
      .filter(menu => menu.children?.length > 0 && isMenuActive(menu, location.pathname))
      .map(menu => menu.label)
  );

  // 현재 페이지가 속한 그룹 자동 펼침
  useEffect(() => {
    const activeMenus = adminMenus
      .filter(menu => menu.children?.length > 0 && isMenuActive(menu, location.pathname))
      .map(menu => menu.label);

    if (activeMenus.length === 0) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedMenus(prev => [...new Set([...prev, ...activeMenus])]);
  }, [location.pathname]);

  const toggleMenu = label => {
    setExpandedMenus(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  return (
    <aside
      id="admin-sidebar"
      className={`flex h-full min-h-screen w-[260px] shrink-0
        flex-col border-r border-black/5 bg-white
        text-[#0d0d0d] ${className}`.trim()}
      aria-label="ONDAM AI 관리자 메뉴"
    >
      <header className="flex h-14 shrink-0 items-center gap-1 px-3">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5">
          <img src="/simbol.png" alt="" className="h-6 w-6 shrink-0 object-contain" />
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em]">
            ONDAM Admin
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center
            rounded-lg text-[#5d5d5d]
            transition-colors hover:bg-[#ececec]
            hover:text-[#0d0d0d]"
          aria-label="사이드바 닫기"
          aria-controls="admin-sidebar"
          aria-expanded="true"
        >
          <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.7} />
        </button>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-4
          [scrollbar-color:#d9d9d9_transparent]
          [scrollbar-width:thin]"
      >
        <nav aria-label="관리자 주요 메뉴">
          {adminMenus.map(menu => (
            <SidebarGroup
              key={menu.label}
              menu={menu}
              expanded={expandedMenus.includes(menu.label)}
              onToggle={() => toggleMenu(menu.label)}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </div>

      <div className="shrink-0 border-t border-black/5 p-2">
        <AdminAccountMenu />
      </div>
    </aside>
  );
}
