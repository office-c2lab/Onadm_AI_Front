import claudeLogo from '../../../../../assets/icons/claude-color.svg';
import copilotLogo from '../../../../../assets/icons/copilot-color.svg';
import geminiLogo from '../../../../../assets/icons/gemini-color.svg';
import gensparkLogo from '../../../../../assets/icons/gensparkLogo.js';
import openaiLogo from '../../../../../assets/icons/openai.svg';

export const ALL_SERVICE_LOGO_NAMES = ['ChatGPT', 'Gemini', 'Claude', 'Genspark', 'MS Copilot'];

const SERVICE_LOGO_MAP = {
  chatgpt: openaiLogo,
  'chat gpt': openaiLogo,
  openai: openaiLogo,
  'open ai': openaiLogo,
  gpt: openaiLogo,
  gemini: geminiLogo,
  'google gemini': geminiLogo,
  claude: claudeLogo,
  'claude ai': claudeLogo,
  anthropic: claudeLogo,
  genspark: gensparkLogo,
  'gen spark': gensparkLogo,
  'ms copilot': copilotLogo,
  'microsoft copilot': copilotLogo,
  copilot: copilotLogo,
};

export function getServiceLogo(name) {
  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\.(com|ai|google|microsoft).*$/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

  if (SERVICE_LOGO_MAP[normalizedName]) return SERVICE_LOGO_MAP[normalizedName];
  if (normalizedName.includes('chatgpt') || normalizedName.includes('openai')) return openaiLogo;
  if (normalizedName.includes('gemini')) return geminiLogo;
  if (normalizedName.includes('claude') || normalizedName.includes('anthropic')) return claudeLogo;
  if (normalizedName.includes('genspark')) return gensparkLogo;
  if (normalizedName.includes('copilot')) return copilotLogo;

  return null;
}

export default function ServiceLogoBadge({
  name,
  className = '',
  iconClassName = '',
  iconStyle = undefined,
  variant = 'card',
}) {
  const serviceLogo = getServiceLogo(name);
  const label = name.trim().charAt(0).toUpperCase() || '?';
  const isCompact = variant === 'compact';

  if (!serviceLogo) {
    return (
      <div
        className={`flex items-center justify-center ${
          isCompact
            ? 'h-[var(--app-control-xs)] w-[var(--app-control-xs)] rounded-[var(--app-radius-md)] border border-[#D5E5EE] bg-[linear-gradient(135deg,#EFF7FB,#D8ECF4)] text-[clamp(0.58rem,0.7vw,0.625rem)] font-black text-[#026E92] shadow-[0_0.625rem_1.5rem_rgba(4,41,58,0.08)]'
            : 'h-[var(--app-control-md)] w-[var(--app-control-md)] rounded-[var(--app-radius-lg)] border border-[#D5E5EE] bg-[linear-gradient(135deg,#EFF7FB,#D8ECF4)] text-[clamp(0.82rem,0.95vw,0.9rem)] font-black text-[#026E92] shadow-[0_0.625rem_1.5rem_rgba(4,41,58,0.08)]'
        } ${className}`.trim()}
      >
        {label}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${
        isCompact
          ? 'h-[var(--app-control-xs)] w-[var(--app-control-xs)] rounded-[var(--app-radius-md)] border border-[#D5E5EE] bg-white shadow-[0_0.625rem_1.5rem_rgba(4,41,58,0.08)]'
          : 'h-[var(--app-control-md)] w-[var(--app-control-md)] rounded-[var(--app-radius-lg)] border border-[#D5E5EE] bg-white shadow-[0_0.625rem_1.5rem_rgba(4,41,58,0.08)]'
      } ${className}`.trim()}
    >
      <img
        src={serviceLogo}
        alt={`${name} logo`}
        className={`${isCompact ? 'h-[var(--app-icon-md)] w-[var(--app-icon-md)]' : 'h-[var(--app-icon-lg)] w-[var(--app-icon-lg)]'} object-contain ${iconClassName}`.trim()}
        style={iconStyle}
        loading="lazy"
      />
    </div>
  );
}
