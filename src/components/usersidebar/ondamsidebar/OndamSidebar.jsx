import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  ChevronRight,
  Ellipsis,
  Folder,
  House,
  Lightbulb,
  PanelLeft,
  Pencil,
  Plus,
  Search,
  SquarePen,
  Trash2,
  X,
} from 'lucide-react';
import CustomDropdown from '../../dropdown/CustomDropdown.jsx';
import AiStoreConfirmModal from '../../../pages/user/aistore/components/AiStoreConfirmModal.jsx';
import UserAccountMenu from '../UserAccountMenu.jsx';
import UserServiceSwitcher from '../UserServiceSwitcher.jsx';

// 목업 데이터: 실제 API 연동 시 부모 컴포넌트에서 전달할 수 있습니다.
const defaultProjects = [
  { id: 'brand-renewal', title: '브랜드 리뉴얼' },
  { id: 'product-planning', title: '신규 서비스 기획' },
];

const defaultProjectChats = {
  'brand-renewal': [
    { id: 'brand-login', title: '로그인 회원가입 화면 만들기' },
    { id: 'brand-menu', title: '시스템 운영 메뉴 구성' },
    { id: 'brand-roles', title: '페이지 역할 구분' },
    { id: 'brand-policy', title: '등록 심사 정책 구성' },
    { id: 'brand-icons', title: '아이콘 제작' },
    { id: 'brand-colors', title: '브랜드 컬러 정리' },
    { id: 'brand-copy', title: '서비스 문구 작성' },
  ],
  'product-planning': [
    { id: 'product-target', title: '핵심 사용자 정의' },
    { id: 'product-features', title: '주요 기능 우선순위' },
    { id: 'product-flow', title: '사용자 흐름 설계' },
    { id: 'product-roadmap', title: '출시 로드맵 정리' },
  ],
};

const defaultChats = [
  { id: 'admin-sidebar', title: '관리자 사이드바 변경' },
  { id: 'blue-version', title: '파란색 버전 제작' },
  { id: 'folder-recommendation', title: '폴더명 추천' },
  { id: 'routing-404', title: 'Vercel 라우팅 404 해결' },
  { id: 'code-structure', title: '코드 구조 설명' },
  { id: 'screen-layout', title: '온담 화면 구성 정리' },
  { id: 'brand-strategy', title: '브랜드 전략 정리' },
  { id: 'site-analysis', title: '사이트 분석 request' },
  { id: 'character-names', title: 'AI 캐릭터 명칭 비교' },
  { id: 'text-extraction', title: '텍스트 추출 코드 작성' },
  { id: 'logo-design', title: '로고 만들기' },
  { id: 'landing-copy', title: '랜딩 페이지 문구 정리' },
];

const CHAT_STORAGE_KEY = 'ondam-chat-changes';
const PROJECT_STORAGE_KEY = 'ondam-projects';
const EMPTY_CHAT_CHANGES = { renamed: {}, deletedIds: [] };
const PROJECT_MEMORY_OPTIONS = [
  { value: 'default', label: '기본 메모리' },
  { value: 'project-only', label: '프로젝트 전용 메모리' },
];

// 채팅 ID가 같은 항목이 최근/프로젝트 양쪽에 나타날 수 있으므로 편집 위치를 구분합니다.
const getChatRowKey = (chatId, projectId = null) => `${projectId ?? 'recent'}:${chatId}`;

function getMenuPosition(event, menuHeight = 100) {
  const rect = event.currentTarget.getBoundingClientRect();
  const menuWidth = 192;
  const spaceBelow = window.innerHeight - rect.bottom;
  const preferredTop = spaceBelow >= menuHeight + 12 ? rect.bottom + 4 : rect.top - menuHeight - 4;

  return {
    top: Math.max(8, Math.min(preferredTop, window.innerHeight - menuHeight - 8)),
    left: Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)),
  };
}

