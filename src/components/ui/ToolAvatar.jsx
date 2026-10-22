import { Bot, Boxes, FileText, Workflow } from 'lucide-react';

export default function ToolAvatar({ type, size = 'md', variant = 'type' }) {
  const visuals = {
    'AI App': [FileText, 'bg-blue-600 text-white'],
    'AI Agent': [Bot, 'bg-violet-100 text-violet-600'],
    '자동화 도구': [Workflow, 'bg-orange-100 text-orange-600'],
    '일반 업무 도구': [Boxes, 'bg-slate-100 text-slate-600'],
  };
  const [Icon, color] = visuals[type] || visuals['AI App'];
  const isStore = variant === 'store';
  const sizeClass = size === 'lg' ? 'size-14' : 'size-12';

  return (
    <span
      className={`grid ${sizeClass} shrink-0 place-items-center rounded-xl ${isStore ? 'bg-palette-blue-14 text-palette-blue-83' : color}`}
    >
      <Icon size={size === 'lg' ? 27 : isStore ? 22 : 23} strokeWidth={1.7} aria-hidden="true" />
    </span>
  );
}
