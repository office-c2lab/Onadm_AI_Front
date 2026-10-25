import {
  BarChart3,
  Bot,
  Braces,
  CalendarClock,
  FileText,
  Languages,
  MailPen,
  MessageSquareText,
  MessagesSquare,
  Scale,
  Sparkles,
  Workflow,
} from 'lucide-react';

const toolVisuals = {
  report: [FileText, 'bg-blue-600 text-white'],
  meeting: [MessageSquareText, 'bg-violet-100 text-violet-600'],
  workflow: [Workflow, 'bg-orange-500 text-white'],
  analysis: [BarChart3, 'bg-emerald-500 text-white'],
  review: [Braces, 'bg-slate-900 text-white'],
  expense: [Sparkles, 'bg-amber-100 text-amber-600'],
  translate: [Languages, 'bg-sky-100 text-sky-600'],
  support: [Bot, 'bg-indigo-100 text-indigo-600'],
  contract: [Scale, 'bg-rose-100 text-rose-600'],
  email: [MailPen, 'bg-cyan-100 text-cyan-700'],
  inquiry: [MessagesSquare, 'bg-fuchsia-100 text-fuchsia-600'],
  schedule: [CalendarClock, 'bg-teal-100 text-teal-700'],
};

export default function StoreToolIcon({ tool, small = false, featured = false, promo = false }) {
  const [Icon, color] = toolVisuals[tool.id] || toolVisuals.report;

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl ${color} ${
        featured
          ? 'h-[72px] w-[72px] rounded-2xl shadow-sm'
          : promo
            ? 'h-14 w-14 shadow-sm'
            : small
              ? 'h-12 w-12'
              : 'h-10 w-10'
      }`}
    >
      <Icon
        size={featured ? 36 : promo ? 28 : small ? 24 : 20}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </span>
  );
}
