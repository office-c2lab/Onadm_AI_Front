import { useState } from 'react';
import { Mic, MicOff, X } from 'lucide-react';

import GamgikAgentOrbWithFace from '../../../../components/character/GamgikAgentOrbWithFace.jsx';

export default function VoiceConversationView({ onClose }) {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <section
      className="relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-white"
      aria-label="음성 대화"
    >
      <div className="pointer-events-none absolute h-[min(84vw,660px)] w-[min(84vw,660px)] rounded-full bg-[radial-gradient(circle,rgba(60,124,246,0.09)_0%,rgba(60,124,246,0.03)_48%,transparent_70%)] blur-xl" />

      <div
        className={`relative h-[min(90vw,680px)] w-[min(90vw,680px)] shrink-0 transition-all duration-500 ${
          isMuted ? 'scale-[0.94] opacity-80' : 'scale-100'
        }`}
        role="status"
        aria-live="polite"
        aria-label={isMuted ? '마이크 음소거됨' : '음성 듣는 중'}
      >
        <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 scale-[0.55] sm:scale-[0.76] lg:scale-100">
          <GamgikAgentOrbWithFace
            size={680}
            speed={isMuted ? 5 : 11}
            motion={isMuted ? 0.35 : 0.9}
            themeMode="light"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-3 sm:bottom-10">
        <button
          type="button"
          onClick={() => setIsMuted(value => !value)}
          className={`grid h-12 w-12 place-items-center rounded-full border transition-all ${
            isMuted
              ? 'border-[#dedede] bg-[#f1f1f1] text-[#555]'
              : 'border-[#e2e2e2] bg-white text-[#222] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:bg-[#f7f7f7]'
          }`}
          aria-label={isMuted ? '마이크 켜기' : '마이크 음소거'}
          aria-pressed={isMuted}
        >
          {isMuted ? (
            <MicOff className="h-5 w-5" strokeWidth={1.8} />
          ) : (
            <Mic className="h-5 w-5" strokeWidth={1.8} />
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="grid h-12 w-12 place-items-center rounded-full bg-[#202020] text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition hover:bg-[#363636]"
          aria-label="음성 대화 종료"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
