import { Outlet, useLocation } from 'react-router-dom';

import AdminSidebar, { AdminSidebarRail } from '../components/adminSidebar/AdminSidebar';
import useSidebarStore from '../stores/sidebarStore.js';

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
    isExternalControl ||
    isInternalTabbedPage ||
    location.pathname === '/admin/control/internal/classification' ||
    location.pathname === '/admin/users';
  const isTopFlushPage =
    location.pathname === '/admin/discover/intelligence' ||
    location.pathname.startsWith('/admin/manage');
  const isSidebarOpen = useSidebarStore(state => state.adminOpen);
  const setSidebarOpen = useSidebarStore(state => state.setAdminOpen);

  return (
    <div className="flex min-h-screen bg-white text-[#0d0d0d]">
      <div
        className={`sticky top-0 h-screen shrink-0 overflow-hidden transition-[width] duration-200 ease-out ${
          isSidebarOpen ? 'w-[260px]' : 'w-12'
        }`}
      >
        {isSidebarOpen ? (
          <AdminSidebar className="h-screen" onClose={() => setSidebarOpen(false)} />
        ) : (
          <AdminSidebarRail onOpen={() => setSidebarOpen(true)} />
        )}
      </div>

      <main
        className="relative min-h-screen min-w-0 flex-1 bg-white"
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
