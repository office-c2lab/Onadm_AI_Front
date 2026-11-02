import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X } from 'lucide-react';

import GamgikAgentOrbWithFace from '../../../../components/character/GamgikAgentOrbWithFace.jsx';

export default function VoiceConversationView({ onClose }) {
  const [isMuted, setIsMuted] = useState(false);
  const [wakeExpression, setWakeExpression] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [microphoneStatus, setMicrophoneStatus] = useState('requesting');
  const wakeTimerRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isMutedRef = useRef(isMuted);
  const lastLevelUpdateRef = useRef(0);

  const visibleAudioLevel = isMuted ? 0 : audioLevel;
  const isSpeaking = microphoneStatus === 'active' && visibleAudioLevel > 0.08;

  useEffect(() => {
    let isCancelled = false;

    const startAudioMonitoring = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMicrophoneStatus('unavailable');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (isCancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
        if (!AudioContextClass) {
          stream.getTracks().forEach(track => track.stop());
          setMicrophoneStatus('unavailable');
          return;
        }

        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.82;
        const samples = new Uint8Array(analyser.fftSize);
        let smoothedLevel = 0;

        source.connect(analyser);

        mediaStreamRef.current = stream;
        audioContextRef.current = audioContext;
        stream.getAudioTracks().forEach(track => {
          track.enabled = !isMutedRef.current;
        });
        setMicrophoneStatus('active');

        const readLevel = timestamp => {
          analyser.getByteTimeDomainData(samples);

          let sumOfSquares = 0;
          for (let index = 0; index < samples.length; index += 1) {
            const normalizedSample = (samples[index] - 128) / 128;
            sumOfSquares += normalizedSample * normalizedSample;
          }

          const rms = Math.sqrt(sumOfSquares / samples.length);
          const normalizedLevel = isMutedRef.current
            ? 0
            : Math.max(0, Math.min(1, (rms - 0.015) / 0.14));
          smoothedLevel += (normalizedLevel - smoothedLevel) * 0.3;

          if (timestamp - lastLevelUpdateRef.current >= 70) {
            setAudioLevel(Number(smoothedLevel.toFixed(3)));
            lastLevelUpdateRef.current = timestamp;
          }

          animationFrameRef.current = window.requestAnimationFrame(readLevel);
        };

        animationFrameRef.current = window.requestAnimationFrame(readLevel);
      } catch {
        if (!isCancelled) setMicrophoneStatus('denied');
      }
    };

    startAudioMonitoring();

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current);
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
    mediaStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = !isMuted;
    });
  }, [isMuted]);

  useEffect(
    () => () => {
      if (wakeTimerRef.current) window.clearTimeout(wakeTimerRef.current);
    },
    []
  );

  const toggleMute = () => {
    if (wakeTimerRef.current) window.clearTimeout(wakeTimerRef.current);

    if (isMuted) {
      setIsMuted(false);
      setWakeExpression('surprised');
      wakeTimerRef.current = window.setTimeout(() => {
        setWakeExpression(null);
      }, 760);
      return;
    }

    setIsMuted(true);
    setWakeExpression(null);
  };

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
        aria-label={isMuted ? '마이크 음소거됨' : isSpeaking ? '음성 감지 중' : '음성 듣는 중'}
      >
        <span
          className="pointer-events-none absolute inset-[10%] rounded-full border border-[#72a4ff] transition-[transform,opacity] duration-75"
          style={{
            opacity: 0.08 + visibleAudioLevel * 0.48,
            transform: `scale(${0.94 + visibleAudioLevel * 0.14})`,
            boxShadow: `0 0 ${24 + visibleAudioLevel * 70}px rgba(60, 124, 246, ${0.08 + visibleAudioLevel * 0.22})`,
          }}
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute inset-[16%] rounded-full bg-[#3c7cf6] transition-[transform,opacity] duration-75"
          style={{
            opacity: visibleAudioLevel * 0.055,
            transform: `scale(${0.9 + visibleAudioLevel * 0.12})`,
          }}
          aria-hidden="true"
        />

        <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 scale-[0.55] sm:scale-[0.76] lg:scale-100">
          <GamgikAgentOrbWithFace
            size={680}
            speed={isMuted ? 5 : 9 + visibleAudioLevel * 7}
            motion={isMuted ? 0.35 : 0.68 + visibleAudioLevel * 0.47}
            themeMode="light"
            expressionOverride={isMuted ? 'sleepy' : wakeExpression}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 text-center sm:bottom-32">
        <p className="text-[18px] font-medium text-[#303030]">
          {isMuted
            ? '잠시 쉬고 있을게요'
            : microphoneStatus === 'denied' || microphoneStatus === 'unavailable'
              ? '마이크를 사용할 수 없어요'
              : microphoneStatus === 'requesting'
                ? '마이크 연결 중'
                : isSpeaking
                  ? '목소리를 듣고 있어요'
                  : '듣고 있어요'}
        </p>
        <p className="mt-1 text-[13px] text-[#888]">
          {isMuted
            ? '마이크를 켜면 다시 대화를 시작해요'
            : microphoneStatus === 'denied'
              ? '브라우저의 마이크 권한을 확인해 주세요'
              : microphoneStatus === 'unavailable'
                ? '이 환경에서는 음성 감지를 지원하지 않아요'
                : isSpeaking
                  ? '말소리에 맞춰 캐릭터가 반응하고 있어요'
                  : '편하게 말씀해 주세요'}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-3 sm:bottom-10">
        <button
          type="button"
          onClick={toggleMute}
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
