import { AlertCircle, ArrowLeft, CheckCircle2, Database, Globe2, Network } from 'lucide-react';
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
  const isAi = analysis.ai === 'AI 서비스';
  let parsedUrl;
  try {
    parsedUrl = new URL(analysis.url);
  } catch {
    parsedUrl = null;
  }
  const evidence = isAi
    ? [
        '공개 페이지에서 AI 기반 기능과 사용 사례에 대한 설명을 확인했습니다.',
        `${analysis.kind} 기능과 관련된 서비스 문구 및 메타데이터가 식별되었습니다.`,
        '서비스의 핵심 기능이 사용자 입력을 기반으로 결과를 생성하는 구조로 확인되었습니다.',
      ]
    : [
        '공개 페이지에서 핵심 AI 기능에 대한 명확한 설명을 확인하지 못했습니다.',
        '일반 웹서비스 기능을 중심으로 제공되는 것으로 식별되었습니다.',
        '서비스 변경 가능성을 고려해 정기적인 재검사가 권장됩니다.',
      ];

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
        <h2 className="text-lg font-bold tracking-tight text-slate-900">서비스 식별 결과</h2>
        <div
          className={`mt-5 flex items-start gap-4 rounded-xl border p-5 ${isAi ? 'border-blue-100 bg-blue-50/60' : 'border-amber-100 bg-amber-50/60'}`}
        >
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${isAi ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}
          >
            {isAi ? (
              <CheckCircle2 size={20} aria-hidden="true" />
            ) : (
              <AlertCircle size={20} aria-hidden="true" />
            )}
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">
              {isAi ? 'AI 서비스로 식별되었습니다.' : 'AI 서비스로 식별되지 않았습니다.'}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              공개 웹페이지의 서비스 설명, 기능 문구, 메타데이터를 종합해 판정했습니다.
              {analysis.confidence ? ` 식별 신뢰도는 ${analysis.confidence}%입니다.` : ''}
            </p>
          </div>
        </div>

        <dl className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-900">주요 식별 근거</h3>
          <ul className="mt-3 grid gap-3">
            {evidence.map(reason => (
              <li
                key={reason}
                className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
              >
                <CheckCircle2
                  className="mt-1 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-slate-200 py-9 sm:py-10">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <h2 className="text-lg font-bold tracking-tight text-slate-900">URL 및 네트워크 정보</h2>
        </div>
        <dl className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {[
            ['요청 URL', analysis.url],
            ['도메인', analysis.domain],
            ['프로토콜', parsedUrl?.protocol.replace(':', '').toUpperCase() ?? '—'],
            ['확인된 접속 IP', `${ips.length}개`],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="mt-1 truncate text-[15px] font-semibold text-slate-900" title={value}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-7 rounded-xl bg-slate-50 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">접속 IP 목록</h3>
          <div className="mt-3 grid gap-2">
            {ips.map(ip => (
              <div
                key={ip}
                className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-2"
              >
                <code className="min-w-0 truncate text-xs text-slate-700">{ip}</code>
                <span className="shrink-0 text-xs font-medium text-slate-400">
                  {ip.includes(':') ? 'IPv6' : 'IPv4'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 py-9 sm:py-10">
        <div className="mb-5 flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Intelligence DB 비교</h2>
        </div>
        <div className="grid gap-4 rounded-xl border border-slate-200 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {analysis.db === '등록됨'
                ? '기존 등록 서비스와 일치합니다.'
                : analysis.db === '신규 후보'
                  ? '기존 DB에서 일치하는 서비스를 찾지 못했습니다.'
                  : 'DB 등록 여부를 추가로 검토해야 합니다.'}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              도메인과 공개 서비스 정보를 기준으로 Intelligence DB의 기존 항목과 비교했습니다.
            </p>
          </div>
          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            {analysis.db}
          </span>
        </div>
      </section>

      <section className="border-t border-slate-200 py-9 sm:py-10">
        <AnalysisDetails standalone showActions={false} item={analysis} />
      </section>
    </>
  );
}
