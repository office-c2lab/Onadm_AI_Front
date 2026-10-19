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

      <main className="relative min-h-screen min-w-0 flex-1 bg-[#f9f9f9] px-8">
        <div className="mx-auto w-full max-w-7xl px-5 pb-3 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
