import { useRef, useState } from 'react';
import OndamSidebar, {
  OndamSidebarRail,
} from '../../../components/usersidebar/ondamsidebar/OndamSidebar.jsx';
import NewChatView from './components/NewChatView.jsx';
import ChatView from './components/ChatView.jsx';
import { createMockAnswer } from './components/mockResponses.js';

export default function OndamPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.localStorage.getItem('ondam-sidebar-open') !== 'false';
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const chatVersionRef = useRef(0);

  const setSidebarOpen = isOpen => {
    setIsSidebarOpen(isOpen);
    window.localStorage.setItem('ondam-sidebar-open', String(isOpen));
  };

  const startNewChat = () => {
    chatVersionRef.current += 1;
    setActiveChatId(null);
    setMessages([]);
  };

  const submitPrompt = prompt => {
    const chatVersion = chatVersionRef.current;
    const userMessage = { id: `user-${Date.now()}`, role: 'user', content: prompt };

    setActiveChatId(currentId => currentId ?? `new-${Date.now()}`);
    setMessages(currentMessages => [...currentMessages, userMessage]);

    window.setTimeout(() => {
      if (chatVersion !== chatVersionRef.current) return;
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: createMockAnswer(prompt),
        },
      ]);
    }, 5000);
  };

  const selectChat = chat => {
    chatVersionRef.current += 1;
    setActiveChatId(chat.id);
    setMessages([
      { id: `${chat.id}-user`, role: 'user', content: chat.title },
      {
        id: `${chat.id}-assistant`,
        role: 'assistant',
        content: createMockAnswer(chat.title),
      },
    ]);
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
            onNewChat={startNewChat}
            onSelectChat={selectChat}
            onClose={() => setSidebarOpen(false)}
          />
        ) : (
          <OndamSidebarRail onOpen={() => setSidebarOpen(true)} onNewChat={startNewChat} />
        )}
      </div>

      <main
        data-route-scroll-container
        className="min-w-0 flex-1 overflow-y-auto bg-white"
        aria-label="AI 채팅 영역"
      >
        {!activeChatId ? (
          <NewChatView onSubmit={submitPrompt} />
        ) : (
          <ChatView messages={messages} onSubmit={submitPrompt} />
        )}
      </main>
    </div>
  );
}
