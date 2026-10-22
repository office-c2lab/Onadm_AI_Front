import usePersistentSidebar from '../hooks/usePersistentSidebar.js';
import SidebarFrame from '../components/layout/SidebarFrame.jsx';
import { Outlet, useLocation } from 'react-router-dom';

import AdminSidebar, { AdminSidebarRail } from '../components/adminSidebar/AdminSidebar';

export default function AdminLayout() {
  const location = useLocation();
  const isExternalControl = location.pathname.startsWith('/admin/control/external');
  const isInternalTabbedPage = [
    '/admin/control/internal/usage',
    '/admin/control/internal/models',
    '/admin/control/internal/prompts',
    '/admin/control/internal/limits',
    '/admin/control/internal/credit-history',
    '/admin/control/internal/history',
  ].includes(location.pathname);
  const usesOwnPageLayout =
    isExternalControl || isInternalTabbedPage || location.pathname === '/admin/users';
  const isTopFlushPage =
    location.pathname === '/admin/discover/intelligence' ||
    location.pathname.startsWith('/admin/manage');
  const [isSidebarOpen, setSidebarOpen] = usePersistentSidebar('admin-sidebar-open');

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      {/* 관리자 사이드바 */}
      <SidebarFrame open={isSidebarOpen} variant="default" className="sticky top-0 z-30">
        {isSidebarOpen ? (
          <AdminSidebar className="h-screen" onClose={() => setSidebarOpen(false)} />
        ) : (
          <AdminSidebarRail onOpen={() => setSidebarOpen(true)} />
        )}
      </SidebarFrame>

      {/* 관리자 콘텐츠 */}
      <main
        className="relative z-0 min-h-screen min-w-0 flex-1 bg-canvas"
        style={{
          '--ondam-admin-sidebar-width': isSidebarOpen
            ? 'var(--layout-sidebar-width)'
            : 'var(--layout-sidebar-rail-width)',
        }}
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
