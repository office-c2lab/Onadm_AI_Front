import { useEffect, useState } from 'react';
import GamgikAgentOrbWithFace from './GamgikAgentOrbWithFace.jsx';

export default function GamgikModalDemo() {
  const [themeMode, setThemeMode] = useState(() => {
    return window.localStorage.getItem('gamgik-theme') === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    window.localStorage.setItem('gamgik-theme', themeMode);
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
  }, [themeMode]);

  const isDark = themeMode === 'dark';

  return (
    <div
      className={`relative min-h-screen overflow-hidden px-4 py-8 transition-colors duration-500 sm:px-8 ${
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
          <GamgikAgentOrbWithFace size={460} speed={10} motion={0.78} themeMode={themeMode} />
        </div>
      </section>
    </div>
  );
}
