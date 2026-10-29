import { useEffect, useState } from 'react';
import { ArrowLeft, Link2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import urlImage from '../../../../assets/images/url.png';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';
import { AnalysisDetails } from './UrlAnalysisPage.jsx';

const ANALYSIS_STEP_COUNT = 3;

function formatAnalysisTime(date) {
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}. ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function NewUrlAnalysisPage() {
  const navigate = useNavigate();
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [stopConfirmationOpen, setStopConfirmationOpen] = useState(false);

  useEffect(() => {
    if (
      !analysis ||
      stopConfirmationOpen ||
      ['분석 완료', '검토 필요', '중지됨'].includes(analysis.analysisStatus)
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setAnalysis(current => {
        if (!current) return current;
        if (current.analysisStatus === '대기') {
          return { ...current, analysisStatus: '진행 중' };
        }

        const nextProgress = Math.min(current.progress + 1, ANALYSIS_STEP_COUNT);
        return {
          ...current,
          progress: nextProgress,
          analysisStatus: nextProgress === ANALYSIS_STEP_COUNT ? '분석 완료' : '진행 중',
          ip: nextProgress > 0 ? '203.0.113.80' : current.ip,
          ips: nextProgress > 0 ? ['203.0.113.80', '2001:db8::80'] : current.ips,
        };
      });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [analysis, stopConfirmationOpen]);

  const submit = event => {
    event.preventDefault();

    let parsed;
    try {
      parsed = new URL(urlInput.trim());
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname.includes('.')) {
        throw new Error('invalid URL');
      }
    } catch {
      setError('http:// 또는 https://로 시작하는 올바른 URL을 입력해 주세요.');
      return;
    }

    const now = new Date();
    const analysis = {
      id: `analysis-${now.getTime()}`,
      domain: parsed.hostname.replace(/^www\./, ''),
      url: parsed.href,
      ip: '조회 대기',
      ips: [],
      ai: '판단 불가',
      kind: '—',
      db: '검토 필요',
      time: formatAnalysisTime(now),
      confidence: null,
      progress: 0,
      analysisStatus: '대기',
      autoProgress: true,
    };

    setAnalysis(analysis);
    setError('');
  };

  return (
    <>
      <Link
        to="/admin/discover/url-analysis"
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={16} aria-hidden="true" /> AI Service Analysis로 돌아가기
      </Link>

      <form onSubmit={submit} noValidate className="mt-2">
        <header className="py-8 sm:py-10">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
            새 URL 분석
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
            웹사이트 URL을 입력하면 AI 서비스 여부와 유형, 접속 정보를 분석합니다.
          </p>
        </header>

        {error && (
          <p role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <section className="border-t border-slate-200 py-9 sm:py-10">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            웹사이트 URL <span className="text-red-500">*</span>
          </h2>
          <div className="mt-5 flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 px-6 py-8 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/30 sm:min-h-[360px]">
            <img src={urlImage} alt="" className="h-32 w-32 object-contain" aria-hidden="true" />
            <strong className="mt-4 text-base font-semibold text-slate-900">
              {analysis ? '분석 중인 웹사이트' : '분석할 웹사이트 주소를 입력하세요'}
            </strong>
            <span className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {analysis
                ? '입력한 URL로 분석을 진행하고 있습니다.'
                : '공개적으로 접속 가능한 웹사이트의 전체 URL을 입력해 주세요.'}
            </span>

            <div className="mt-5 w-full max-w-xl text-left">
              <label htmlFor="analysis-url" className="sr-only">
                분석할 URL
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div
                  className={`flex h-12 min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 text-left transition ${analysis ? 'border-slate-200 bg-slate-50' : error ? 'border-red-300 bg-white focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' : 'border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'}`}
                >
                  <Link2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <input
                    autoFocus={!analysis}
                    readOnly={Boolean(analysis)}
                    id="analysis-url"
                    type="text"
                    inputMode="url"
                    value={urlInput}
                    onChange={event => {
                      setUrlInput(event.target.value);
                      setError('');
                    }}
                    placeholder="https://example.com"
                    className={`min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 ${analysis ? 'cursor-default font-medium text-slate-700' : 'text-slate-900'}`}
                  />
                </div>
                <AiStoreActionButton
                  type={analysis ? 'button' : 'submit'}
                  disabled={Boolean(analysis)}
                  className="h-12 px-5"
                >
                  {analysis
                    ? analysis.analysisStatus === '분석 완료'
                      ? '분석 완료'
                      : analysis.analysisStatus === '중지됨'
                        ? '분석 중지됨'
                        : '분석 진행 중'
                    : 'URL 분석 시작'}
                </AiStoreActionButton>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {analysis
                  ? '분석이 끝날 때까지 URL을 변경할 수 없습니다.'
                  : 'http:// 또는 https://로 시작하는 주소를 입력해 주세요.'}
              </p>
            </div>
          </div>
        </section>

        {analysis && (
          <section className="border-t border-slate-200 py-9 sm:py-10">
            <AnalysisDetails standalone showActions={false} item={analysis} />
          </section>
        )}
      </form>

      {analysis && ['대기', '진행 중', '분석 완료'].includes(analysis.analysisStatus) && (
        <div className="sticky bottom-0 z-20 flex min-h-[72px] items-center justify-end border-t border-slate-200 bg-white/95 py-4 backdrop-blur">
          {['대기', '진행 중'].includes(analysis.analysisStatus) && (
            <AiStoreActionButton variant="danger" onClick={() => setStopConfirmationOpen(true)}>
              분석 중지
            </AiStoreActionButton>
          )}
          {analysis.analysisStatus === '분석 완료' && (
            <AiStoreActionButton
              variant="success"
              onClick={() =>
                navigate('/admin/discover/url-analysis', {
                  state: { submittedAnalysis: analysis },
                })
              }
            >
              분석 결과 확인
            </AiStoreActionButton>
          )}
        </div>
      )}

      <AiStoreConfirmModal
        open={stopConfirmationOpen}
        title="분석을 중지할까요?"
        confirmLabel="분석 중지"
        cancelLabel="계속 분석"
        onClose={() => setStopConfirmationOpen(false)}
        onConfirm={() => {
          setAnalysis(current =>
            current ? { ...current, analysisStatus: '중지됨', autoProgress: false } : current
          );
          setStopConfirmationOpen(false);
        }}
      >
        <strong className="font-semibold text-slate-900">{analysis?.domain}</strong> 분석을
        중지합니다. 완료된 단계의 검사 기록은 이 페이지에 유지됩니다.
      </AiStoreConfirmModal>
    </>
  );
}
