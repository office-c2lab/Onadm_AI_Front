import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  AudioLines,
  Check,
  Copy,
  Lightbulb,
  ListChecks,
  MessageCircleQuestion,
  Mic,
  Plus,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';

import GamgikAgentOrbWithFace from '../../../../components/character/GamgikAgentOrbWithFace.jsx';
import ModelSelector from './ModelSelector.jsx';

const companionActions = [
  {
    id: 'summarize',
    icon: ListChecks,
    label: '핵심만 요약',
    prompt: '방금 답변의 핵심만 간단히 요약해줘',
  },
  {
    id: 'simplify',
    icon: Lightbulb,
    label: '쉽게 설명',
    prompt: '방금 답변을 처음 접하는 사람도 이해할 수 있게 쉽게 설명해줘',
  },
  {
    id: 'next-step',
    icon: MessageCircleQuestion,
    label: '다음 단계 추천',
    prompt: '지금 대화를 바탕으로 다음에 해야 할 일을 추천해줘',
  },
];

const companionStates = {
  idle: {
    expression: 'idle',
    eyebrow: 'ONDAM 도우미',
    label: '이어서 무엇을 해볼까요?',
  },
  thinking: {
    expression: 'searching',
    eyebrow: '질문을 살펴보는 중',
    label: '필요한 내용을 찾고 있어요',
  },
  answering: {
    expression: 'idle',
    eyebrow: '답변 작성 중',
    label: '생각을 정리해서 전하고 있어요',
  },
  complete: {
    expression: 'happy',
    eyebrow: '답변 완료',
    label: '더 필요한 내용도 도와드릴게요',
  },
};

