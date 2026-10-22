import claudeLogo from '../../assets/icons/claude-color.svg';
import copilotLogo from '../../assets/icons/copilot-color.svg';
import geminiLogo from '../../assets/icons/gemini-color.svg';
import gensparkLogo from '../../assets/icons/gensparkLogo.js';
import openaiLogo from '../../assets/icons/openai.svg';

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
