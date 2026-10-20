
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import AdminSidebar, {
  AdminSidebarRail,
} from '../components/adminSidebar/AdminSidebar';

export default function AdminLayout() {
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
        className={`sticky top-0 h-screen shrink-0 overflow-hidden transition-[width] duration-200 ease-out ${
          isSidebarOpen ? 'w-[260px]' : 'w-12'
        }`}
      >
        {isSidebarOpen ? (
          <AdminSidebar
            className="h-screen"
            onClose={() => setSidebarOpen(false)}
          />
        ) : (
          <AdminSidebarRail
            onOpen={() => setSidebarOpen(true)}
          />
        )}
      </div>

      {/* 관리자 콘텐츠 */}
      <main className="relative min-h-screen min-w-0 flex-1 bg-[#f9f9f9] px-8">
        <div className="mx-auto w-full max-w-7xl px-5 pb-9 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
