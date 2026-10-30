import { useRef, useState } from 'react';
import {
  ArrowUp,
  AudioLines,
  Check,
  Ellipsis,
  FileText,
  Folder,
  Mic,
  Plus,
  Share2,
  Upload,
} from 'lucide-react';

import ModelSelector from './ModelSelector.jsx';

const chatDescriptions = {
  'brand-login': '그리고 캐릭터를 저 온담 ai 위에다 두는거지',
  'brand-menu': '근데 뭔가 다른 페이지들에 있는 것들인데 흐름을 정리해줘',
  'brand-roles': 'CSO 분류 관리 사용자 온담쪽에 필요한 역할을 구분해줘',
  'brand-policy': '이거 코덱스에 옮기게 한 프롬프트로 정리해줘',
  'brand-icons': '이런 느낌으로 만들어야지 파란색으로 그리고 스타일은 소소하게',
  'brand-colors': '근데 저 버튼 2개 바로 보이면 좀 별로라 위치를 추천해줘',
  'brand-copy': '채팅 입력하면 채팅 화면 전환 애니메이션과 문구를 정리해줘',
};

function ProjectComposer({ projectName, onSubmit }) {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);

  const submitPrompt = event => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    onSubmit?.(trimmedPrompt);
    setPrompt('');
  };

  return (
    <form
      onSubmit={submitPrompt}
      className="flex min-h-[58px] w-full items-center rounded-[30px] border border-[#dedede] bg-white p-1.5 pl-2 shadow-[0_3px_16px_rgba(0,0,0,0.07)] transition-shadow focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
    >
      <input ref={fileInputRef} type="file" className="hidden" multiple />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#303030] hover:bg-[#f0f0f0]"
        aria-label="파일 첨부"
      >
        <Plus className="h-5 w-5" strokeWidth={1.8} />
      </button>
      <input
        autoFocus
        value={prompt}
        onChange={event => setPrompt(event.target.value)}
        className="min-w-0 flex-1 bg-transparent px-1.5 text-[15px] text-[#222] outline-none placeholder:text-[#999]"
        placeholder={`${projectName}의 새 채팅`}
        aria-label={`${projectName} 프로젝트에 메시지 보내기`}
      />
      <div className="hidden shrink-0 sm:block">
        <ModelSelector />
      </div>
      <button
        type="button"
        onClick={() => setIsListening(value => !value)}
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors ${
          isListening ? 'bg-[#fee9e7] text-[#d93025]' : 'text-[#303030] hover:bg-[#f0f0f0]'
        }`}
        aria-label={isListening ? '음성 입력 중지' : '음성 입력'}
        aria-pressed={isListening}
      >
        <Mic className="h-[19px] w-[19px]" strokeWidth={1.8} />
      </button>
      <button
        type={prompt.trim() ? 'submit' : 'button'}
        onClick={!prompt.trim() ? () => setIsListening(value => !value) : undefined}
        className="ml-1.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#3c7cf6] text-white transition hover:bg-[#2f6fe8]"
        aria-label={prompt.trim() ? '메시지 보내기' : '음성 대화 시작'}
      >
        {prompt.trim() ? (
          <ArrowUp className="h-[19px] w-[19px]" strokeWidth={2} />
        ) : (
          <AudioLines className="h-[19px] w-[19px]" strokeWidth={2} />
        )}
      </button>
    </form>
  );
}

export default function ProjectHomeView({ project, chats = [], onSubmit, onSelectChat }) {
  const [activeTab, setActiveTab] = useState('chats');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const sourceInputRef = useRef(null);

  const shareProject = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1400);
  };

  return (
    <section className="h-full overflow-y-auto bg-white">
      <div className="mx-auto w-full max-w-[940px] px-5 pb-16 pt-7 sm:px-8 sm:pt-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Folder className="h-7 w-7 shrink-0 text-[#171717]" strokeWidth={1.7} />
            <h1 className="truncate text-[24px] font-semibold tracking-[-0.025em] text-[#111]">
              {project.title}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={shareProject}
              className="flex h-10 items-center gap-2 rounded-full border border-[#e4e4e4] px-4 text-[14px] text-[#272727] transition hover:bg-[#f7f7f7]"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-[#268a4b]" strokeWidth={2} />
              ) : (
                <Share2 className="h-4 w-4" strokeWidth={1.8} />
              )}
              <span>{isCopied ? '복사됨' : '공유'}</span>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreOpen(value => !value)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#e4e4e4] text-[#333] transition hover:bg-[#f7f7f7]"
                aria-label="프로젝트 더보기"
                aria-expanded={isMoreOpen}
              >
                <Ellipsis className="h-5 w-5" strokeWidth={1.8} />
              </button>
              {isMoreOpen && (
                <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-[#e7e7e7] bg-white p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.13)]">
                  <button
                    type="button"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-[#333] hover:bg-[#f3f3f3]"
                  >
                    <Folder className="h-4 w-4" strokeWidth={1.7} />
                    프로젝트 세부정보
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="mt-7">
          <ProjectComposer projectName={project.title} onSubmit={onSubmit} />
        </div>

        <div className="mt-7 flex items-center gap-1" role="tablist">
          {[
            { id: 'chats', label: '채팅' },
            { id: 'sources', label: '소스' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-[14px] transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#f1f1f1] font-medium text-[#111]'
                  : 'text-[#666] hover:bg-[#f7f7f7] hover:text-[#333]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'chats' ? (
          <div className="divide-y divide-[#eeeeee]">
            {chats.map((chat, index) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelectChat?.(chat, project)}
                className="group flex w-full items-center gap-5 py-4 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-[#202020] group-hover:text-[#2f6fe8]">
                    {chat.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[14px] text-[#666]">
                    {chatDescriptions[chat.id] ?? `${chat.title}에 관한 대화 내용입니다.`}
                  </span>
                </span>
                <span className="shrink-0 text-[12px] tabular-nums text-[#999]">
                  10월 {Math.max(21, 29 - index)}일
                </span>
              </button>
            ))}
            {chats.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-[14px] text-[#777]">아직 프로젝트 채팅이 없습니다.</p>
                <p className="mt-1 text-[13px] text-[#aaa]">
                  위 입력창에서 새 채팅을 시작해 보세요.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <input ref={sourceInputRef} type="file" multiple className="hidden" />
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f3f5f8] text-[#677080]">
              <FileText className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <p className="mt-4 text-[14px] font-medium text-[#333]">프로젝트 소스가 없습니다.</p>
            <p className="mt-1 text-[13px] text-[#888]">
              파일을 추가하면 프로젝트 대화에서 함께 활용할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => sourceInputRef.current?.click()}
              className="mt-4 flex h-9 items-center gap-2 rounded-full border border-[#dedede] px-4 text-[13px] text-[#333] hover:bg-[#f7f7f7]"
            >
              <Upload className="h-4 w-4" strokeWidth={1.8} />
              소스 추가
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
