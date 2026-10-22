import usePersistentSidebar from '../../../hooks/usePersistentSidebar.js';
import SidebarFrame from '../../../components/layout/SidebarFrame.jsx';
import { useState } from 'react';
import OndamSidebar, {
  OndamSidebarRail,
} from '../../../components/usersidebar/ondamsidebar/OndamSidebar.jsx';
import NewChatView from './components/NewChatView.jsx';

export default function OndamPage() {
  const [isSidebarOpen, setSidebarOpen] = usePersistentSidebar('ondam-sidebar-open');
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-ink">
      <SidebarFrame open={isSidebarOpen} variant="chat" className="">
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
      </SidebarFrame>

      <main className="min-w-0 flex-1 overflow-y-auto bg-canvas" aria-label="AI 채팅 영역">
        {!activeChatId && <NewChatView />}
      </main>
    </div>
  );
}
