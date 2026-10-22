export default function StatusBadge({ children }) {
  const tone = {
    정상: 'bg-emerald-50 text-emerald-700',
    승인: 'bg-emerald-50 text-emerald-700',
    통과: 'bg-emerald-50 text-emerald-700',
    완료: 'bg-emerald-50 text-emerald-700',
    '게시 중': 'bg-blue-50 text-blue-700',
    '게시 대기': 'bg-violet-50 text-violet-700',
    '시행 중': 'bg-blue-50 text-blue-700',
    '검사 중': 'bg-blue-50 text-blue-700',
    '검토 중': 'bg-blue-50 text-blue-700',
    '진행 중': 'bg-blue-50 text-blue-700',
    대기: 'bg-amber-50 text-amber-700',
    '대기 중': 'bg-amber-50 text-amber-700',
    경고: 'bg-amber-50 text-amber-700',
    '시행 예정': 'bg-violet-50 text-violet-700',
    '보완 필요': 'bg-orange-50 text-orange-700',
    '확인 필요': 'bg-orange-50 text-orange-700',
    실패: 'bg-red-50 text-red-700',
    반려: 'bg-red-50 text-red-700',
    중지: 'bg-red-50 text-red-600',
    숨김: 'bg-slate-100 text-slate-600',
    미게시: 'bg-slate-100 text-slate-600',
    높음: 'bg-red-50 text-red-700',
    중간: 'bg-amber-50 text-amber-700',
    낮음: 'bg-emerald-50 text-emerald-700',
  }[children];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-micro font-semibold ${tone || 'bg-slate-100 text-slate-600'}`}
    >
      {children}
    </span>
  );
}
