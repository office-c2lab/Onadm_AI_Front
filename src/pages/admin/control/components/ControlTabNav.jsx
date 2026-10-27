import { NavLink } from 'react-router-dom';

const tabSets = {
  internal: [
    { label: 'AI 사용 현황', to: '/admin/control/internal/usage' },
    { label: 'AI 요청 이력', to: '/admin/control/internal/history' },
    { label: 'LLM 모델 관리', to: '/admin/control/internal/models' },
    { label: '시스템 프롬프트', to: '/admin/control/internal/prompts' },
    { label: '사용량 및 한도 관리', to: '/admin/control/internal/limits' },
    { label: '크레딧 변동 내역', to: '/admin/control/internal/credit-history' },
   
  ],
  external: [
    { label: '통제 대시보드', to: '/admin/control/external/dashboard' },
    { label: '프롬프트 모니터링', to: '/admin/control/external/monitoring' },
    { label: '외부 AI 사용자 관리', to: '/admin/control/external/users' },
    { label: '외부 AI 정책 관리', to: '/admin/control/external/policies' },
    { label: '서비스·도메인 관리', to: '/admin/control/external/domains' },
    { label: '배포 및 운영지원', to: '/admin/control/external/support' },
  ],
};

export default function ControlTabNav({ type, className = '' }) {
  const tabs = tabSets[type] ?? [];

  return (
    <nav
      className={`flex items-center justify-center gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`.trim()}
      aria-label={type === 'internal' ? 'Control 내부 페이지' : 'Control 외부 페이지'}
    >
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `shrink-0 rounded-full px-4 py-1 text-sm transition-colors ${
              isActive
                ? 'bg-[#ededed] font-medium text-[#333]'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
