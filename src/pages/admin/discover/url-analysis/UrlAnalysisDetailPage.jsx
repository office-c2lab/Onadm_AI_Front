import { ArrowLeft, Globe2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AnalysisDetails } from './UrlAnalysisPage.jsx';

export default function UrlAnalysisDetailPage() {
  const location = useLocation();
  const analysis = location.state?.analysis;

  if (!analysis) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">분석 정보를 찾을 수 없습니다.</h1>
        <p className="mt-2 text-sm text-slate-500">목록에서 분석 항목을 다시 선택해 주세요.</p>
        <Link
          to="/admin/discover/url-analysis"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          분석 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const ips = analysis.ips?.length ? analysis.ips : analysis.ip ? [analysis.ip] : [];

  return (
    <>
      <Link
        to="/admin/discover/url-analysis"
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={16} aria-hidden="true" /> AI Service Analysis로 돌아가기
      </Link>

      <header className="py-8 sm:py-10">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Globe2 size={26} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
              {analysis.domain}
            </h1>
            <p className="mt-2 truncate text-sm text-slate-500">{analysis.url}</p>
          </div>
        </div>
      </header>

      <section className="border-t border-slate-200 py-9 sm:py-10">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">분석 결과</h2>
        <dl className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['분석 상태', analysis.analysisStatus],
            ['AI 서비스 여부', analysis.ai],
            ['서비스 유형', analysis.kind],
            ['DB 등록 상태', analysis.db],
            ['식별 신뢰도', analysis.confidence ? `${analysis.confidence}%` : '—'],
            ['검사 시작 일시', analysis.time],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="mt-1 text-[15px] font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-7 rounded-xl bg-slate-50 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">접속 IP</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {ips.map(ip => (
              <code
                key={ip}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600"
              >
                {ip}
              </code>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 py-9 sm:py-10">
        <AnalysisDetails standalone showActions={false} item={analysis} />
      </section>
    </>
  );
}
