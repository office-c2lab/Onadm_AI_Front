import GamgikAgentOrbWithFace from './GamgikAgentOrbWithFace.jsx';

export default function GamgikModalDemo({ themeMode = 'light' }) {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-6 overflow-hidden">
      <div className="relative h-[460px] w-[460px] shrink-0 overflow-visible">
        <GamgikAgentOrbWithFace size={460} speed={10} motion={0.78} themeMode={themeMode} />
      </div>
    </section>
  );
}
