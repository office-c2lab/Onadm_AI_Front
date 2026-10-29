import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const services = [
  {
    id: 'ondam',
    label: 'ONDAM AI',
    description: '대화로 업무를 시작하세요',
    to: '/user/ondam',
  },
  {
    id: 'aistore',
    label: 'AI APP STORE',
    description: 'AI 도구를 탐색하고 관리하세요',
    to: '/user/aistore/store',
  },
];

function ServiceIcon({ serviceId }) {
  if (serviceId === 'ondam') {
    return <img src="/simbol.png" alt="" className="h-6 w-6 object-contain" />;
  }

  return <img src="/store.png" alt="" className="h-6 w-6 object-contain" />;
}

export default function UserServiceSwitcher({ className = '' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const activeServiceId = location.pathname.startsWith('/user/aistore') ? 'aistore' : 'ondam';
  const activeService = services.find(service => service.id === activeServiceId);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = event => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = event => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectService = service => {
    setIsOpen(false);
    if (service.id !== activeServiceId) navigate(service.to);
  };

  return (
    <div ref={containerRef} className={`relative min-w-0 flex-1 ${className}`.trim()}>
      <button
        type="button"
        onClick={() => setIsOpen(value => !value)}
        className="flex h-10 w-full min-w-0 items-center gap-2 rounded-lg px-1.5 text-left transition-colors hover:bg-[#eeeeee]"
        aria-label="사용자 서비스 선택"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <ServiceIcon serviceId={activeService.id} />
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em]">
          {activeService.label}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#777] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-[240px] overflow-hidden rounded-2xl border border-black/10 bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]"
          role="menu"
          aria-label="사용자 서비스"
        >
          {services.map(service => {
            const isActive = service.id === activeServiceId;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => selectService(service)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#f2f2f2] focus-visible:bg-[#f2f2f2] focus-visible:outline-none"
                role="menuitemradio"
                aria-checked={isActive}
              >
                <ServiceIcon serviceId={service.id} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium leading-5 text-[#171717]">
                    {service.label}
                  </span>
                  <span className="block truncate text-[12px] leading-[18px] text-[#888]">
                    {service.description}
                  </span>
                </span>
                {isActive && (
                  <Check
                    className="h-4 w-4 shrink-0 text-[#333]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
