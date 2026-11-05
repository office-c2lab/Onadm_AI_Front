import { useEffect, useState } from 'react';
import GamgikAgentOrbWithFace from './GamgikAgentOrbWithFace.jsx';

const previewActions = [
  { id: 'curious', label: '호기심' },
  { id: 'happy', label: '기쁨' },
  { id: 'shy', label: '수줍음' },
  { id: 'split', label: '분열' },
];

export default function GamgikModalDemo() {
  const [themeMode, setThemeMode] = useState(() => {
    return window.localStorage.getItem('gamgik-theme') === 'dark' ? 'dark' : 'light';
  });
  const [action, setAction] = useState('idle');
  const [actionSequence, setActionSequence] = useState(0);

  useEffect(() => {
    window.localStorage.setItem('gamgik-theme', themeMode);
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
  }, [themeMode]);

  const isDark = themeMode === 'dark';
  const playAction = nextAction => {
    setAction(nextAction);
    setActionSequence(sequence => sequence + 1);
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden px-4 py-6 transition-colors duration-500 sm:px-8 ${
        isDark ? 'bg-[#03040a] text-white' : 'bg-white text-slate-900'
      }`}
    >
      <button
        type="button"
        aria-label={`${isDark ? '라이트' : '다크'} 모드로 변경`}
        aria-pressed={isDark}
        onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
        className={`absolute right-5 top-5 z-20 inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/60 sm:right-8 sm:top-8 ${
          isDark
            ? 'border-white/15 bg-white/10 text-blue-50 hover:border-white/25 hover:bg-white/15'
            : 'border-blue-100 bg-blue-50/90 text-blue-700 hover:border-blue-200 hover:bg-blue-100'
        }`}
      >
        <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
        {isDark ? '라이트 모드' : '다크 모드'}
      </button>

      <section className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-6 overflow-hidden">
        <div className="relative h-[460px] w-[460px] shrink-0 overflow-visible">
          <GamgikAgentOrbWithFace
            size={460}
            speed={10}
            motion={0.78}
            themeMode={themeMode}
            action={action}
            actionSequence={actionSequence}
            onActionComplete={() => setAction('idle')}
          />
        </div>

        <div className="relative z-20 flex flex-wrap justify-center gap-2" aria-label="표정 테스트">
          {previewActions.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => playAction(item.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                isDark
                  ? 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
