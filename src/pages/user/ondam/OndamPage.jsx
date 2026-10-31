import { useEffect, useRef, useState } from 'react';
import OndamSidebar, {
  OndamSidebarRail,
} from '../../../components/usersidebar/ondamsidebar/OndamSidebar.jsx';
import NewChatView from './components/NewChatView.jsx';
import ChatView from './components/ChatView.jsx';
import ProjectHomeView from './components/ProjectHomeView.jsx';
import VoiceConversationView from './components/VoiceConversationView.jsx';
import { createMockAnswer } from './components/mockResponses.js';

export default function OndamPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.localStorage.getItem('ondam-sidebar-open') !== 'false';
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [projectViewKey, setProjectViewKey] = useState(0);
  const [projectSettingsRequest, setProjectSettingsRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isResponding, setIsResponding] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isAssistantEnabled, setIsAssistantEnabled] = useState(() => {
    return window.localStorage.getItem('ondam-assistant-enabled') !== 'false';
  });
  const chatVersionRef = useRef(0);
  const responseTimersRef = useRef(new Set());

  const clearResponseTimers = () => {
    responseTimersRef.current.forEach(timerId => window.clearTimeout(timerId));
    responseTimersRef.current.clear();
  };

  const scheduleResponse = (callback, delay) => {
    const timerId = window.setTimeout(() => {
      responseTimersRef.current.delete(timerId);
      callback();
    }, delay);
    responseTimersRef.current.add(timerId);
  };

  useEffect(() => () => clearResponseTimers(), []);

  const setSidebarOpen = isOpen => {
    setIsSidebarOpen(isOpen);
    window.localStorage.setItem('ondam-sidebar-open', String(isOpen));
  };

  const setAssistantEnabled = isEnabled => {
    setIsAssistantEnabled(isEnabled);
    window.localStorage.setItem('ondam-assistant-enabled', String(isEnabled));
  };

  const startNewChat = (projectId = null, project = null, projectChats = []) => {
    clearResponseTimers();
    chatVersionRef.current += 1;
    setIsResponding(false);
    setIsLoadingHistory(false);
    setIsVoiceMode(false);
    setActiveChatId(null);
    setMessages([]);

    if (projectId && project) {
      setActiveProject({ ...project, chats: projectChats });
      setProjectViewKey(current => current + 1);
    } else {
      setActiveProject(null);
    }
  };

  const selectProject = (project, projectChats = []) => {
    clearResponseTimers();
    chatVersionRef.current += 1;
    setIsResponding(false);
    setIsLoadingHistory(false);
    setIsVoiceMode(false);
    setActiveProject({ ...project, chats: projectChats });
    setActiveChatId(null);
    setMessages([]);
    setProjectViewKey(current => current + 1);
  };

  const openProjectSettings = project => {
    if (!isSidebarOpen) setSidebarOpen(true);
    setProjectSettingsRequest({ projectId: project.id, requestId: Date.now() });
  };

  const updateProject = updatedProject => {
    setActiveProject(current =>
      current?.id === updatedProject.id ? { ...current, ...updatedProject } : current
    );
  };

  const submitPrompt = prompt => {
    if (isResponding || isLoadingHistory) return;

    const now = Date.now();
    const chatVersion = chatVersionRef.current;
    const userMessage = { id: `user-${now}`, role: 'user', content: prompt };
    const assistantMessageId = `assistant-${now}`;
    const answer = createMockAnswer(prompt);

    setIsResponding(true);
    setIsLoadingHistory(false);
    setActiveChatId(currentId => currentId ?? `new-${now}`);
    setMessages(currentMessages => [...currentMessages, userMessage]);

    scheduleResponse(() => {
      if (chatVersion !== chatVersionRef.current) return;

      let visibleLength = Math.min(3, answer.length);
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: answer.slice(0, visibleLength),
          isStreaming: true,
        },
      ]);

      const revealNextChunk = () => {
        if (chatVersion !== chatVersionRef.current) return;

        const currentCharacter = answer[visibleLength - 1];
        const chunkSize = /[.!?。\n]/.test(currentCharacter) ? 2 : 4;
        visibleLength = Math.min(answer.length, visibleLength + chunkSize);
        const isComplete = visibleLength >= answer.length;

        setMessages(currentMessages =>
          currentMessages.map(message =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: answer.slice(0, visibleLength),
                  isStreaming: !isComplete,
                }
              : message
          )
        );

        if (isComplete) {
          setIsResponding(false);
          return;
        }

        const nextDelay = /[.!?。\n]/.test(answer[visibleLength - 1]) ? 80 : 24;
        scheduleResponse(revealNextChunk, nextDelay);
      };

      scheduleResponse(revealNextChunk, 40);
    }, 750);
  };

  const selectChat = (chat, project = null) => {
    clearResponseTimers();
    chatVersionRef.current += 1;
    const chatVersion = chatVersionRef.current;
    setIsResponding(false);
    setIsLoadingHistory(true);
    setIsVoiceMode(false);
    if (project) {
      setActiveProject(current => ({
        ...project,
        chats: current?.id === project.id ? current.chats : [],
      }));
    } else {
      setActiveProject(null);
    }
    setActiveChatId(chat.id);
    setMessages([{ id: `${chat.id}-user`, role: 'user', content: chat.title }]);

    scheduleResponse(() => {
      if (chatVersion !== chatVersionRef.current) return;

      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: `${chat.id}-assistant`,
          role: 'assistant',
          content: createMockAnswer(chat.title),
        },
      ]);
      setIsLoadingHistory(false);
    }, 1000);
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
            onSelectProject={selectProject}
            onProjectUpdated={updateProject}
            settingsRequest={projectSettingsRequest}
            onSettingsRequestHandled={() => setProjectSettingsRequest(null)}
            assistantEnabled={isAssistantEnabled}
            onAssistantEnabledChange={setAssistantEnabled}
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
        {isVoiceMode ? (
          <VoiceConversationView onClose={() => setIsVoiceMode(false)} />
        ) : !activeChatId && activeProject ? (
          <ProjectHomeView
            key={`${activeProject.id}-${projectViewKey}`}
            project={activeProject}
            chats={activeProject.chats}
            onSubmit={submitPrompt}
            onSelectChat={selectChat}
            onOpenSettings={openProjectSettings}
            onStartVoice={() => setIsVoiceMode(true)}
          />
        ) : !activeChatId ? (
          <NewChatView onSubmit={submitPrompt} onStartVoice={() => setIsVoiceMode(true)} />
        ) : (
          <ChatView
            messages={messages}
            onSubmit={submitPrompt}
            isResponding={isResponding}
            isLoadingHistory={isLoadingHistory}
            isAssistantEnabled={isAssistantEnabled}
            onStartVoice={() => setIsVoiceMode(true)}
          />
        )}
      </main>
    </div>
  );
}
