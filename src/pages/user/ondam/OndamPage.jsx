import { useState } from 'react';
import OndamSidebar, {
  OndamSidebarRail,
} from '../../../components/usersidebar/ondamsidebar/OndamSidebar.jsx';
import NewChatView from './components/NewChatView.jsx';

export default function OndamPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.localStorage.getItem('ondam-sidebar-open') !== 'false';
  });
  const [activeChatId, setActiveChatId] = useState(null);

  const setSidebarOpen = isOpen => {
    setIsSidebarOpen(isOpen);
    window.localStorage.setItem('ondam-sidebar-open', String(isOpen));
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-white text-[#0d0d0d]">
      <div
        className={`h-dvh shrink-0 overflow-hidden transition-[width] duration-200 ease-out ${
          isSidebarOpen ? 'w-[292px]' : 'w-12'
        }`}
      >
        {isSidebarOpen ? (
          <OndamSidebar
            activeChatId={activeChatId}
            onNewChat={() => setActiveChatId(null)}
            onSelectChat={chat => setActiveChatId(chat.id)}
            onClose={() => setSidebarOpen(false)}
          />
        ) : (
          <OndamSidebarRail
            onOpen={() => setSidebarOpen(true)}
            onNewChat={() => setActiveChatId(null)}
          />
        )}
      </div>

      <main
        data-route-scroll-container
        className="min-w-0 flex-1 overflow-y-auto bg-white"
        aria-label="AI 채팅 영역"
      >
        {!activeChatId && <NewChatView />}
      </main>
    </div>
  );
}
