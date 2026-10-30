import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';
import {
  CATEGORY_OPTIONS,
  CUSTOM_SUPPORT_ENVIRONMENT_OPTION,
  MAX_SCREENSHOTS,
  SUPPORT_ENVIRONMENT_FIELDS,
  TOOL_TYPE_OPTIONS,
} from './toolRegistrationConfig.js';

const inputClass =
  'mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

function FormSection({ title, children }) {
  return (
    <section className="border-t border-slate-200 py-9 sm:py-10">
      <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

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
  const [environmentChoices, setEnvironmentChoices] = useState(() =>
    Object.fromEntries(
      SUPPORT_ENVIRONMENT_FIELDS.filter(field => field.options).map(field => {
        const currentValue = form.supportEnvironment[field.key];
        const choice = field.options.includes(currentValue)
          ? currentValue
          : currentValue
            ? CUSTOM_SUPPORT_ENVIRONMENT_OPTION
            : '';
        return [field.key, choice];
      })
    )
  );

  const selectEnvironmentChoice = (field, value) => {
    setEnvironmentChoices(current => ({ ...current, [field.key]: value }));
    if (value !== CUSTOM_SUPPORT_ENVIRONMENT_OPTION) {
      updateEnvironment(field.key, value);
      return;
    }
    if (field.options.includes(form.supportEnvironment[field.key])) {
      updateEnvironment(field.key, '');
    }
  };

  return (
    <>
      <FormSection title="기본 정보">
        <div className="grid max-w-4xl gap-5 sm:grid-cols-2">
          <div className="text-sm font-medium text-slate-700 sm:col-span-2">
            도구 아이콘 <span className="text-xs font-normal text-slate-400">(선택)</span>
            <button
              type="button"
              onClick={() => iconInputRef.current?.click()}
              className="mt-2 flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-left text-sm font-normal text-slate-500 hover:border-blue-300"
            >
              {form.iconData ? (
                <img
                  src={form.iconData}
                  alt="업로드한 도구 아이콘 미리보기"
                  className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Plus size={20} aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0 truncate">
                {form.iconName || 'PNG, JPG 또는 WEBP 이미지'}
              </span>
            </button>
          </div>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            도구 이름 <span className="text-red-500">*</span>
            <input
              value={form.name}
              onChange={event => updateForm('name', event.target.value)}
              placeholder="예: 보고서 작성 도우미"
              className={inputClass}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            한 줄 설명 <span className="text-red-500">*</span>
            <input
              value={form.summary}
              onChange={event => updateForm('summary', event.target.value)}
              placeholder="어떤 도구인지 간단히 설명해 주세요."
              className={inputClass}
              required
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="스크린샷">
        <div className="max-w-4xl text-sm font-medium text-slate-700">
          <p className="mb-2 text-xs font-normal text-slate-400">선택 사항</p>
          <button
            type="button"
            onClick={() => screenshotInputRef.current?.click()}
            disabled={form.screenshots.length >= MAX_SCREENSHOTS}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-left text-sm font-normal text-slate-500 hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Plus size={18} aria-hidden="true" />
            </span>
            화면 이미지 선택 ({form.screenshots.length}/{MAX_SCREENSHOTS})
            <span className="ml-auto hidden text-xs text-slate-400 sm:inline">최대 3장</span>
          </button>
          {form.screenshots.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {form.screenshots.map((screenshot, index) => (
                <div key={`${screenshot.name}-${index}`} className="min-w-0">
                  <div className="relative">
                    <img
                      src={screenshot.data}
                      alt={`${index + 1}번째 화면 이미지 미리보기`}
                      className="aspect-video w-full rounded-xl border border-slate-200 object-cover"
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
                      className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
                    >
                      <X size={13} aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mt-1 truncate text-xs font-normal text-slate-500">
                    {screenshot.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="설명">
        <label className="block max-w-4xl text-sm font-medium text-slate-700">
          상세 설명 <span className="text-red-500">*</span>
          <textarea
            value={form.description}
            onChange={event => updateForm('description', event.target.value)}
            placeholder="도구의 목적과 활용 상황을 일반 문단으로 작성해 주세요."
            rows={6}
            required
            className={`${inputClass} resize-y leading-7`}
          />
        </label>
      </FormSection>

      <FormSection title="주요 기능">
        <label className="block max-w-4xl text-sm font-medium text-slate-700">
          주요 기능 <span className="text-red-500">*</span>
          <textarea
            value={form.features}
            onChange={event => updateForm('features', event.target.value)}
            placeholder="주요 기능을 일반 문단으로 작성해 주세요."
            rows={6}
            required
            className={`${inputClass} resize-y leading-7`}
          />
        </label>
      </FormSection>

      <FormSection title="사용 방법">
        <label className="block max-w-4xl text-sm font-medium text-slate-700">
          사용 방법 <span className="text-red-500">*</span>
          <textarea
            value={form.instructions}
            onChange={event => updateForm('instructions', event.target.value)}
            placeholder="입력할 내용과 결과 확인 방법을 일반 문단으로 작성해 주세요."
            rows={6}
            required
            className={`${inputClass} resize-y leading-7`}
          />
        </label>
      </FormSection>

      <FormSection title="지원 환경">
        <div className="grid max-w-4xl gap-5 sm:grid-cols-2">
          {SUPPORT_ENVIRONMENT_FIELDS.map(field => (
            <div
              key={field.key}
              className={`text-sm font-medium text-slate-700 ${
                field.key === 'other' ? 'sm:col-span-2' : ''
              }`}
            >
              <span>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </span>
              {field.options ? (
                <>
                  <CustomDropdown
                    value={environmentChoices[field.key]}
                    options={[...field.options, CUSTOM_SUPPORT_ENVIRONMENT_OPTION]}
                    onChange={value => selectEnvironmentChoice(field, value)}
                    ariaLabel={`${field.label} 선택`}
                    placeholder={field.placeholder}
                    className="mt-2"
                  />
                  {environmentChoices[field.key] === CUSTOM_SUPPORT_ENVIRONMENT_OPTION && (
                    <input
                      value={form.supportEnvironment[field.key]}
                      onChange={event => updateEnvironment(field.key, event.target.value)}
                      placeholder={field.customPlaceholder}
                      aria-label={`${field.label} 직접 입력`}
                      required={field.required}
                      className={inputClass}
                    />
                  )}
                </>
              ) : (
                <input
                  value={form.supportEnvironment[field.key]}
                  onChange={event => updateEnvironment(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="도구 정보">
        <div className="grid max-w-4xl gap-5 sm:grid-cols-2">
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
        </div>
      </FormSection>

      <FormSection title="버전 정보">
        <label className="block max-w-4xl text-sm font-medium text-slate-700">
          버전 <span className="text-red-500">*</span>
          <input
            value={form.version}
            onChange={event => updateForm('version', event.target.value)}
            placeholder="예: 1.0.0"
            required
            className={inputClass}
          />
        </label>
      </FormSection>
    </>
  );
}
