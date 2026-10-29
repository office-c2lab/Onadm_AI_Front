import { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  CircleHelp,
  CircleUserRound,
  LogOut,
  Settings,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

const menuGroups = [
  [
    { id: 'upgrade', label: '플랜 업그레이드', icon: Sparkles },
    { id: 'personalization', label: '개인 설정', icon: SlidersHorizontal },
    { id: 'profile', label: '프로필', icon: CircleUserRound },
    { id: 'settings', label: '설정', icon: Settings },
  ],
  [
    { id: 'help', label: '도움말', icon: CircleHelp, trailing: true },
    { id: 'logout', label: '로그아웃', icon: LogOut },
  ],
];

export default function UserAccountMenu({ user = { name: 'rex307', plan: 'Plus' }, onAction }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const initials = user.name.slice(0, 2).toUpperCase();
  const remainingCredits =
    typeof user.remainingCredits === 'number'
      ? user.remainingCredits.toLocaleString('ko-KR')
      : user.remainingCredits;
  const creditPercentage =
    typeof user.remainingCredits === 'number' && typeof user.totalCredits === 'number'
      ? Math.min(100, Math.max(0, (user.remainingCredits / user.totalCredits) * 100))
      : null;

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = event => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const selectAction = id => {
    setOpen(false);
    onAction?.(id);
  };

  return (
    <div ref={containerRef} className="relative">
      {open && (
        <div
          role="menu"
          aria-label="계정 메뉴"
          className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-xl shadow-black/10"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => selectAction('account')}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[#f3f3f3]"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#a9b7b7] text-[10px] font-semibold text-white">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium leading-[18px] text-[#222]">
                {user.name}
              </span>
              <span className="block truncate text-[11px] leading-4 text-[#777]">{user.plan}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#777]" aria-hidden="true" />
          </button>

          {menuGroups.map((group, groupIndex) => (
            <div
              key={group[0].id}
              className={
                groupIndex === 0
                  ? 'mt-1 border-t border-black/10 pt-2'
                  : 'mt-2 border-t border-black/10 pt-2'
              }
            >
              {group.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    onClick={() => selectAction(item.id)}
                    className="flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[14px] text-[#202020] transition-colors hover:bg-[#f3f3f3]"
                  >
                    <Icon
                      className="h-[18px] w-[18px] shrink-0"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.trailing && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#777]" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {remainingCredits && creditPercentage !== null && (
        <div className="mb-2 px-2 pt-1" aria-label="남은 크레딧 정보">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium text-[#555]">남은 크레딧</span>
            <span className="text-[13px] font-semibold tabular-nums text-[#171717]">
              {remainingCredits}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div
              className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#e8e8e8]"
              role="progressbar"
              aria-label="잔여 크레딧 비율"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(creditPercentage)}
            >
              <div
                className="h-full rounded-full bg-[#3c7cf6] transition-[width] duration-300"
                style={{ width: `${creditPercentage}%` }}
              />
            </div>
            <span className="w-10 text-right text-[11px] font-medium tabular-nums text-[#3c7cf6]">
              {creditPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${open ? 'bg-[#ececec]' : 'hover:bg-[#ececec]'}`}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#a9b7b7] text-[10px] font-semibold text-white">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium leading-[18px]">{user.name}</span>
          <span className="block truncate text-[11px] leading-4 text-[#777]">
            {user.email ?? user.plan}
          </span>
        </span>
      </button>
    </div>
  );
}
