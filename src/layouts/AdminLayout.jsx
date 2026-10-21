import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import AdminSidebar, { AdminSidebarRail } from '../components/adminSidebar/AdminSidebar';

export default function AdminLayout() {
  const location = useLocation();
  const isExternalControl = location.pathname.startsWith('/admin/control/external');
  const isInternalTabbedPage = [
    '/admin/control/internal/usage',
    '/admin/control/internal/models',
    '/admin/control/internal/limits',
    '/admin/control/internal/history',
  ].includes(location.pathname);
  const usesOwnPageLayout =
    isExternalControl || isInternalTabbedPage || location.pathname === '/admin/users';
  const isTopFlushPage = location.pathname === '/admin/discover/intelligence';
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.localStorage.getItem('admin-sidebar-open') !== 'false';
  });

  const setSidebarOpen = isOpen => {
    setIsSidebarOpen(isOpen);
    window.localStorage.setItem('admin-sidebar-open', String(isOpen));
  };

  return (
    <div className="flex min-h-screen bg-[#f9f9f9] text-[#0d0d0d]">
      {/* 관리자 사이드바 */}
      <div
        className={`sticky top-0 z-30 h-dvh shrink-0 overflow-hidden transition-[width] duration-200 ease-out ${
          isSidebarOpen ? 'w-[260px]' : 'w-12'
        }`}
      >
        {isSidebarOpen ? (
          <AdminSidebar className="h-screen" onClose={() => setSidebarOpen(false)} />
        ) : (
          <AdminSidebarRail onOpen={() => setSidebarOpen(true)} />
        )}
      </div>

      {/* 관리자 콘텐츠 */}
      <main
        className="relative z-0 min-h-screen min-w-0 flex-1 bg-[#f9f9f9]"
        style={{ '--ondam-admin-sidebar-width': isSidebarOpen ? '260px' : '48px' }}
      >
        {usesOwnPageLayout ? (
          <div className="w-full">
            <Outlet />
          </div>
        ) : (
          <div className="mx-auto flex min-h-full w-full max-w-[88rem] px-[clamp(0.875rem,2vw,1.5rem)] pb-[clamp(2rem,4vw,3rem)]">
            <div
              className={`mx-auto w-full max-w-[74rem] ${
                isTopFlushPage ? 'pt-0' : 'pt-[clamp(1.1rem,2vw,1.8rem)]'
              }`}
            >
              <Outlet />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