function ChatCompanion({ phase, onAction, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const state = companionStates[phase] ?? companionStates.idle;

  const runAction = prompt => {
    setIsOpen(false);
    onAction(prompt);
  };

  return (
    <div className="relative mb-2 flex justify-start">
      {isOpen && (
        <div
          className="absolute bottom-[68px] left-0 z-30 w-[min(340px,calc(100vw-40px))] rounded-2xl border border-[#e8e8e8] bg-white p-2 shadow-[0_12px_36px_rgba(0,0,0,0.13)]"
          aria-label="ONDAM 도우미 빠른 메뉴"
        >
          <div className="flex items-center gap-2 px-2 pb-2 pt-1 text-[12px] font-medium text-[#777]">
            <Sparkles className="h-3.5 w-3.5 text-[#3c7cf6]" aria-hidden="true" />
            현재 대화를 이렇게 이어갈 수 있어요
          </div>

          {companionActions.map(action => {
            const Icon = action.icon;

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => runAction(action.prompt)}
                className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] text-[#333] transition-colors hover:bg-[#f5f7fb]"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#3c7cf6]" strokeWidth={1.8} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(value => !value)}
        className={`group flex h-[58px] max-w-full items-center rounded-[20px] border px-2 pr-4 text-left shadow-[0_3px_14px_rgba(31,82,170,0.09)] transition-all ${
          phase === 'idle'
            ? 'border-[#e3e9f5] bg-[#f8faff] hover:-translate-y-0.5 hover:border-[#cad8f2] hover:shadow-[0_7px_20px_rgba(31,82,170,0.13)]'
            : 'cursor-default border-[#dce7fb] bg-[#f6f9ff]'
        } disabled:opacity-100`}
        aria-expanded={isOpen}
        aria-label={`${state.eyebrow}. ${state.label}${disabled ? '' : '. 빠른 메뉴 열기'}`}
      >
        <span
          className="relative -ml-1 h-[54px] w-[62px] shrink-0 overflow-visible"
          aria-hidden="true"
        >
          <span className="absolute left-1/2 top-1/2 h-[82px] w-[82px] -translate-x-1/2 -translate-y-1/2">
            <GamgikAgentOrbWithFace
              size={82}
              speed={phase === 'idle' ? 7 : 10}
              motion={phase === 'idle' ? 0.55 : 0.82}
              themeMode="light"
              expressionOverride={state.expression}
              trackPointer={false}
            />
          </span>
        </span>

        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#3c7cf6]">
            {state.eyebrow}
            {(phase === 'thinking' || phase === 'answering') && (
              <span className="flex gap-0.5" aria-hidden="true">
                <i className="h-1 w-1 animate-bounce rounded-full bg-[#3c7cf6] [animation-delay:-0.3s]" />
                <i className="h-1 w-1 animate-bounce rounded-full bg-[#3c7cf6] [animation-delay:-0.15s]" />
                <i className="h-1 w-1 animate-bounce rounded-full bg-[#3c7cf6]" />
              </span>
            )}
          </span>
          <span className="block truncate text-[13px] font-medium text-[#3a3a3a] sm:text-[14px]">
            {state.label}
          </span>
        </span>
      </button>
    </div>
  );
}

// 메시지 내용 출력
function MessageContent({ content, isStreaming = false }) {
  return content.split('\n').map((line, lineIndex) => (
    <p key={`${line}-${lineIndex}`} className={line ? 'min-h-6' : 'h-3'}>
      {line &&
        line.split(/(\*\*.*?\*\*)/g).map((part, partIndex) =>
          (part.startsWith('**') && part.endsWith('**')) ||
          (isStreaming && part.startsWith('**')) ? (
            <strong key={`${part}-${partIndex}`} className="font-semibold text-[#171717]">
              {part.endsWith('**') ? part.slice(2, -2) : part.slice(2)}
            </strong>
          ) : (
            <span key={`${part}-${partIndex}`}>{part}</span>
          )
        )}
      {isStreaming && lineIndex === content.split('\n').length - 1 && (
        <span
          className="ml-0.5 inline-block h-[18px] w-0.5 translate-y-[3px] animate-pulse rounded-full bg-[#777]"
          aria-hidden="true"
        />
      )}
    </p>
  ));
}

// 메시지 입력창
function Composer({ onSubmit, onStartVoice, disabled = false }) {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = event => {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    onSubmit(trimmedPrompt);
    setPrompt('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        flex min-h-[58px] w-full items-center
        rounded-[30px] border border-[#dedede]
        bg-white p-1.5 pl-2
        shadow-[0_2px_12px_rgba(0,0,0,0.08)]
        focus-within:shadow-[0_3px_16px_rgba(0,0,0,0.11)]
      "
    >
      {/* 파일 첨부 */}
      <input ref={fileInputRef} type="file" className="hidden" multiple />

      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        className="
          grid h-10 w-10 shrink-0 place-items-center
          rounded-full text-[#303030]
          hover:bg-[#f0f0f0]
        "
        aria-label="파일 첨부"
      >
        <Plus className="h-5 w-5" strokeWidth={1.8} />
      </button>

      {/* 메시지 입력 */}
      <input
        autoFocus
        disabled={disabled}
        value={prompt}
        onChange={event => setPrompt(event.target.value)}
        className="
          min-w-0 flex-1 bg-transparent px-1.5
          text-[15px] text-[#222] outline-none
          placeholder:text-[#888]
        "
        placeholder="메시지를 입력하세요"
        aria-label="메시지"
      />

      {/* AI 모델 선택 */}
      <div className="hidden sm:block">
        <ModelSelector />
      </div>

      {/* 음성 입력 */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsListening(value => !value)}
        className={`
          grid h-10 w-10 shrink-0 place-items-center
          rounded-full
          ${isListening ? 'bg-[#fee9e7] text-[#d93025]' : 'text-[#303030] hover:bg-[#f0f0f0]'}
        `}
        aria-label="음성 입력"
      >
        <Mic className="h-[19px] w-[19px]" strokeWidth={1.8} />
      </button>

      {/* 메시지 전송 / 음성 대화 */}
      <button
        type={prompt.trim() ? 'submit' : 'button'}
        disabled={disabled}
        onClick={!prompt.trim() ? onStartVoice : undefined}
        className="
          ml-1.5 grid h-10 w-10 shrink-0
          place-items-center rounded-full
          bg-[#3c7cf6] text-white
          hover:bg-[#2f6fe8] disabled:opacity-45
        "
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

// 채팅 화면
export default function ChatView({
  messages,
  onSubmit,
  onStartVoice,
  isResponding = false,
  isLoadingHistory = false,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const bottomRef = useRef(null);
  const wasRespondingRef = useRef(isResponding);

  const lastMessage = messages.at(-1);
  const isGenerating = isResponding && lastMessage?.role === 'user';
  const companionPhase = showCompletion
    ? 'complete'
    : isGenerating
      ? 'thinking'
      : isResponding
        ? 'answering'
        : 'idle';

  useEffect(() => {
    let startTimer;
    let completionTimer;

    if (wasRespondingRef.current && !isResponding) {
      startTimer = window.setTimeout(() => setShowCompletion(true), 0);
      completionTimer = window.setTimeout(() => setShowCompletion(false), 1800);
    } else if (isResponding) {
      startTimer = window.setTimeout(() => setShowCompletion(false), 0);
    }

    wasRespondingRef.current = isResponding;

    return () => {
      if (startTimer) window.clearTimeout(startTimer);
      if (completionTimer) window.clearTimeout(completionTimer);
    };
  }, [isResponding]);

  // 새 메시지가 추가되면 맨 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: lastMessage?.isStreaming ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [lastMessage, messages]);

  // 답변 복사
  const copyMessage = async message => {
    await navigator.clipboard?.writeText(message.content);

    setCopiedId(message.id);

    window.setTimeout(() => {
      setCopiedId(null);
    }, 1400);
  };

  return (
    <section
      className="
        relative flex h-full min-h-0 flex-col
        overflow-hidden bg-white
      "
    >
      {/* 이전 대화 로딩 */}
      {isLoadingHistory && (
        <div
          className="absolute inset-x-0 bottom-[100px] top-0 z-30 flex flex-col items-center justify-center bg-white pb-10"
          role="status"
          aria-live="polite"
          aria-label="이전 응답을 가져오고 있어요"
        >
          <div className="h-[300px] w-[340px] shrink-0 overflow-visible">
            <GamgikAgentOrbWithFace size={340} speed={10} motion={0.82} themeMode="light" />
          </div>

          <div className="mt-3 flex flex-col items-center gap-3 text-center">
            <p className="text-[18px] font-medium tracking-[-0.015em] text-[#333]">
              이전 응답을 가져오고 있어요
            </p>
            <span className="flex items-center gap-2" aria-hidden="true">
              <i className="h-2 w-2 animate-bounce rounded-full bg-[#3c7cf6] [animation-delay:-0.3s]" />
              <i className="h-2 w-2 animate-bounce rounded-full bg-[#3c7cf6] [animation-delay:-0.15s]" />
              <i className="h-2 w-2 animate-bounce rounded-full bg-[#3c7cf6]" />
            </span>
          </div>
        </div>
      )}

      {/* 채팅 메시지 영역 */}
      <div
        className="
          min-h-0 w-full flex-1 overflow-y-auto
          pb-56 pt-8

          [scrollbar-color:transparent_transparent]
          [scrollbar-width:thin]

          hover:[scrollbar-color:#d9d9d9_transparent]

          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-transparent

          hover:[&::-webkit-scrollbar-thumb]:bg-[#d9d9d9]
        "
      >
        <div className="mx-auto max-w-[780px] space-y-9 px-5 sm:px-8">
          {messages.map(message =>
            message.role === 'user' ? (
              // 사용자 메시지
              <div key={message.id} className="flex justify-end">
                <div
                  className="
                    max-w-[78%] rounded-[22px]
                    bg-[#3c7cf6] px-5 py-3
                    text-[16px] leading-7 text-white
                    shadow-[0_2px_8px_rgba(60,124,246,0.18)]
                  "
                >
                  {message.content}
                </div>
              </div>
            ) : (
              // AI 메시지
              <div key={message.id} className="group">
                <div className="min-w-0">
                  {/* AI 답변 */}
                  <div className="text-[16px] leading-7 text-[#303030]">
                    <MessageContent content={message.content} isStreaming={message.isStreaming} />
                  </div>

                  {/* AI 답변 액션 */}
                  <div
                    className={`
                      mt-3 flex items-center gap-0.5
                      text-[#777] opacity-0
                      transition-opacity
                      group-hover:opacity-100
                      focus-within:opacity-100
                      ${message.isStreaming ? 'invisible' : ''}
                    `}
                  >
                    {/* 복사 */}
                    <button
                      type="button"
                      onClick={() => copyMessage(message)}
                      className="
                        grid h-8 w-8 place-items-center
                        rounded-lg hover:bg-[#f1f1f1]
                      "
                      aria-label="답변 복사"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    {/* 좋아요 */}
                    <button
                      type="button"
                      className="
                        grid h-8 w-8 place-items-center
                        rounded-lg hover:bg-[#f1f1f1]
                      "
                      aria-label="좋은 답변"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>

                    {/* 싫어요 */}
                    <button
                      type="button"
                      className="
                        grid h-8 w-8 place-items-center
                        rounded-lg hover:bg-[#f1f1f1]
                      "
                      aria-label="아쉬운 답변"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>

                    {/* 재생성 */}
                    <button
                      type="button"
                      className="
                        grid h-8 w-8 place-items-center
                        rounded-lg hover:bg-[#f1f1f1]
                      "
                      aria-label="답변 다시 생성"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* AI 응답 생성 중 */}
          {isGenerating && (
            <div
              className="flex items-center gap-2 py-2 text-[14px] text-[#777]"
              aria-live="polite"
            >
              <span
                className="h-2 w-2 animate-pulse rounded-full bg-[#3c7cf6]"
                aria-hidden="true"
              />
              ONDAM이 질문을 살펴보고 있어요
            </div>
          )}

          {/* 자동 스크롤 기준 */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* 하단 메시지 입력 영역 */}
      <div
        className="
          absolute inset-x-0 bottom-0 z-20
          bg-gradient-to-t
          from-white via-white via-75%
          to-transparent
          px-5 pb-3 pt-10 sm:px-8
        "
      >
        <div className="mx-auto max-w-[780px]">
          <ChatCompanion
            phase={companionPhase}
            onAction={onSubmit}
            disabled={isResponding || isLoadingHistory}
          />

          <Composer
            onSubmit={onSubmit}
            onStartVoice={onStartVoice}
            disabled={isResponding || isLoadingHistory}
          />

          <p
            className="
              mt-2 text-center
              text-[11px] text-[#999]
            "
          >
            ONDAM AI는 실수할 수 있습니다. 중요한 정보는 다시 확인해 주세요.
          </p>
        </div>
      </div>
    </section>
  );
}
