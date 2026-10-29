import { useState } from 'react';
import { ArrowLeft, FileSearch, Link2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import urlImage from '../../../../assets/images/url.png';

function formatAnalysisTime(date) {
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}. ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function NewUrlAnalysisPage() {
  const navigate = useNavigate();
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');

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

    navigate('/admin/discover/url-analysis', { state: { submittedAnalysis: analysis } });
  };

  return (
    <>
      <Link
        to="/admin/discover/url-analysis"
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={16} aria-hidden="true" /> AI Service Analysis로 돌아가기
      </Link>

      <section className="mt-2" aria-labelledby="new-url-analysis-title">
        <form
          onSubmit={submit}
          noValidate
          className="flex min-h-[430px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-10 text-center"
        >
          <img src={urlImage} alt="" className="h-40 w-40 object-contain" aria-hidden="true" />
          <h1 id="new-url-analysis-title" className="mt-6 text-lg font-semibold text-slate-900">
            새로운 웹사이트를 분석해 보세요.
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            URL을 입력하면 AI 서비스 여부와 유형을 확인하고
            <br className="hidden sm:block" /> 분석 이력에서 결과를 다시 살펴볼 수 있습니다.
          </p>

          <div className="mt-6 w-full max-w-xl">
            <label htmlFor="analysis-url" className="sr-only">
              분석할 URL
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div
                className={`flex h-12 min-w-0 flex-1 items-center gap-2 rounded-lg border bg-white px-3 text-left transition focus-within:ring-2 ${error ? 'border-red-300 focus-within:border-red-400 focus-within:ring-red-100' : 'border-slate-200 focus-within:border-blue-500 focus-within:ring-blue-100'}`}
              >
                <Link2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  autoFocus
                  id="analysis-url"
                  type="text"
                  inputMode="url"
                  value={urlInput}
                  onChange={event => {
                    setUrlInput(event.target.value);
                    setError('');
                  }}
                  placeholder="https://example.com"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <FileSearch size={17} aria-hidden="true" /> URL 분석 시작
              </button>
            </div>
            {error ? (
              <p role="alert" className="mt-2 text-center text-xs text-red-600">
                {error}
              </p>
            ) : (
              <p className="mt-2 text-center text-xs text-slate-500">
                http:// 또는 https://로 시작하는 주소를 입력해 주세요.
              </p>
            )}
          </div>
        </form>
      </section>
    </>
  );
}
