import { Plus, X } from 'lucide-react';
import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';
import {
  CATEGORY_OPTIONS,
  MAX_SCREENSHOTS,
  SUPPORT_ENVIRONMENT_FIELDS,
  TOOL_TYPE_OPTIONS,
} from './toolRegistrationConfig.js';

export default function ToolRegistrationFields({
  form,
  setForm,
  updateForm,
  updateEnvironment,
  iconInputRef,
  screenshotInputRef,
}) {
  const typeOptions = [...new Set([form.type, ...TOOL_TYPE_OPTIONS])];
  const categoryOptions = [...new Set([form.category, ...CATEGORY_OPTIONS])];

  return (
    <>
      <fieldset>
        <legend className="text-base font-semibold text-slate-900">도구 정보 입력</legend>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            도구 이름 <span className="text-red-500">*</span>
            <input
              value={form.name}
              onChange={event => updateForm('name', event.target.value)}
              placeholder="예: 보고서 작성 도우미"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            한 줄 설명 <span className="text-red-500">*</span>
            <input
              value={form.summary}
              onChange={event => updateForm('summary', event.target.value)}
              placeholder="어떤 도구인지 간단히 설명해 주세요."
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>
          <div className="text-sm font-medium text-slate-700">
            <span>
              도구 유형 <span className="text-red-500">*</span>
            </span>
            <CustomDropdown
              value={form.type}
              options={typeOptions}
              onChange={value => updateForm('type', value)}
              ariaLabel="도구 유형 선택"
              className="mt-2"
            />
          </div>
          <div className="text-sm font-medium text-slate-700">
            <span>
              카테고리 <span className="text-red-500">*</span>
            </span>
            <CustomDropdown
              value={form.category}
              options={categoryOptions}
              onChange={value => updateForm('category', value)}
              ariaLabel="카테고리 선택"
              className="mt-2"
            />
          </div>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            상세 설명 <span className="text-red-500">*</span>
            <textarea
              value={form.description}
              onChange={event => updateForm('description', event.target.value)}
              placeholder="도구의 주요 기능과 활용 목적을 자세히 작성해 주세요."
              rows={4}
              required
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            주요 기능 <span className="text-red-500">*</span>
            <textarea
              value={form.features}
              onChange={event => updateForm('features', event.target.value)}
              placeholder="주요 기능을 한 줄에 하나씩 작성해 주세요."
              rows={4}
              required
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            사용 방법 <span className="text-red-500">*</span>
            <textarea
              value={form.instructions}
              onChange={event => updateForm('instructions', event.target.value)}
              placeholder="입력할 내용과 결과 확인 방법을 문장으로 자세히 작성해 주세요."
              rows={4}
              required
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            버전 <span className="text-red-500">*</span>
            <input
              value={form.version}
              onChange={event => updateForm('version', event.target.value)}
              placeholder="예: 1.0.0"
              required
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <div className="text-sm font-medium text-slate-700 sm:col-span-2">
            도구 아이콘 <span className="text-xs font-normal text-slate-400">(선택)</span>
            <button
              type="button"
              onClick={() => iconInputRef.current?.click()}
              className="mt-2 flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-left text-sm font-normal text-slate-500 hover:border-blue-300 hover:bg-blue-50/30"
            >
              {form.iconData ? (
                <img
                  src={form.iconData}
                  alt="업로드한 도구 아이콘 미리보기"
                  className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-white object-cover"
                />
              ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <Plus size={18} aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0 truncate">
                {form.iconName || 'PNG, JPG 또는 WEBP 이미지 (최대 2MB)'}
              </span>
            </button>
          </div>
          <div className="text-sm font-medium text-slate-700 sm:col-span-2">
            화면 이미지{' '}
            <span className="text-xs font-normal text-slate-400">
              (선택 · 최대 3장, 장당 500KB)
            </span>
            <button
              type="button"
              onClick={() => screenshotInputRef.current?.click()}
              disabled={form.screenshots.length >= MAX_SCREENSHOTS}
              className="mt-2 flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-left text-sm font-normal text-slate-500 hover:border-blue-300 hover:bg-blue-50/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <Plus size={18} aria-hidden="true" />
              </span>
              화면 이미지 선택 ({form.screenshots.length}/{MAX_SCREENSHOTS})
            </button>
            {form.screenshots.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {form.screenshots.map((screenshot, index) => (
                  <div key={`${screenshot.name}-${index}`} className="min-w-0">
                    <div className="relative">
                      <img
                        src={screenshot.data}
                        alt={`${index + 1}번째 화면 이미지 미리보기`}
                        className="aspect-video w-full rounded-lg border border-slate-200 bg-slate-50 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm(current => ({
                            ...current,
                            screenshots: current.screenshots.filter(
                              (_, imageIndex) => imageIndex !== index
                            ),
                          }))
                        }
                        aria-label={`${screenshot.name} 제거`}
                        className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
                      >
                        <X size={13} aria-hidden="true" />
                      </button>
                    </div>
                    <p
                      className="mt-1 truncate text-xs font-normal text-slate-500"
                      title={screenshot.name}
                    >
                      {screenshot.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-8 border-t border-slate-100 pt-7">
        <legend className="text-base font-semibold text-slate-900">지원 환경</legend>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          실제로 사용할 수 있는 기기와 환경을 입력해 주세요. 상세 페이지에 표시할 정보입니다.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {SUPPORT_ENVIRONMENT_FIELDS.map(field => (
            <label
              key={field.key}
              className={`text-sm font-medium text-slate-700 ${field.key === 'other' ? 'sm:col-span-2' : ''}`}
            >
              {field.label} {field.required && <span className="text-red-500">*</span>}
              <input
                value={form.supportEnvironment[field.key]}
                onChange={event => updateEnvironment(field.key, event.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
