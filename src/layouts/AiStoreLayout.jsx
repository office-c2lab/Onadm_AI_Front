import usePersistentSidebar from '../hooks/usePersistentSidebar.js';
import SidebarFrame from '../components/layout/SidebarFrame.jsx';
import { Outlet } from 'react-router-dom';
import AiStoreSidebar, {
  AiStoreSidebarRail,
} from '../components/usersidebar/aistoresidebar/AiStoreSidebar.jsx';

export default function AiStoreLayout() {
  const [isSidebarOpen, setSidebarOpen] = usePersistentSidebar('ai-store-sidebar-open');

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <SidebarFrame open={isSidebarOpen} variant="default" className="sticky top-0">
        {isSidebarOpen ? (
          <AiStoreSidebar className="h-screen" onClose={() => setSidebarOpen(false)} />
        ) : (
          <AiStoreSidebarRail onOpen={() => setSidebarOpen(true)} />
        )}
      </SidebarFrame>

      <main className="relative min-h-screen min-w-0 flex-1 bg-canvas px-8">
        <div className="mx-auto w-full max-w-7xl px-5 pb-9 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