function MenuButton({ icon: Icon, label, isActive = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[14px] transition-colors ${
        isActive ? 'bg-[#e8e8e8] text-[#0d0d0d]' : 'text-[#202020] hover:bg-[#ececec]'
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function ProjectCreateModal({ projectName, onProjectNameChange, onClose, onCreate }) {
  const [memoryMode, setMemoryMode] = useState('default');

  useEffect(() => {
    const closeOnEscape = event => {
      if (event.key === 'Escape' && !event.defaultPrevented) onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  const submitProject = event => {
    event.preventDefault();
    onCreate(memoryMode);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-black/20 px-4 py-8 backdrop-blur-[1px]"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={submitProject}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-create-title"
        className="w-full max-w-[514px] rounded-2xl bg-white p-4 shadow-[0_18px_60px_rgba(0,0,0,0.2)] sm:p-[18px]"
      >
        <header className="flex items-center justify-between gap-4">
          <h2 id="project-create-title" className="text-[19px] font-semibold text-[#202020]">
            프로젝트 만들기
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#444] hover:bg-[#f1f1f1]"
            aria-label="프로젝트 만들기 닫기"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </header>

        <label
          htmlFor="new-project-name"
          className="mt-5 block text-[13px] font-medium text-[#333]"
        >
          프로젝트 이름
        </label>
        <div className="mt-2 flex h-10 items-center gap-2.5 rounded-lg border border-[#dedede] px-3 focus-within:border-[#9db9f4] focus-within:ring-2 focus-within:ring-[#eaf1ff]">
          <Folder className="h-[18px] w-[18px] shrink-0 text-[#333]" strokeWidth={1.7} />
          <input
            id="new-project-name"
            autoFocus
            value={projectName}
            onChange={event => onProjectNameChange(event.target.value)}
            placeholder="예:  온담 프로젝트"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[#222] outline-none placeholder:text-[#999]"
          />
        </div>

        <div className="mt-4 flex gap-3 rounded-xl bg-[#f1f1f1] px-3 py-3 text-[#555]">
          <Lightbulb className="mt-0.5 h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
          <p className="text-[12px] leading-[17px]">
            프로젝트는 채팅, 파일, 사용자 지정 지침을 한 자리에 모아 둡니다. 이러한 자료를 진행 중인
            작업에 사용하거나 깔끔하게 정리하는 용도로 활용하세요.
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <CustomDropdown
            value={memoryMode}
            options={PROJECT_MEMORY_OPTIONS}
            onChange={setMemoryMode}
            ariaLabel="프로젝트 메모리 설정"
            className="w-[190px] [&>button]:min-h-10 [&>button]:border-0 [&>button]:bg-transparent [&>button]:px-3 [&>button]:text-[14px] [&>button]:shadow-none [&>button]:hover:bg-[#f3f3f3] [&>button]:focus:ring-0"
            menuClassName="bottom-[calc(100%+4px)] mt-0"
          />

          <button
            type="submit"
            disabled={!projectName.trim()}
            className="h-10 shrink-0 rounded-full bg-[#202020] px-5 text-[14px] font-semibold text-white transition hover:bg-[#343434] disabled:bg-[#a7a7a7] disabled:text-[#f1f1f1]"
          >
            프로젝트 만들기
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

// 최근 대화와 프로젝트 내부 대화에서 공통 사용
function ConversationButton({
  chat,
  isActive,
  isMenuOpen,
  isEditing,
  editingTitle,
  onEditingTitleChange,
  onSaveRename,
  onCancelRename,
  onSelect,
  onOpenMenu,
  compact = false,
}) {
  return (
    <div
      className={`group relative flex h-9 items-center rounded-lg transition-colors ${
        isMenuOpen ? 'bg-[#e8e8e8]' : 'hover:bg-[#ececec]'
      }`}
    >
      {isEditing ? (
        <div className="flex h-full min-w-0 flex-1 items-center gap-1 px-1.5">
          <input
            autoFocus
            value={editingTitle}
            onChange={event => onEditingTitleChange(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') onSaveRename();
              if (event.key === 'Escape') onCancelRename();
            }}
            className="h-7 min-w-0 flex-1 rounded-md border border-[#bdd0f7] bg-white px-2 text-[13px] text-[#222] outline-none"
            aria-label="대화 이름 변경"
          />
          <button
            type="button"
            onClick={onSaveRename}
            disabled={!editingTitle.trim()}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#3c7cf6] hover:bg-[#dde9ff] disabled:opacity-40"
            aria-label="대화 이름 저장"
          >
            <Check className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onCancelRename}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#777] hover:bg-[#ddd]"
            aria-label="대화 이름 변경 취소"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onSelect?.(chat)}
            className={`flex h-9 min-w-0 flex-1 items-center rounded-lg px-2.5 pr-9 text-left transition-colors ${
              compact ? 'text-[13px]' : 'text-[14px]'
            } ${isActive ? 'bg-[#e8e8e8] text-[#0d0d0d]' : 'text-[#303030]'}`}
            aria-current={isActive ? 'page' : undefined}
            title={chat.title}
          >
            <span className="min-w-0 truncate">{chat.title}</span>
          </button>

          <button
            type="button"
            data-chat-menu-trigger
            onClick={event => onOpenMenu(event, chat)}
            className={`absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-[#555] transition-opacity hover:bg-[#dcdcdc] focus-visible:opacity-100 ${
              isMenuOpen
                ? 'bg-[#dedede] opacity-100'
                : isActive
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
            }`}
            aria-label={`${chat.title} 메뉴`}
            aria-expanded={isMenuOpen}
            title="대화 메뉴"
          >
            <Ellipsis className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

export function OndamSidebarRail({ onOpen, onNewChat }) {
  return (
    <aside
      className="flex h-dvh w-12 flex-col border-r border-black/5 bg-white text-[#0d0d0d]"
      aria-label="접힌 ONDAM AI 채팅 메뉴"
    >
      <div className="flex flex-1 flex-col items-center gap-2 py-3">
        <button
          type="button"
          onClick={onOpen}
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#ececec]"
          aria-label="사이드바 열기"
          title="사이드바 열기"
        >
          <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onNewChat?.(null)}
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#ececec]"
          aria-label="새 채팅"
          title="새 채팅"
        >
          <SquarePen className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div className="flex justify-center border-t border-black/5 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e3e3e3] text-[11px] font-semibold text-[#4b4b4b]">
          ON
        </span>
      </div>
    </aside>
  );
}

export default function OndamSidebar({
  chats = defaultChats,
  projects = defaultProjects,
  // 프로젝트별 채팅 목록을 외부에서도 주입할 수 있도록 확장
  projectChats = defaultProjectChats,
  activeChatId = 'admin-sidebar',
  user = {
    name: 'rex307',
    email: 'rex307@ondam.ai',
    plan: 'Plus',
    remainingCredits: 50000,
    totalCredits: 1000000,
  },
  onNewChat,
  onSelectChat,
  onSelectProject,
  onSelectMenu,
  onRenameChat, // (chatId, newTitle, projectId) => void
  onDeleteChat, // (chatId, projectId) => void
  onClose,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(true);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [showAllProjectChats, setShowAllProjectChats] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [query, setQuery] = useState('');

  const [projectItems, setProjectItems] = useState(() => {
    try {
      const savedProjects = window.localStorage.getItem(PROJECT_STORAGE_KEY);
      const parsedProjects = savedProjects ? JSON.parse(savedProjects) : null;
      return Array.isArray(parsedProjects) ? parsedProjects : projects;
    } catch {
      return projects;
    }
  });

  // 최근 대화와 프로젝트 대화에 공통으로 적용되는 이름 변경 / 삭제 기록
  const [chatChanges, setChatChanges] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(CHAT_STORAGE_KEY) || 'null');
      return {
        renamed:
          saved?.renamed && typeof saved.renamed === 'object' && !Array.isArray(saved.renamed)
            ? saved.renamed
            : {},
        deletedIds: Array.isArray(saved?.deletedIds) ? saved.deletedIds : [],
      };
    } catch {
      return EMPTY_CHAT_CHANGES;
    }
  });

  const [openProjectMenuId, setOpenProjectMenuId] = useState(null);
  const [projectMenuPosition, setProjectMenuPosition] = useState({ top: 0, left: 0 });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const projectMenuRef = useRef(null);

  const [openChatMenu, setOpenChatMenu] = useState(null); // { id, projectId }
  const [chatMenuPosition, setChatMenuPosition] = useState({ top: 0, left: 0 });
  const [editingChat, setEditingChat] = useState(null); // { id, projectId }
  const [editingChatTitle, setEditingChatTitle] = useState('');
  const [pendingDeletion, setPendingDeletion] = useState(null); // { type, item, projectId? }
  const chatMenuRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectItems));
  }, [projectItems]);

  useEffect(() => {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatChanges));
  }, [chatChanges]);

  // 프로젝트 메뉴 및 대화 메뉴 공통: 바깥 클릭 / ESC / 스크롤 시 닫기
  useEffect(() => {
    if (!openProjectMenuId && !openChatMenu) return undefined;

    const closeOnOutsideClick = event => {
      const isTrigger = event.target.closest?.(
        '[data-project-menu-trigger], [data-chat-menu-trigger]'
      );
      if (isTrigger) return;

      if (
        !projectMenuRef.current?.contains(event.target) &&
        !chatMenuRef.current?.contains(event.target)
      ) {
        setOpenProjectMenuId(null);
        setOpenChatMenu(null);
      }
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setOpenProjectMenuId(null);
        setOpenChatMenu(null);
      }
    };
    const closeOnScroll = () => {
      setOpenProjectMenuId(null);
      setOpenChatMenu(null);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('scroll', closeOnScroll, true);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('scroll', closeOnScroll, true);
    };
  }, [openProjectMenuId, openChatMenu]);

  const filteredChats = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
    return chats
      .filter(chat => !chatChanges.deletedIds.includes(chat.id))
      .map(chat => ({ ...chat, title: chatChanges.renamed[chat.id] ?? chat.title }))
      .filter(chat =>
        normalizedQuery ? chat.title.toLocaleLowerCase('ko-KR').includes(normalizedQuery) : true
      );
  }, [chats, chatChanges, query]);

  const handleNewChat = (projectId = null) => {
    setQuery('');
    setIsSearchOpen(false);
    setOpenProjectMenuId(null);
    setOpenChatMenu(null);

    if (projectId) {
      setIsProjectsOpen(true);
      setExpandedProjectId(projectId);
      setShowAllProjectChats(false);
    }

    const project = projectId ? (projectItems.find(item => item.id === projectId) ?? null) : null;
    const chatsInProject = projectId
      ? (projectChats[projectId] ?? [])
          .filter(chat => !chatChanges.deletedIds.includes(chat.id))
          .map(chat => ({
            ...chat,
            title: chatChanges.renamed[chat.id] ?? chat.title,
          }))
      : [];

    onNewChat?.(projectId, project, chatsInProject);
  };

  const openProjectHome = project => {
    const chatsInProject = (projectChats[project.id] ?? [])
      .filter(chat => !chatChanges.deletedIds.includes(chat.id))
      .map(chat => ({
        ...chat,
        title: chatChanges.renamed[chat.id] ?? chat.title,
      }));

    setIsProjectsOpen(true);
    setExpandedProjectId(project.id);
    setShowAllProjectChats(false);
    setOpenProjectMenuId(null);
    setOpenChatMenu(null);
    onSelectProject?.(project, chatsInProject);
  };

  // ----- 프로젝트 이름 변경 / 삭제 -----
  const openProjectMenu = (event, projectId) => {
    event.stopPropagation();
    setOpenChatMenu(null);

    if (openProjectMenuId === projectId) {
      setOpenProjectMenuId(null);
      return;
    }

    setProjectMenuPosition(getMenuPosition(event));
    setOpenProjectMenuId(projectId);
  };

  const startRenameProject = project => {
    setEditingProjectId(project.id);
    setEditingProjectName(project.title);
    setOpenProjectMenuId(null);
  };

  const cancelRenameProject = () => {
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  const saveRenameProject = () => {
    const title = editingProjectName.trim();
    if (!title || !editingProjectId) return;

    setProjectItems(current =>
      current.map(project => (project.id === editingProjectId ? { ...project, title } : project))
    );
    cancelRenameProject();
  };

  const deleteProject = project => {
    setOpenProjectMenuId(null);
    setPendingDeletion({ type: 'project', item: project });
  };

  const confirmProjectDeletion = project => {
    const wasActiveProject = expandedProjectId === project.id;

    setProjectItems(current => current.filter(item => item.id !== project.id));
    if (wasActiveProject) {
      setExpandedProjectId(null);
      onNewChat?.(null, null, []);
    }
    if (editingProjectId === project.id) cancelRenameProject();
  };

  const addProject = (memoryMode = 'default') => {
    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    const newProject = { id: `project-${Date.now()}`, title: trimmedName, memoryMode };
    setProjectItems(current => [...current, newProject]);
    setProjectName('');
    setIsAddingProject(false);
    setIsProjectsOpen(true);
    setExpandedProjectId(newProject.id);
    setShowAllProjectChats(false);
    onSelectProject?.(newProject, []);
  };

  const cancelAddProject = () => {
    setProjectName('');
    setIsAddingProject(false);
  };

  // ----- 최근 대화 / 프로젝트 대화 공통 이름 변경 / 삭제 -----
  const openConversationMenu = (event, chat, projectId = null) => {
    event.stopPropagation();
    setOpenProjectMenuId(null);

    const sameMenu = openChatMenu?.id === chat.id && openChatMenu?.projectId === projectId;
    if (sameMenu) {
      setOpenChatMenu(null);
      return;
    }

    setChatMenuPosition(getMenuPosition(event));
    setOpenChatMenu({ id: chat.id, projectId });
  };

  const startRenameChat = (chat, projectId) => {
    setEditingChat({ id: chat.id, projectId });
    setEditingChatTitle(chat.title);
    setOpenChatMenu(null);
  };

  const cancelRenameChat = () => {
    setEditingChat(null);
    setEditingChatTitle('');
  };

  const saveRenameChat = () => {
    const title = editingChatTitle.trim();
    if (!title || !editingChat) return;

    const { id, projectId } = editingChat;
    setChatChanges(current => ({
      ...current,
      renamed: { ...current.renamed, [id]: title },
    }));
    onRenameChat?.(id, title, projectId);
    cancelRenameChat();
  };

  const deleteChat = (chat, projectId = null) => {
    setOpenChatMenu(null);
    setPendingDeletion({ type: 'chat', item: chat, projectId });
  };

  const confirmChatDeletion = (chat, projectId = null) => {
    setChatChanges(current => ({
      renamed: Object.fromEntries(
        Object.entries(current.renamed).filter(([id]) => id !== String(chat.id))
      ),
      deletedIds: current.deletedIds.includes(chat.id)
        ? current.deletedIds
        : [...current.deletedIds, chat.id],
    }));

    if (editingChat?.id === chat.id) cancelRenameChat();
    onDeleteChat?.(chat.id, projectId);

    // 현재 보고 있던 대화를 삭제했다면 새 채팅 화면으로 이동
    if (activeChatId === chat.id) handleNewChat(projectId);
  };

  const confirmDeletion = () => {
    if (!pendingDeletion) return;

    if (pendingDeletion.type === 'project') {
      confirmProjectDeletion(pendingDeletion.item);
    } else {
      confirmChatDeletion(pendingDeletion.item, pendingDeletion.projectId);
    }

    setPendingDeletion(null);
  };

  // 같은 대화가 최근 목록에도 보이는 경우 편집 상태는 해당 위치에서만 적용
  const isEditingRow = (chatId, projectId = null) =>
    editingChat &&
    getChatRowKey(editingChat.id, editingChat.projectId) === getChatRowKey(chatId, projectId);

  const isChatMenuOpen = (chatId, projectId = null) =>
    openChatMenu?.id === chatId && openChatMenu?.projectId === projectId;

  const activeMenuChat = openChatMenu
    ? [...chats, ...(projectChats[openChatMenu.projectId] ?? [])].find(
        chat => chat.id === openChatMenu.id
      )
    : null;
  const menuChat = activeMenuChat && {
    ...activeMenuChat,
    title: chatChanges.renamed[activeMenuChat.id] ?? activeMenuChat.title,
  };

  return (
    <aside
      className="flex h-dvh w-[292px] shrink-0 flex-col border-r border-black/5 bg-white text-[#0d0d0d]"
      aria-label="ONDAM AI 채팅 메뉴"
    >
      <header className="flex h-14 shrink-0 items-center gap-1 px-3">
        <UserServiceSwitcher />

        <button
          type="button"
          onClick={() => setIsSearchOpen(value => !value)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#404040] hover:bg-[#ececec]"
          aria-label="채팅 검색"
          aria-expanded={isSearchOpen}
          title="채팅 검색"
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#404040] hover:bg-[#ececec]"
          aria-label="사이드바 닫기"
          title="사이드바 닫기"
        >
          <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </header>

      <div className="px-2 pb-2">
        {isSearchOpen && (
          <div className="relative mb-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="채팅 검색"
              className="h-9 w-full rounded-lg border border-[#d9d9d9] bg-white pl-8 pr-8 text-[13px] outline-none placeholder:text-[#999] focus:border-[#aaa]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md hover:bg-[#eee]"
                aria-label="검색어 지우기"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <MenuButton
          icon={SquarePen}
          label="새 채팅"
          isActive={!activeChatId}
          onClick={() => handleNewChat()}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 [scrollbar-color:#d8d8d8_transparent] [scrollbar-width:thin]">
        {/* 프로젝트 */}
        <section className="pt-3" aria-labelledby="ondam-projects-heading">
          <div className="group flex h-8 items-center rounded-lg px-1 hover:bg-[#ececec]">
            <button
              type="button"
              onClick={() => setIsProjectsOpen(value => !value)}
              className="flex h-full min-w-0 flex-1 items-center gap-1 px-1.5 text-left text-[12px] font-medium text-[#777] hover:text-[#3d3d3d]"
              aria-expanded={isProjectsOpen}
            >
              <span id="ondam-projects-heading">프로젝트</span>
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform ${isProjectsOpen ? 'rotate-90' : ''}`}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingProject(true);
                setIsProjectsOpen(true);
              }}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[#777] opacity-0 hover:bg-[#ddd] hover:text-[#303030] focus:opacity-100 group-hover:opacity-100"
              aria-label="프로젝트 추가"
              title="프로젝트 추가"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {isProjectsOpen && (
            <div className="mt-0.5 space-y-0.5">
              {projectItems.map(project => {
                const isExpanded = expandedProjectId === project.id;
                const projectChatItems = (projectChats[project.id] ?? [])
                  .filter(chat => !chatChanges.deletedIds.includes(chat.id))
                  .map(chat => ({
                    ...chat,
                    title: chatChanges.renamed[chat.id] ?? chat.title,
                  }));
                const visibleProjectChats = showAllProjectChats
                  ? projectChatItems
                  : projectChatItems.slice(0, 5);

                return (
                  <div key={project.id}>
                    <div
                      className={`group relative flex h-9 items-center rounded-lg transition-colors ${
                        openProjectMenuId === project.id ? 'bg-[#ececec]' : 'hover:bg-[#ececec]'
                      }`}
                    >
                      {editingProjectId === project.id ? (
                        <div className="flex min-w-0 flex-1 items-center gap-1 px-2">
                          <Folder className="h-4 w-4 shrink-0 text-[#555]" strokeWidth={1.7} />
                          <input
                            autoFocus
                            value={editingProjectName}
                            onChange={event => setEditingProjectName(event.target.value)}
                            onKeyDown={event => {
                              if (event.key === 'Enter') saveRenameProject();
                              if (event.key === 'Escape') cancelRenameProject();
                            }}
                            className="h-7 min-w-0 flex-1 rounded border border-[#bdd0f7] bg-white px-1.5 text-[13px] outline-none"
                            aria-label="프로젝트 이름 변경"
                          />
                          <button
                            type="button"
                            onClick={saveRenameProject}
                            disabled={!editingProjectName.trim()}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#3c7cf6] hover:bg-[#dde9ff] disabled:opacity-40"
                            aria-label="프로젝트 이름 저장"
                          >
                            <Check className="h-4 w-4" strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelRenameProject}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#777] hover:bg-[#ddd]"
                            aria-label="프로젝트 이름 변경 취소"
                          >
                            <X className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              openProjectHome(project);
                            }}
                            className="flex h-full min-w-0 flex-1 items-center gap-2 rounded-lg pl-2.5 pr-1 text-left text-[13px] text-[#303030]"
                            aria-current={isExpanded ? 'page' : undefined}
                            title={project.title}
                          >
                            <Folder
                              className="h-4 w-4 shrink-0"
                              strokeWidth={1.7}
                              aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1 truncate">{project.title}</span>
                          </button>

                          <button
                            type="button"
                            data-project-menu-trigger
                            onClick={event => openProjectMenu(event, project.id)}
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#666] transition-opacity hover:bg-[#dcdcdc] focus-visible:opacity-100 ${
                              openProjectMenuId === project.id
                                ? 'bg-[#e0e0e0] opacity-100'
                                : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                            }`}
                            aria-label={`${project.title} 메뉴`}
                            aria-expanded={openProjectMenuId === project.id}
                            title="프로젝트 메뉴"
                          >
                            <Ellipsis className="h-4 w-4" strokeWidth={1.8} />
                          </button>

                          <button
                            type="button"
                            onClick={event => {
                              event.stopPropagation();
                              handleNewChat(project.id);
                            }}
                            className="mr-1.5 grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#666] opacity-0 transition-opacity hover:bg-[#dcdcdc] focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
                            aria-label={`${project.title}에서 새 채팅`}
                            title="프로젝트에서 새 채팅"
                          >
                            <SquarePen className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                        </>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mb-1 ml-7 mt-0.5 space-y-0.5 border-l border-[#e5e5e5] pl-2">
                        {visibleProjectChats.map(chat => (
                          <ConversationButton
                            key={chat.id}
                            chat={chat}
                            compact
                            isActive={chat.id === activeChatId}
                            isMenuOpen={isChatMenuOpen(chat.id, project.id)}
                            isEditing={isEditingRow(chat.id, project.id)}
                            editingTitle={editingChatTitle}
                            onEditingTitleChange={setEditingChatTitle}
                            onSaveRename={saveRenameChat}
                            onCancelRename={cancelRenameChat}
                            onSelect={chat => onSelectChat?.(chat, project)}
                            onOpenMenu={(event, item) =>
                              openConversationMenu(event, item, project.id)
                            }
                          />
                        ))}

                        {projectChatItems.length === 0 && (
                          <p className="px-2.5 py-2 text-[12px] text-[#999]">
                            아직 채팅 내역이 없습니다.
                          </p>
                        )}

                        {projectChatItems.length > 5 && (
                          <button
                            type="button"
                            onClick={() => setShowAllProjectChats(value => !value)}
                            className="h-8 w-full rounded-lg px-2.5 text-left text-[12px] text-[#777] hover:bg-[#ececec] hover:text-[#333]"
                          >
                            {showAllProjectChats ? '접기' : '더 보기'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 최근 대화 */}
        <section className="pt-5" aria-labelledby="ondam-recent-heading">
          <button
            type="button"
            onClick={() => setIsRecentOpen(value => !value)}
            className="mb-1 flex h-8 w-full items-center gap-1 rounded-lg px-2.5 text-left text-[12px] font-medium text-[#777] hover:bg-[#ececec] hover:text-[#3d3d3d]"
            aria-expanded={isRecentOpen}
          >
            <span id="ondam-recent-heading">최근</span>
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${isRecentOpen ? 'rotate-90' : ''}`}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>

          {isRecentOpen && (
            <div className="space-y-0.5">
              {filteredChats.map(chat => (
                <ConversationButton
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChatId}
                  isMenuOpen={isChatMenuOpen(chat.id)}
                  isEditing={isEditingRow(chat.id)}
                  editingTitle={editingChatTitle}
                  onEditingTitleChange={setEditingChatTitle}
                  onSaveRename={saveRenameChat}
                  onCancelRename={cancelRenameChat}
                  onSelect={onSelectChat}
                  onOpenMenu={openConversationMenu}
                />
              ))}
              {filteredChats.length === 0 && (
                <p className="px-2.5 py-5 text-center text-[12px] text-[#999]">
                  일치하는 채팅이 없습니다.
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="shrink-0 border-t border-black/5 p-2">
        <UserAccountMenu user={user} onAction={onSelectMenu} />
      </div>

      {isAddingProject && (
        <ProjectCreateModal
          projectName={projectName}
          onProjectNameChange={setProjectName}
          onClose={cancelAddProject}
          onCreate={addProject}
        />
      )}

      <AiStoreConfirmModal
        open={Boolean(pendingDeletion)}
        title={pendingDeletion?.type === 'project' ? '프로젝트 삭제' : '대화 삭제'}
        confirmLabel="삭제"
        cancelLabel="취소"
        onClose={() => setPendingDeletion(null)}
        onConfirm={confirmDeletion}
      >
        <p>
          <strong className="font-semibold text-slate-900">{pendingDeletion?.item.title}</strong>
          {pendingDeletion?.type === 'project'
            ? ' 프로젝트와 포함된 대화를 삭제할까요? 이 작업은 되돌릴 수 없습니다.'
            : ' 대화를 삭제할까요? 이 작업은 되돌릴 수 없습니다.'}
        </p>
      </AiStoreConfirmModal>

      {/* 프로젝트 메뉴: 스크롤 영역 밖 Portal로 표시 */}
      {openProjectMenuId &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={projectMenuRef}
            className="fixed z-[100] w-48 rounded-xl border border-[#e5e5e5] bg-white p-1.5 shadow-[0_8px_26px_rgba(0,0,0,0.14)]"
            style={{ top: projectMenuPosition.top, left: projectMenuPosition.left }}
            role="menu"
            aria-label="프로젝트 메뉴"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const project = projectItems.find(item => item.id === openProjectMenuId);
                if (project) openProjectHome(project);
              }}
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-[#333] hover:bg-[#f3f3f3]"
            >
              <House className="h-4 w-4" strokeWidth={1.75} />
              프로젝트 홈
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const project = projectItems.find(item => item.id === openProjectMenuId);
                if (project) startRenameProject(project);
              }}
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-[#333] hover:bg-[#f3f3f3]"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
              이름 변경
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const project = projectItems.find(item => item.id === openProjectMenuId);
                if (project) deleteProject(project);
              }}
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-[#d93025] hover:bg-[#fff1f0]"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              프로젝트 삭제
            </button>
          </div>,
          document.body
        )}

      {/* 최근/프로젝트 대화 메뉴: 동일한 이름 변경·삭제 기능 */}
      {openChatMenu &&
        menuChat &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={chatMenuRef}
            className="fixed z-[100] w-48 rounded-xl border border-[#e5e5e5] bg-white p-1.5 shadow-[0_8px_26px_rgba(0,0,0,0.14)]"
            style={{ top: chatMenuPosition.top, left: chatMenuPosition.left }}
            role="menu"
            aria-label={`${menuChat.title} 메뉴`}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => startRenameChat(menuChat, openChatMenu.projectId)}
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-[#333] hover:bg-[#f3f3f3]"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
              이름 변경
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => deleteChat(menuChat, openChatMenu.projectId)}
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-[#d93025] hover:bg-[#fff1f0]"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              대화 삭제
            </button>
          </div>,
          document.body
        )}
    </aside>
  );
}
