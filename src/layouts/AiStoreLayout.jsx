import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AiStoreSidebar, {
  AiStoreSidebarRail,
} from '../components/usersidebar/aistoresidebar/AiStoreSidebar.jsx';

export default function AiStoreLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.localStorage.getItem('ai-store-sidebar-open') !== 'false';
  });

  const setSidebarOpen = isOpen => {
    setIsSidebarOpen(isOpen);
    window.localStorage.setItem('ai-store-sidebar-open', String(isOpen));
  };

  return (
    <div className="flex min-h-screen bg-[#f9f9f9] text-[#0d0d0d]">
      <div
        className={`sticky top-0 h-screen shrink-0 overflow-hidden transition-[width] duration-200 ease-out ${
          isSidebarOpen ? 'w-[260px]' : 'w-12'
        }`}
      >
        {isSidebarOpen ? (
          <AiStoreSidebar className="h-screen" onClose={() => setSidebarOpen(false)} />
        ) : (
          <AiStoreSidebarRail onOpen={() => setSidebarOpen(true)} />
        )}
      </div>

      <main className="relative min-h-screen min-w-0 flex-1 bg-[#f9f9f9]">
        <div className="mx-auto flex min-h-full w-full max-w-[88rem] px-[clamp(0.875rem,2vw,1.5rem)] pb-[clamp(2rem,4vw,3rem)]">
          <div className="mx-auto w-full max-w-[74rem]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
