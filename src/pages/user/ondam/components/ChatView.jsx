import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  AudioLines,
  Check,
  ChevronDown,
  Copy,
  Mic,
  Plus,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import GamgikAgentOrbWithFace from '../../../../components/character/GamgikAgentOrbWithFace.jsx';

function MessageContent({ content }) {
  return content.split('\n').map((line, lineIndex) => (
    <p key={`${line}-${lineIndex}`} className={line ? 'min-h-6' : 'h-3'}>
      {line &&
        line.split(/(\*\*.*?\*\*)/g).map((part, partIndex) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={`${part}-${partIndex}`} className="font-semibold text-[#171717]">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={`${part}-${partIndex}`}>{part}</span>
          )
        )}
    </p>
  ));
}

function Composer({ onSubmit }) {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [model, setModel] = useState('High');
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
      className="flex min-h-[58px] w-full items-center rounded-[30px] border border-[#dedede] bg-white p-1.5 pl-2 shadow-[0_2px_12px_rgba(0,0,0,0.08)] focus-within:shadow-[0_3px_16px_rgba(0,0,0,0.11)]"
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
        className="min-w-0 flex-1 bg-transparent px-1.5 text-[15px] text-[#222] outline-none placeholder:text-[#888]"
        placeholder="메시지를 입력하세요"
        aria-label="메시지"
      />
      <button
        type="button"
        onClick={() => setModel(value => (value === 'High' ? 'Fast' : 'High'))}
        className="hidden h-10 items-center gap-1 rounded-full px-3 text-[14px] text-[#777] hover:bg-[#f3f3f3] sm:flex"
      >
        {model}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setIsListening(value => !value)}
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
          isListening ? 'bg-[#fee9e7] text-[#d93025]' : 'text-[#303030] hover:bg-[#f0f0f0]'
        }`}
        aria-label="음성 입력"
      >
        <Mic className="h-[19px] w-[19px]" strokeWidth={1.8} />
      </button>
      <button
        type={prompt.trim() ? 'submit' : 'button'}
        className="ml-1.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#3c7cf6] text-white hover:bg-[#2f6fe8]"
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

export default function ChatView({ messages, onSubmit }) {
  const [copiedId, setCopiedId] = useState(null);
  const bottomRef = useRef(null);
  const isGenerating = messages.at(-1)?.role === 'user';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const copyMessage = async message => {
    await navigator.clipboard?.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="min-h-0 w-full flex-1 overflow-y-auto pb-44 pt-8 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:#d9d9d9_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-[#d9d9d9]">
        <div className="mx-auto max-w-[780px] space-y-9 px-5 sm:px-8">
          {messages.map(message =>
            message.role === 'user' ? (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[78%] rounded-[22px] bg-[#3c7cf6] px-5 py-3 text-[16px] leading-7 text-white shadow-[0_2px_8px_rgba(60,124,246,0.18)]">
                  {message.content}
                </div>
              </div>
            ) : (
              <div key={message.id} className="group">
                <div className="min-w-0">
                  <div className="text-[16px] leading-7 text-[#303030]">
                    <MessageContent content={message.content} />
                  </div>
                  <div className="mt-3 flex items-center gap-0.5 text-[#777] opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      onClick={() => copyMessage(message)}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#f1f1f1]"
                      aria-label="답변 복사"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#f1f1f1]"
                      aria-label="좋은 답변"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#f1f1f1]"
                      aria-label="아쉬운 답변"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#f1f1f1]"
                      aria-label="답변 다시 생성"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {isGenerating && (
            <div className="flex items-center gap-6" aria-label="응답 생성 중">
              <div className="-ml-[38px] h-[180px] w-[142px] shrink-0 overflow-visible">
                <GamgikAgentOrbWithFace size={180} speed={10} motion={0.78} themeMode="light" />
              </div>
              <div className="flex items-center gap-2.5 text-[17px] font-medium text-[#4b4b4b]">
                <span>응답 생성 중</span>
                <span className="flex items-center gap-1.5" aria-hidden="true">
                  <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#777] [animation-delay:-0.3s]" />
                  <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#777] [animation-delay:-0.15s]" />
                  <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#777]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-white via-white via-75% to-transparent px-5 pb-3 pt-10 sm:px-8">
        <div className="mx-auto max-w-[780px]">
          <Composer onSubmit={onSubmit} />
          <p className="mt-2 text-center text-[11px] text-[#999]">
            ONDAM AI는 실수할 수 있습니다. 중요한 정보는 다시 확인해 주세요.
          </p>
        </div>
      </div>
    </section>
  );
}
