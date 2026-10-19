import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';

import { categories, useMyTools } from '../data/manageStore.js';

const kindOptions = [
  {
    name: 'AI App',
    detail: 'AI 기능을 활용하는 업무용 앱',
  },
  {
    name: 'AI Agent',
    detail: '자율적으로 업무를 수행하는 도구',
  },
  {
    name: '자동화 도구',
    detail: '반복 업무를 자동으로 처리하는 도구',
  },
  {
    name: '일반 업무 도구',
    detail: 'AI 없이 업무에 도움을 주는 도구',
  },
];

const initialForm = {
  type: 'AI App',
  name: '',
  summary: '',
  category: '문서·생산성',
  version: '0.1.0',
  description: '',
  repository: '',
  executionUrl: '',
  usageGuide: '',
  visibility: '사내 전체',
  agree: false,
};

const inputClass =
  'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500';

// 공통 입력 항목
function Field({ label, required = false, hint, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-800">
        {label}
        {required && <span className="ml-1 text-blue-600">*</span>}
      </label>

      {children}

      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// URL 검사
function validUrl(value) {
  if (!value.trim()) return true;

  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { addMyTool } = useMyTools();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const steps = ['기본 정보', '실행 정보', '최종 확인'];

  const change = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));

    setError('');
  };

  // 다음 단계
  const goNext = () => {
    if (step === 1 && (!form.name.trim() || !form.summary.trim() || !form.description.trim())) {
      setError('도구 이름, 한 줄 설명, 도구 소개를 입력해 주세요.');
      return;
    }

    if (step === 2 && (!validUrl(form.repository) || !validUrl(form.executionUrl))) {
      setError('저장소 주소와 실행 주소에 올바른 URL을 입력해 주세요.');
      return;
    }

    setError('');
    setStep(prev => Math.min(prev + 1, 3));
  };

  // 도구 등록
  const submit = () => {
    if (!form.agree) {
      setError('등록 내용 확인에 동의해 주세요.');
      return;
    }

    const today = new Date();

    const updatedAt = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('.');

    addMyTool({
      id: `mine-${Date.now()}`,
      name: form.name.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      category: form.category,
      type: form.type,
      version: form.version.trim() || '0.1.0',
      status: '검사 대기',
      updatedAt,
      maker: '나',
      repository: form.repository.trim(),
      executionUrl: form.executionUrl.trim(),
      usageGuide: form.usageGuide.trim(),
      visibility: form.visibility,
      review: 'UI 시안에서 등록한 항목입니다. 실제 보안검사 및 승인은 서버 연동 후 진행됩니다.',
    });

    navigate('/user/aistore/mytools', {
      state: { registered: true },
    });
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8">
      {/* 페이지 헤더 */}
      <p className="text-xs font-semibold tracking-wider text-blue-600">MANAGE</p>

      <h1 className="mt-2 text-2xl font-bold text-slate-900">새 AI 도구 등록</h1>

      <p className="mt-2 text-sm text-slate-500">
        직접 만든 AI·자동화 도구를 등록하고 검토를 요청하세요.
      </p>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          {/* 진행 단계 */}
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-4">
            {steps.map((item, index) => (
              <div key={item} className="flex items-center gap-2 text-xs sm:text-sm">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-semibold ${
                    step >= index + 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > index + 1 ? <Check size={16} /> : index + 1}
                </span>

                <span
                  className={step === index + 1 ? 'font-semibold text-slate-900' : 'text-slate-500'}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* 등록 폼 */}
          <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {/* 단계 제목 */}
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                {['도구 기본 정보', '실행 및 공유 정보', '등록 내용 확인'][step - 1]}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {
                  [
                    '도구 유형과 기본 정보를 입력해 주세요.',
                    '도구의 저장소 및 실행 정보를 입력해 주세요.',
                    '입력한 내용을 확인하고 등록을 요청하세요.',
                  ][step - 1]
                }
              </p>
            </div>

            {/* 1단계: 기본 정보 */}
            {step === 1 && (
              <div className="space-y-6 p-6">
                <Field label="도구 유형" required>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {kindOptions.map(item => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => change('type', item.name)}
                        className={`rounded-xl border p-4 text-left ${
                          form.type === item.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <strong className="text-sm text-slate-900">{item.name}</strong>

                        <p className="mt-2 text-xs leading-5 text-slate-500">{item.detail}</p>
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="도구 이름" required>
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={e => change('name', e.target.value)}
                    maxLength={60}
                    placeholder="예: 회의록 정리 도우미"
                  />
                </Field>

                <Field label="한 줄 설명" required hint="스토어 카드에 표시되는 짧은 설명입니다.">
                  <input
                    className={inputClass}
                    value={form.summary}
                    onChange={e => change('summary', e.target.value)}
                    maxLength={130}
                    placeholder="도구의 주요 기능을 간결하게 설명해 주세요."
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="카테고리" required>
                    <CustomDropdown
                      value={form.category}
                      onChange={value => change('category', value)}
                      options={categories.filter(item => item !== '전체')}
                      ariaLabel="카테고리"
                      className="mt-2 w-full"
                    />
                  </Field>

                  <Field label="버전">
                    <input
                      className={inputClass}
                      value={form.version}
                      onChange={e => change('version', e.target.value)}
                      placeholder="0.1.0"
                    />
                  </Field>
                </div>

                <Field label="도구 소개" required>
                  <textarea
                    rows={5}
                    className={inputClass}
                    value={form.description}
                    onChange={e => change('description', e.target.value)}
                    placeholder="도구 사용 목적과 주요 기능을 설명해 주세요."
                  />
                </Field>
              </div>
            )}

            {/* 2단계: 실행 정보 */}
            {step === 2 && (
              <div className="space-y-6 p-6">
                <Field label="소스코드 / 저장소 주소" hint="GitHub, GitLab 또는 사내 저장소 URL">
                  <input
                    type="url"
                    className={inputClass}
                    value={form.repository}
                    onChange={e => change('repository', e.target.value)}
                    placeholder="https://github.com/company/repo"
                  />
                </Field>

                <Field label="도구 실행 주소" hint="배포된 도구가 있다면 URL을 입력해 주세요.">
                  <input
                    type="url"
                    className={inputClass}
                    value={form.executionUrl}
                    onChange={e => change('executionUrl', e.target.value)}
                    placeholder="https://tool.company.com"
                  />
                </Field>

                <Field label="사용 방법">
                  <textarea
                    rows={5}
                    className={inputClass}
                    value={form.usageGuide}
                    onChange={e => change('usageGuide', e.target.value)}
                    placeholder="사용 순서와 필요한 권한을 안내해 주세요."
                  />
                </Field>

                <Field label="공개 범위">
                  <div className="mt-3 flex flex-wrap gap-3">
                    {['사내 전체', '특정 부서'].map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => change('visibility', item)}
                        className={`rounded-lg border px-4 py-3 text-sm ${
                          form.visibility === item
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </Field>

                {form.visibility === '특정 부서' && (
                  <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                    실제 부서 및 접근 권한 선택은 관리자 API 연결 후 구현합니다.
                  </p>
                )}
              </div>
            )}

            {/* 3단계: 최종 확인 */}
            {step === 3 && (
              <div className="space-y-5 p-6">
                <div className="rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900">{form.name}</h3>

                  <p className="mt-2 text-sm text-slate-500">{form.summary}</p>
                </div>

                <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4 text-sm">
                  {[
                    ['유형', form.type],
                    ['카테고리', form.category],
                    ['버전', form.version || '0.1.0'],
                    ['공개 범위', form.visibility],
                    ['저장소 주소', form.repository || '미입력'],
                    ['실행 주소', form.executionUrl || '미입력'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-wrap justify-between gap-2 py-3">
                      <dt className="text-slate-500">{label}</dt>

                      <dd className="max-w-full break-all font-medium text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                  <Info className="mt-0.5 shrink-0" size={18} />

                  <span>
                    등록 후 보안검사 및 관리자 승인이 필요합니다. 지금 화면은 실제 검사 없이 '검사
                    대기' 상태로 저장하는 UI 시안입니다.
                  </span>
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="mt-1 accent-blue-600"
                    checked={form.agree}
                    onChange={e => change('agree', e.target.checked)}
                  />

                  <span>입력 내용을 확인했으며 등록을 요청합니다.</span>
                </label>
              </div>
            )}

            {/* 오류 메시지 */}
            {error && (
              <p
                role="alert"
                className="mx-6 mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            {/* 하단 버튼 */}
            <div className="flex items-center justify-between border-t border-slate-100 p-6">
              <button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    navigate('/user/aistore/mytools');
                  } else {
                    setStep(step - 1);
                    setError('');
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                {step === 1 ? '취소' : '이전'}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm text-white hover:bg-blue-700"
                >
                  다음 단계
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm text-white hover:bg-blue-700"
                >
                  <Check size={16} />
                  등록 요청
                </button>
              )}
            </div>
          </section>
        </div>

        {/* 우측 등록 안내 */}
        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-900">등록 진행 안내</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            도구 등록은 아래 절차로 진행됩니다.
          </p>

          <div className="mt-5 space-y-5">
            {[
              ['01', '정보 입력', '도구 유형과 기본 정보'],
              ['02', '보안검사', '등록된 구성과 소스 검토'],
              ['03', '검토 및 승인', '관리자 확인 후 공개 결정'],
            ].map(([num, title, detail]) => (
              <div key={num} className="flex gap-3">
                <span className="font-semibold text-blue-600">{num}</span>

                <div>
                  <p className="text-sm font-medium text-slate-800">{title}</p>

                  <p className="mt-1 text-xs text-slate-500">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-lg bg-slate-50 p-3 text-xs leading-6 text-slate-500">
            실제 소스 업로드, 검증, 승인 기능은 백엔드 연동이 필요합니다.
          </p>
        </aside>
      </div>
    </main>
  );
}
