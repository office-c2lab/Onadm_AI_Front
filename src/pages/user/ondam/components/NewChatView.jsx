import { useRef, useState } from 'react';
import {
  ArrowUp,
  AudioLines,
  ChevronDown,
  FileSearch,
  Laptop,
  MailSearch,
  Mic,
  Plus,
} from 'lucide-react';
import GamgikAgentOrbWithFace from '../../../../components/character/GamgikAgentOrbWithFace.jsx';

const suggestions = [
  {
    id: 'weekly-update',
    icon: Laptop,
    prompt: '이번 주 주요 업무 업데이트와 실무에 영향을 주는 변경점을 정리해줘',
  },
  {
    id: 'file-changes',
    icon: FileSearch,
    prompt: '중요한 파일에 어떤 변경 사항이 있었는지 알려줘',
  },
  {
    id: 'email-search',
    icon: MailSearch,
    prompt: '구독 취소할 수 있는 이메일을 찾아줘',
  },
];

export default function NewChatView({ onSubmit }) {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [model, setModel] = useState('High');
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const submitPrompt = event => {
    event?.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;
    onSubmit?.(trimmedPrompt);
  };

  const selectSuggestion = suggestion => {
    setPrompt(suggestion.prompt);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <section className="flex min-h-full w-full items-center justify-center px-5 py-10 sm:px-8">
      <div className="w-full max-w-[780px] translate-y-[3vh]">
        <div
          className="mx-auto mb-1 flex h-[260px] w-full justify-center"
          role="img"
          aria-label="ONDAM AI 캐릭터"
        >
          <div className="relative -top-[150px] h-[460px] w-[460px] shrink-0 overflow-visible">
            <GamgikAgentOrbWithFace size={460} speed={10} motion={0.78} themeMode="light" />
          </div>
        </div>

        <h1 className="text-center text-[26px] font-medium tracking-[-0.025em] text-[#0d0d0d] sm:text-[28px]">
          오늘은 어떤 생각이 드나요?
        </h1>

        <form
          onSubmit={submitPrompt}
          className="mt-8 flex min-h-[58px] w-full items-center rounded-[30px] border border-[#dedede] bg-white p-1.5 pl-2 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-shadow focus-within:shadow-[0_3px_14px_rgba(0,0,0,0.09)]"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            aria-label="파일 첨부"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#2f2f2f] hover:bg-[#f0f0f0]"
            aria-label="파일 첨부"
            title="파일 첨부"
          >
            <Plus className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </button>

          <input
            ref={inputRef}
            value={prompt}
            onChange={event => setPrompt(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-1.5 text-[15px] text-[#222] outline-none placeholder:text-[#888]"
            placeholder="ONDAM AI에게 물어보세요"
            aria-label="메시지"
          />

          <button
            type="button"
            onClick={() => setModel(value => (value === 'High' ? 'Fast' : 'High'))}
            className="hidden h-10 shrink-0 items-center gap-1 rounded-full px-3 text-[14px] text-[#777] hover:bg-[#f3f3f3] sm:flex"
            aria-label={`응답 모드: ${model}`}
          >
            {model}
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setIsListening(value => !value)}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors ${
              isListening ? 'bg-[#fee9e7] text-[#d93025]' : 'text-[#2f2f2f] hover:bg-[#f0f0f0]'
            }`}
            aria-label={isListening ? '음성 입력 중지' : '음성 입력'}
            aria-pressed={isListening}
            title="음성 입력"
          >
            <Mic className="h-[19px] w-[19px]" strokeWidth={1.8} aria-hidden="true" />
          </button>

          <button
            type={prompt.trim() ? 'submit' : 'button'}
            onClick={!prompt.trim() ? () => setIsListening(value => !value) : undefined}
            className="ml-1.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#3c7cf6] text-white transition hover:bg-[#2f6fe8] disabled:opacity-50"
            aria-label={prompt.trim() ? '메시지 보내기' : '음성 대화 시작'}
            title={prompt.trim() ? '메시지 보내기' : '음성 대화 시작'}
          >
            {prompt.trim() ? (
              <ArrowUp className="h-[19px] w-[19px]" strokeWidth={2} aria-hidden="true" />
            ) : (
              <AudioLines className="h-[19px] w-[19px]" strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </form>

        <div className="mt-7 space-y-1" aria-label="추천 질문">
          {suggestions.map(suggestion => {
            const Icon = suggestion.icon;

            return (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                className="group flex min-h-11 w-full items-center gap-4 rounded-xl px-4 py-2 text-left text-[14px] text-[#777] transition-colors hover:bg-white hover:text-[#303030] hover:shadow-sm sm:text-[15px]"
              >
                <Icon
                  className="h-[18px] w-[18px] shrink-0 text-[#6f7784] group-hover:text-[#3c7cf6]"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <span>{suggestion.prompt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
