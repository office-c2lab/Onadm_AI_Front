import useDraftState from '../../../../../../hooks/useDraftState.js';
import DialogLayer from '../../../../../../components/ui/DialogLayer.jsx';
import { GripVertical, Info, Minus, Plus, X } from 'lucide-react';
import { Fragment, useMemo, useRef, useState } from 'react';
import CustomDropdown from '../../../../../../components/dropdown/CustomDropdown.jsx';

import AppButton from '../../../../../../components/ui/Button.jsx';
import AppSearchField from '../../../../../../components/ui/SearchField.jsx';
import AppToggle from '../../../../../../components/ui/Toggle.jsx';
import FixedPaginationBar from '../../../../../../components/pagination/FixedPaginationBar.jsx';
import {
  MonitoringActionButton,
  MonitoringIconButtonTooltip,
  MonitoringResetButton,
} from '../monitoring/MonitoringListComponents.jsx';
import {
  tableBodyClass,
  tableCellClass,
  tableClass,
  tableHeadClass,
  tableHeaderCellClass,
  tableHeaderRowClass,
  tableRowClass,
  tableSurfaceClass,
} from '../../../../../../styles/table.js';
import SectionCard from '../../../../../../components/ui/SectionCard.jsx';
import { DROPDOWN_SETTING_CATEGORIES } from '../../constants/dropdownSettings.js';
import useAdaptiveRowsPerPage from '../../hooks/useAdaptiveRowsPerPage.js';
import {
  useCreateDropdownOptionMutation,
  useDeleteDropdownOptionMutation,
  useDropdownOptionsQuery,
  usePatchDropdownOptionMutation,
  usePatchDropdownOrderMutation,
} from '../../queries/dropdownSettingsQueries.js';
import {
  useCreatePiiProtectionCategoryMutation,
  useDeletePiiProtectionCategoryMutation,
  useFileUploadExtensionsQuery,
  usePatchPiiProtectionCategoryMutation,
  usePiiProtectionCategoriesQuery,
  usePiiProtectionCategoryQuery,
  usePutPiiProtectionCategoryMutation,
  usePutFileUploadExtensionsMutation,
} from '../../queries/policyQueries.js';
import { useRegisteredClientsQuery } from '../../queries/userManagementQueries.js';

const CATEGORIES = DROPDOWN_SETTING_CATEGORIES;

const DEFAULT_MODAL_DRAFT = {
  id: null,
  name: '',
  description: '',
  enabled: true,
};

const ALL_FILE_EXTENSION_CATEGORIES = '전체 분류';
const MAX_DROPDOWN_SETTING_ROWS_PER_PAGE = 10;
const MAX_FILE_EXTENSION_ROWS_PER_PAGE = 10;
const PRIVACY_ACTION_OPTIONS = ['마스킹', '차단'];

const PRIVACY_ACTION_TO_API = {
  마스킹: 'masked',
  차단: 'blocked',
};

const PRIVACY_ACTION_FROM_API = {
  masked: '마스킹',
  blocked: '차단',
};

function getCategoryMeta(category) {
  return CATEGORIES.find(item => item.key === category) ?? CATEGORIES[0];
}

function buildDraft(item) {
  if (!item) {
    return DEFAULT_MODAL_DRAFT;
  }

  return {
    id: item.id,
    name: item.name,
    description: item.description,
    enabled: item.enabled,
  };
}

function normalizeDropdownOptions(data) {
  const options = Array.isArray(data?.options) ? data.options : Array.isArray(data) ? data : [];

  return options
    .map((item, index) => ({
      id: item.id,
      name: String(item.name ?? '').trim(),
      description: String(item.description ?? ''),
      enabled: true,
      memberCount: Number(item.employee_count ?? item.memberCount ?? 0),
      order: Number(item.sort_order ?? item.order ?? index + 1),
      createdAt: String(item.created_at_kst ?? item.createdAt ?? '-'),
      updatedAt: String(item.updated_at_kst ?? item.updatedAt ?? '-'),
    }))
    .filter(item => item.id != null && item.name);
}

function getPiiCategoryEntries(data) {
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.category)) return data.category;
  if (data?.category && typeof data.category === 'object') return [data.category];
  if (Array.isArray(data)) return data;

  return [];
}

function normalizePiiKeyword(keyword) {
  if (keyword && typeof keyword === 'object') {
    return String(keyword.keyword ?? keyword.name ?? keyword.value ?? '').trim();
  }

  return String(keyword ?? '').trim();
}

function normalizePiiCategory(item) {
  const category = item && typeof item === 'object' ? item : {};
  const keywords = Array.isArray(category.keywords)
    ? category.keywords.map(normalizePiiKeyword).filter(Boolean)
    : [];
  const keywordCount = Number(category.keyword_count ?? category.keywordCount ?? keywords.length);

  return {
    id: category.id,
    category: String(category.name ?? category.category ?? '').trim(),
    keywords,
    keywordCount: Number.isFinite(keywordCount) ? keywordCount : keywords.length,
    action:
      PRIVACY_ACTION_FROM_API[category.action] ??
      (PRIVACY_ACTION_OPTIONS.includes(category.action)
        ? category.action
        : PRIVACY_ACTION_OPTIONS[0]),
    enabled: Boolean(category.enabled ?? category.is_enabled ?? category.isEnabled),
  };
}

function buildPiiCategoryPayload(draft) {
  const keywords = (Array.isArray(draft?.keywords) ? draft.keywords : [])
    .map(keyword => keyword.trim())
    .filter(Boolean);

  return {
    name: String(draft?.category ?? '').trim(),
    action: PRIVACY_ACTION_TO_API[draft?.action] ?? 'masked',
    enabled: Boolean(draft?.enabled),
    keywords,
  };
}

function SummaryCard({ title, value }) {
  const numberValue = value.replace(/[^\d,]/g, '');
  const unitValue = value.replace(/[\d,]/g, '');

  return (
    <div className="inline-flex h-[var(--app-control-lg)] items-center justify-between gap-[var(--app-gap-xs)] rounded-[var(--app-radius-lg)] border border-slate-200 bg-white px-[var(--app-pad-md)] whitespace-nowrap text-slate-600">
      <span className="text-button font-bold tracking-title">{title}</span>
      <span className="text-button font-black tracking-title">
        <span className="text-brand">{numberValue}</span> {unitValue}
      </span>
    </div>
  );
}

function FieldLabel({ children, required = false, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
      {children}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

function ItemModal({
  mode,
  category,
  draft,
  isSaving = false,
  onChange,
  onClose,
  onDelete,
  onSave,
}) {
  const meta = getCategoryMeta(category);
  const isSaveDisabled = isSaving || !draft.name.trim();
  const canDelete = mode === 'edit';
  const modalTitle = mode === 'add' ? `새 ${meta.label} 추가` : `${meta.label} 정보 수정`;
  const modalDescription =
    mode === 'add'
      ? `새로운 ${meta.label} 정보를 입력하세요.`
      : `${draft.name || meta.label}의 기본 정보를 변경합니다.`;

  return (
    <DialogLayer onClose={onClose} className="app-modal-stage z-50">
      <button
        type="button"
        className="app-modal-backdrop"
        aria-label={`${modalTitle} 닫기`}
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        aria-describedby="settings-modal-description"
        className="app-modal-panel app-modal-panel--lg"
      >
        <div className="app-modal-header flex items-center justify-between border-b border-slate-200">
          <div>
            <h2
              id="settings-modal-title"
              className="text-fluid-53 font-bold tracking-heading text-slate-900"
            >
              {modalTitle}
            </h2>
            <p id="settings-modal-description" className="mt-1 text-fluid-45 text-slate-500">
              {modalDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-primary transition hover:bg-slate-100"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="app-modal-body modal-scrollbar">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <FieldLabel htmlFor="settings-item-name" required>
                {meta.fieldLabel}
              </FieldLabel>
              <div className="relative">
                <input
                  id="settings-item-name"
                  type="text"
                  value={draft.name}
                  maxLength={50}
                  autoFocus
                  onChange={event => onChange({ name: event.target.value })}
                  placeholder={`예) ${category === 'departments' ? '전략기획팀' : '책임 매니저'}`}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-20 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-focus-border focus:ring-4 focus:ring-focus-ring"
                />
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-slate-400">
                  {draft.name.length} / 50
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <FieldLabel htmlFor="settings-item-description">설명</FieldLabel>
              <div className="relative">
                <textarea
                  id="settings-item-description"
                  value={draft.description}
                  maxLength={200}
                  rows={4}
                  onChange={event => onChange({ description: event.target.value })}
                  placeholder={`${meta.label}의 역할이나 담당 업무를 간단히 입력하세요.`}
                  className="min-h-[7rem] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 pb-8 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-focus-border focus:ring-4 focus:ring-focus-ring"
                />
                <span className="pointer-events-none absolute right-4 bottom-3 text-xs text-slate-400">
                  {draft.description.length} / 200
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="app-modal-footer flex flex-wrap items-center gap-[var(--app-gap-sm)] border-t border-slate-200">
          {canDelete ? (
            <AppButton
              variant="danger"
              onClick={onDelete}
              disabled={isSaving}
              className="h-10 min-w-[4.5rem]"
            >
              삭제
            </AppButton>
          ) : null}

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              취소
            </button>
            <AppButton onClick={onSave} disabled={isSaveDisabled} className="h-11 px-6">
              {mode === 'add' ? '추가' : category === 'departments' ? '저장' : '변경 저장'}
            </AppButton>
          </div>
        </div>
      </section>
    </DialogLayer>
  );
}

function PrivacyKeywordModal({ draft, isSaving = false, onChange, onClose, onSave }) {
  if (!draft) return null;

  const keywordValues = Array.isArray(draft.keywords) ? draft.keywords : [''];
  const hasKeyword = keywordValues.some(keyword => keyword.trim());
  const isSaveDisabled = isSaving || !draft.category.trim() || !hasKeyword;

  return (
    <DialogLayer onClose={onClose} className="app-modal-stage z-50">
      <button
        type="button"
        className="app-modal-backdrop"
        aria-label="개인정보 분류 추가 닫기"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-keyword-modal-title"
        className="app-modal-panel app-modal-panel--xl border-slate-200"
      >
        <div className="app-modal-header flex items-center justify-between border-b border-slate-200">
          <div>
            <h2
              id="privacy-keyword-modal-title"
              className="text-modal-title font-bold text-slate-900"
            >
              개인정보 분류 추가
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              새 분류의 키워드와 탐지 시 처리 방식을 설정합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-primary transition hover:bg-slate-100"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="app-modal-body !p-0">
          <div className="grid bg-white">
            <section className="border-b border-divider px-5 sm:px-6">
              <div className="grid divide-y divide-divider lg:grid-cols-[minmax(12rem,1fr)_auto_auto] lg:items-stretch lg:divide-x lg:divide-y-0">
                <div className="grid gap-2 py-5 lg:pr-5">
                  <FieldLabel htmlFor="privacy-keyword-category" required>
                    분류
                  </FieldLabel>
                  <input
                    id="privacy-keyword-category"
                    type="text"
                    value={draft.category}
                    maxLength={50}
                    autoFocus
                    onChange={event => onChange({ category: event.target.value })}
                    placeholder="예) 성함"
                    className="h-10 w-full rounded-md border border-palette-blue-44 bg-white px-3 text-compact font-medium text-text-secondary outline-none transition focus:border-focus-border focus:ring-4 focus:ring-focus-ring"
                  />
                </div>

                <div className="grid gap-2 py-5 lg:px-5">
                  <FieldLabel>처리 방식</FieldLabel>
                  <div className="flex flex-wrap items-center gap-3">
                    {PRIVACY_ACTION_OPTIONS.map(action => {
                      const isSelected = draft.action === action;

                      return (
                        <button
                          key={action}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => onChange({ action })}
                          className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold transition ${
                            isSelected ? 'text-brand' : 'text-slate-500 hover:text-brand'
                          }`.trim()}
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                              isSelected ? 'border-brand' : 'border-slate-300'
                            }`.trim()}
                            aria-hidden="true"
                          >
                            <span
                              className={`h-2 w-2 rounded-full transition ${
                                isSelected ? 'bg-brand' : 'bg-transparent'
                              }`.trim()}
                            />
                          </span>
                          {action}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-2 py-5 lg:pl-5">
                  <FieldLabel>사용 여부</FieldLabel>
                  <label className="inline-flex h-10 w-fit items-center gap-3 px-1">
                    <span className="inline-block w-[3.25em] text-center text-sm font-semibold text-slate-700">
                      {draft.enabled ? '사용' : '미사용'}
                    </span>
                    <AppToggle
                      checked={draft.enabled}
                      onChange={() => onChange({ enabled: !draft.enabled })}
                      aria-label="개인정보 키워드 사용 여부"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="px-5 py-5 sm:px-6">
              <h3 className="mb-4 text-body-sm font-bold text-palette-blue-109">포함 키워드</h3>
              <div className="grid gap-2 pr-1">
                {keywordValues.map((keyword, index) => {
                  const canRemove = keywordValues.length > 1;
                  const isLast = index === keywordValues.length - 1;

                  return (
                    <div key={`privacy-keyword-${index}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={keyword}
                        maxLength={100}
                        onChange={event => {
                          const nextKeywords = [...keywordValues];
                          nextKeywords[index] = event.target.value;
                          onChange({ keywords: nextKeywords });
                        }}
                        placeholder={index === 0 ? '예) 김가림' : '키워드 입력'}
                        className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-focus-border focus:ring-4 focus:ring-focus-ring"
                      />
                      <button
                        type="button"
                        onClick={() => onChange({ keywords: [...keywordValues, ''] })}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand transition hover:bg-surface-hover ${
                          isLast ? '' : 'invisible'
                        }`.trim()}
                        aria-label="키워드 입력 추가"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            keywords: canRemove
                              ? keywordValues.filter((_, keywordIndex) => keywordIndex !== index)
                              : [''],
                          })
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="키워드 입력 삭제"
                        disabled={!canRemove && !keyword.trim()}
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-5 py-5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            취소
          </button>
          <AppButton onClick={onSave} disabled={isSaveDisabled} className="h-11 px-6">
            추가
          </AppButton>
        </div>
      </section>
    </DialogLayer>
  );
}

function PrivacyKeywordDetailModal({
  draft,
  isSaving = false,
  onChange,
  onClose,
  onDelete,
  onSave,
}) {
  const [keywordSearchInput, setKeywordSearchInput] = useState('');
  const [keywordSearchQuery, setKeywordSearchQuery] = useState('');

  if (!draft) return null;

  const keywordValues = Array.isArray(draft.keywords) ? draft.keywords : [''];
  const normalizedKeywordSearch = keywordSearchQuery.trim().toLowerCase();
  const visibleKeywordEntries = keywordValues
    .map((keyword, index) => ({ keyword, index }))
    .filter(({ keyword }) =>
      normalizedKeywordSearch ? keyword.toLowerCase().includes(normalizedKeywordSearch) : true
    );
  const hasKeyword = keywordValues.some(keyword => keyword.trim());
  const isSaveDisabled = isSaving || !draft.category.trim() || !hasKeyword;

  return (
    <DialogLayer onClose={onClose} className="app-modal-stage z-50">
      <button
        type="button"
        className="app-modal-backdrop"
        aria-label="개인정보 분류 상세 설정 닫기"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-detail-modal-title"
        className="app-modal-panel app-modal-panel--xl border-slate-200"
      >
        <div className="app-modal-header flex items-center justify-between border-b border-slate-200">
          <div>
            <h2
              id="privacy-detail-modal-title"
              className="text-modal-title font-bold text-slate-900"
            >
              개인정보 분류 상세 설정
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              선택한 분류의 키워드와 탐지 시 처리 방식을 관리합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-primary transition hover:bg-slate-100"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="app-modal-body !p-0">
          <div className="grid bg-white">
            <section className="border-b border-divider px-5 sm:px-6">
              <div className="grid divide-y divide-divider lg:grid-cols-[minmax(12rem,1fr)_auto_auto] lg:items-stretch lg:divide-x lg:divide-y-0">
                <div className="grid gap-2 py-5 lg:pr-5">
                  <FieldLabel htmlFor="privacy-detail-category" required>
                    분류
                  </FieldLabel>
                  <input
                    id="privacy-detail-category"
                    type="text"
                    value={draft.category}
                    maxLength={50}
                    onChange={event => onChange({ category: event.target.value })}
                    className="h-10 w-full rounded-md border border-palette-blue-44 bg-white px-3 text-compact font-medium text-text-secondary outline-none transition focus:border-focus-border focus:ring-4 focus:ring-focus-ring"
                    placeholder="예) 성함"
                  />
                </div>

                <div className="grid gap-2 py-5 lg:px-5">
                  <FieldLabel>처리 방식</FieldLabel>
                  <div className="flex flex-wrap items-center gap-3">
                    {PRIVACY_ACTION_OPTIONS.map(action => {
                      const isSelected = draft.action === action;

                      return (
                        <button
                          key={action}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => onChange({ action })}
                          className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold transition ${
                            isSelected ? 'text-brand' : 'text-slate-500 hover:text-brand'
                          }`.trim()}
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                              isSelected ? 'border-brand' : 'border-slate-300'
                            }`.trim()}
                            aria-hidden="true"
                          >
                            <span
                              className={`h-2 w-2 rounded-full transition ${
                                isSelected ? 'bg-brand' : 'bg-transparent'
                              }`.trim()}
                            />
                          </span>
                          {action}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-2 py-5 lg:pl-5">
                  <FieldLabel>사용 여부</FieldLabel>
                  <label className="inline-flex h-10 w-fit items-center gap-3 px-1">
                    <span className="inline-block w-[3.25em] text-center text-sm font-semibold text-slate-700">
                      {draft.enabled ? '사용' : '미사용'}
                    </span>
                    <AppToggle
                      checked={draft.enabled}
                      onChange={() => onChange({ enabled: !draft.enabled })}
                      aria-label="개인정보 분류 사용 여부"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="px-5 py-5 sm:px-6">
              <h3 className="mb-4 text-body-sm font-bold text-palette-blue-109">포함 키워드</h3>
              <form
                className="mb-4 flex flex-col gap-3 border-b border-divider pb-4 sm:flex-row"
                onSubmit={event => {
                  event.preventDefault();
                  setKeywordSearchQuery(keywordSearchInput);
                }}
              >
                <AppSearchField
                  value={keywordSearchInput}
                  onChange={event => setKeywordSearchInput(event.target.value)}
                  placeholder="키워드 검색"
                />
                <AppButton type="submit" className="h-12 min-w-[4.5rem]">
                  검색
                </AppButton>
              </form>
              <div className="grid gap-2 pr-1">
                {visibleKeywordEntries.map(({ keyword, index }) => {
                  const canRemove = keywordValues.length > 1;
                  const isLast = index === keywordValues.length - 1;

                  return (
                    <div
                      key={`privacy-detail-keyword-${index}`}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={keyword}
                        maxLength={100}
                        onChange={event => {
                          const nextKeywords = [...keywordValues];
                          nextKeywords[index] = event.target.value;
                          onChange({ keywords: nextKeywords });
                        }}
                        placeholder="예) 김가림"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-focus-border focus:ring-4 focus:ring-focus-ring"
                      />
                      <button
                        type="button"
                        onClick={() => onChange({ keywords: [...keywordValues, ''] })}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand transition hover:bg-surface-hover ${
                          isLast ? '' : 'invisible'
                        }`.trim()}
                        aria-label="키워드 입력 추가"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            keywords: canRemove
                              ? keywordValues.filter((_, keywordIndex) => keywordIndex !== index)
                              : [''],
                          })
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="키워드 입력 삭제"
                        disabled={!canRemove && !keyword.trim()}
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
                {!visibleKeywordEntries.length ? (
                  <div className="rounded-xl border border-dashed border-palette-blue-34 px-4 py-5 text-center text-sm font-semibold text-slate-400">
                    검색 조건에 맞는 키워드가 없습니다.
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-slate-200 px-5 py-5 sm:px-6">
          <AppButton
            variant="danger"
            onClick={onDelete}
            disabled={isSaving}
            className="h-11 min-w-[4.5rem]"
          >
            삭제
          </AppButton>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              취소
            </button>
            <AppButton onClick={onSave} disabled={isSaveDisabled} className="h-11 px-6">
              저장
            </AppButton>
          </div>
        </div>
      </section>
    </DialogLayer>
  );
}

function PrivacyCategoryDeleteModal({ target, isSaving = false, onClose, onConfirm }) {
  if (!target) return null;

  const keywordCount = Array.isArray(target.keywords) ? target.keywords.length : 0;
  const deleteRows = [
    { label: '분류', value: target.category || '-' },
    { label: '포함 키워드', value: `${keywordCount.toLocaleString()}개` },
    { label: '처리 방식', value: target.action || '-' },
  ];

  return (
    <DialogLayer onClose={onClose} className="app-modal-stage z-[90]">
      <button
        type="button"
        aria-label="개인정보 분류 삭제 닫기"
        className="app-modal-backdrop cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-privacy-category-modal-title"
        className="app-modal-panel"
      >
        <div className="app-modal-header flex items-center justify-between gap-[var(--app-gap-md)] border-b border-border-subtle">
          <h3
            id="delete-privacy-category-modal-title"
            className="text-modal-title font-bold text-text-primary"
          >
            개인정보 분류 삭제
          </h3>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-palette-blue-73 transition hover:bg-palette-blue-13 hover:text-brand"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="app-modal-body">
          <div className="space-y-1.5 text-sm font-semibold leading-6 text-gray-600">
            <p>선택한 개인정보 분류를 삭제하시겠습니까?</p>
            <p>삭제하면 해당 분류에 포함된 키워드도 함께 제거됩니다.</p>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-sm font-bold text-text-primary">삭제 대상</span>
              <span className="h-px flex-1 bg-border-subtle" />
            </div>

            <dl className="mt-3 rounded-lg border border-palette-blue-33 px-5 py-4">
              {deleteRows.map(row => (
                <div
                  key={row.label}
                  className="grid min-h-7 grid-cols-[7.2rem_1fr] items-center gap-2 text-compact"
                >
                  <dt className="font-extrabold text-text-action">{row.label}</dt>
                  <dd className="truncate font-semibold text-palette-blue-107" title={row.value}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border-subtle px-6 py-4">
          <AppButton variant="secondary" onClick={onClose} className="h-11 min-w-[4.5rem]">
            취소
          </AppButton>
          <AppButton
            variant="danger"
            onClick={onConfirm}
            disabled={isSaving}
            className="h-11 min-w-[4.5rem]"
          >
            삭제
          </AppButton>
        </div>
      </div>
    </DialogLayer>
  );
}

export function DropdownSettingsContent({ toolbarAction = null }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState({
    mode: null,
    itemId: null,
    draft: DEFAULT_MODAL_DRAFT,
  });
  const [dragState, setDragState] = useState({
    itemId: null,
    overItemId: null,
    position: null,
  });
  const dragPreviewRef = useRef(null);
  const dragImageRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const { containerRef: tableAreaRef, rowsPerPage } = useAdaptiveRowsPerPage({
    maxRows: MAX_DROPDOWN_SETTING_ROWS_PER_PAGE,
    minRows: 4,
    rowHeight: 55,
  });
  const { data: departmentsData, isLoading: isDepartmentsLoading } = useDropdownOptionsQuery({
    kind: 'departments',
  });
  const { data: positionsData, isLoading: isPositionsLoading } = useDropdownOptionsQuery({
    kind: 'positions',
  });
  const { mutate: createDropdownOption, isPending: isCreating } = useCreateDropdownOptionMutation();
  const { mutate: patchDropdownOption, isPending: isPatching } = usePatchDropdownOptionMutation();
  const { mutate: patchDropdownOrder, isPending: isOrdering } = usePatchDropdownOrderMutation();
  const { mutate: deleteDropdownOption, isPending: isDeleting } = useDeleteDropdownOptionMutation();
  const { data: clientsData } = useRegisteredClientsQuery();

  const activeMeta = CATEGORIES.find(category => category.key === activeCategory) ?? CATEGORIES[0];
  const departmentItems = useMemo(
    () => normalizeDropdownOptions(departmentsData),
    [departmentsData]
  );
  const positionItems = useMemo(() => normalizeDropdownOptions(positionsData), [positionsData]);
  const itemsByCategory = useMemo(
    () => ({
      departments: departmentItems,
      positions: positionItems,
    }),
    [departmentItems, positionItems]
  );
  const activeItems = useMemo(
    () => [...itemsByCategory[activeCategory]].sort((a, b) => a.order - b.order),
    [activeCategory, itemsByCategory]
  );
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activeItems.filter(item => (query ? item.name.toLowerCase().includes(query) : true));
  }, [activeItems, searchQuery]);
  const modalOpen = Boolean(modalState.mode);
  const isSaving = isCreating || isPatching || isOrdering || isDeleting;
  const isLoading = isDepartmentsLoading || isPositionsLoading;
  const protectedTargetCount = Array.isArray(clientsData?.clients) ? clientsData.clients.length : 0;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visibleItems = filteredItems.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const handleChangeCategory = category => {
    setActiveCategory(category);
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const handleOpenAddModal = () => {
    setModalState({
      mode: 'add',
      itemId: null,
      draft: buildDraft(null),
    });
  };

  const handleOpenEditModal = item => {
    setModalState({
      mode: 'edit',
      itemId: item.id,
      draft: buildDraft(item),
    });
  };

  const handleCloseModal = () => {
    setModalState({
      mode: null,
      itemId: null,
      draft: DEFAULT_MODAL_DRAFT,
    });
  };

  const handleChangeDraft = nextDraft => {
    setModalState(current => ({
      ...current,
      draft: {
        ...current.draft,
        ...nextDraft,
      },
    }));
  };

  const handleDragStart = (event, itemId) => {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', itemId);

    const row = event.currentTarget.closest('tr');
    if (row) {
      dragPreviewRef.current?.remove();
      dragImageRef.current?.remove();

      const rowRect = row.getBoundingClientRect();
      const previewTable = document.createElement('table');
      const previewBody = document.createElement('tbody');
      const previewRow = row.cloneNode(true);
      const rowCells = [...row.children];
      const previewCells = [...previewRow.children];

      rowCells.forEach((cell, index) => {
        const cellWidth = `${cell.getBoundingClientRect().width}px`;
        previewCells[index].style.width = cellWidth;
        previewCells[index].style.minWidth = cellWidth;
        previewCells[index].style.maxWidth = cellWidth;
      });

      previewTable.style.position = 'fixed';
      previewTable.style.top = `${rowRect.top}px`;
      previewTable.style.left = `${rowRect.left}px`;
      previewTable.style.width = `${rowRect.width}px`;
      previewTable.style.tableLayout = 'fixed';
      previewTable.style.borderCollapse = 'separate';
      previewTable.style.borderSpacing = '0';
      previewTable.style.overflow = 'hidden';
      previewTable.style.borderRadius = '12px';
      previewTable.style.background = 'var(--color-palette-blue-30)';
      previewTable.style.boxShadow = 'var(--shadow-drag-preview)';
      previewTable.style.zIndex = '9999';
      previewTable.style.pointerEvents = 'none';
      previewTable.style.opacity = '1';
      previewRow.style.background = 'var(--color-palette-blue-30)';
      previewCells.forEach(cell => {
        cell.style.background = 'var(--color-palette-blue-30)';
        cell.style.borderColor = 'var(--color-palette-blue-60)';
      });

      previewBody.appendChild(previewRow);
      previewTable.appendChild(previewBody);
      document.body.appendChild(previewTable);
      dragPreviewRef.current = previewTable;

      const transparentDragImage = document.createElement('div');
      transparentDragImage.style.position = 'fixed';
      transparentDragImage.style.top = '-10000px';
      transparentDragImage.style.left = '-10000px';
      transparentDragImage.style.width = '1px';
      transparentDragImage.style.height = '1px';
      transparentDragImage.style.opacity = '0';
      document.body.appendChild(transparentDragImage);
      dragImageRef.current = transparentDragImage;

      dragOffsetRef.current = {
        x: Math.max(0, event.clientX - rowRect.left),
        y: Math.max(0, event.clientY - rowRect.top),
      };
      event.dataTransfer.setDragImage(transparentDragImage, 0, 0);
    }

    setDragState({
      itemId,
      overItemId: null,
      position: null,
    });
  };

  const moveDragPreview = event => {
    if (!dragPreviewRef.current || event.clientX === 0 || event.clientY === 0) return;

    dragPreviewRef.current.style.left = `${event.clientX - dragOffsetRef.current.x}px`;
    dragPreviewRef.current.style.top = `${event.clientY - dragOffsetRef.current.y}px`;
  };

  const clearDragPreview = () => {
    dragPreviewRef.current?.remove();
    dragImageRef.current?.remove();
    dragPreviewRef.current = null;
    dragImageRef.current = null;
  };

  const handleDragOver = (event, itemId) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    moveDragPreview(event);

    if (!dragState.itemId || dragState.itemId === itemId) return;

    const { top, height } = event.currentTarget.getBoundingClientRect();
    const position = event.clientY < top + height / 2 ? 'before' : 'after';

    setDragState(current =>
      current.overItemId === itemId && current.position === position
        ? current
        : {
            ...current,
            overItemId: itemId,
            position,
          }
    );
  };

  const handleDrop = (event, targetItemId) => {
    event.preventDefault();
    event.stopPropagation();

    const sourceItemId = dragState.itemId || event.dataTransfer.getData('text/plain');
    if (!sourceItemId || sourceItemId === targetItemId) {
      clearDragPreview();
      setDragState({ itemId: null, overItemId: null, position: null });
      return;
    }

    const orderedItems = [...activeItems].sort((a, b) => a.order - b.order);
    const sourceItem = orderedItems.find(item => String(item.id) === String(sourceItemId));
    const withoutSource = orderedItems.filter(item => String(item.id) !== String(sourceItemId));
    const targetIndex = withoutSource.findIndex(item => String(item.id) === String(targetItemId));

    if (sourceItem && targetIndex >= 0) {
      const insertIndex = targetIndex + (dragState.position === 'after' ? 1 : 0);
      withoutSource.splice(insertIndex, 0, sourceItem);
      patchDropdownOrder({
        kind: activeCategory,
        ids: withoutSource.map(item => Number(item.id)),
      });
    }

    clearDragPreview();
    setDragState({ itemId: null, overItemId: null, position: null });
  };

  const handleDragEnd = () => {
    clearDragPreview();
    setDragState({ itemId: null, overItemId: null, position: null });
  };

  const handleSaveModal = () => {
    const { mode, itemId, draft } = modalState;
    const option = {
      name: draft.name.trim(),
      description: draft.description.trim(),
    };

    if (mode === 'edit') {
      patchDropdownOption(
        {
          kind: activeCategory,
          optionId: itemId,
          option,
        },
        {
          onSuccess: handleCloseModal,
        }
      );
      return;
    }

    createDropdownOption(
      {
        kind: activeCategory,
        option,
      },
      {
        onSuccess: handleCloseModal,
      }
    );
  };

  const handleDeleteDepartment = () => {
    if (modalState.mode !== 'edit') return;

    deleteDropdownOption(
      {
        kind: activeCategory,
        optionId: modalState.itemId,
      },
      {
        onSuccess: handleCloseModal,
      }
    );
  };

  return (
    <>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {toolbarAction ? (
          <div className="flex shrink-0 items-center justify-start">{toolbarAction}</div>
        ) : null}
        <div className="grid flex-1 gap-3 sm:grid-cols-3 xl:max-w-[36rem]">
          <SummaryCard title="부서 항목" value={`${departmentItems.length}개`} />
          <SummaryCard title="직책 항목" value={`${positionItems.length}개`} />
          <SummaryCard title="보호 대상" value={`${protectedTargetCount}명`} />
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-slate-200 lg:flex-row lg:items-end lg:justify-between">
          <div className="overflow-x-auto">
            <div className="flex h-12 min-w-max items-end gap-7">
              {CATEGORIES.map(category => {
                const isActive = category.key === activeCategory;

                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => handleChangeCategory(category.key)}
                    className={`relative flex h-12 min-w-[4rem] items-center justify-center px-1 text-sm font-black transition ${
                      isActive ? 'text-brand' : 'text-slate-600 hover:text-brand'
                    }`.trim()}
                  >
                    {category.label}
                    {isActive ? (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pb-3 text-size-0-82rem font-semibold text-slate-500">
            <Info className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span>설정 항목을 탭으로 전환해 관리할 수 있습니다.</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[auto_auto] lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:w-[27rem] sm:flex-row">
            <AppSearchField
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
              placeholder={activeMeta.placeholder}
              className="w-full"
            />
            <AppButton onClick={handleSearch} className="h-12 min-w-[4.5rem]">
              검색
            </AppButton>
            <MonitoringIconButtonTooltip label="초기화">
              <MonitoringResetButton
                onClick={handleResetSearch}
                heightClass="h-12"
                widthClass="w-12 shrink-0"
                aria-label="초기화"
              />
            </MonitoringIconButtonTooltip>
          </div>

          <div className="w-full rounded-xl">
            <MonitoringActionButton
              variant="primary"
              onClick={handleOpenAddModal}
              disabled={isSaving}
              heightClass="h-12"
              widthClass="w-full"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />새 항목 추가
            </MonitoringActionButton>
          </div>
        </div>
      </div>

      <div ref={tableAreaRef} className={tableSurfaceClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[min(100%,60rem)] table-fixed border-separate border-spacing-0 text-left">
            <thead className="bg-[linear-gradient(180deg,var(--color-table-header-start)_0%,var(--color-table-header-end)_100%)]">
              <tr className="text-sm font-black text-palette-blue-96">
                <th className="w-[6%] border-b border-slate-200 px-3 py-3" />
                <th className="w-[24%] border-b border-slate-200 px-3 py-3">
                  {activeMeta.fieldLabel}
                </th>
                <th className="w-[34%] border-b border-slate-200 px-3 py-3">설명</th>
                <th className="w-[16%] border-b border-slate-200 px-3 py-3 text-center">인원수</th>
                <th className="w-[20%] border-b border-slate-200 px-3 py-3 text-center">생성일</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {visibleItems.map(item => (
                <tr
                  key={item.id}
                  onDragOver={event => handleDragOver(event, item.id)}
                  onDrop={event => handleDrop(event, item.id)}
                  onClick={() => handleOpenEditModal(item)}
                  className={`relative cursor-pointer bg-white transition hover:bg-surface-hover ${
                    dragState.itemId === item.id ? '[&>td]:bg-palette-blue-45' : ''
                  } ${
                    dragState.overItemId === item.id && dragState.position === 'before'
                      ? '[&>td]:bg-palette-blue-19'
                      : dragState.overItemId === item.id && dragState.position === 'after'
                        ? '[&>td]:bg-palette-blue-19'
                        : ''
                  }`.trim()}
                >
                  <td className="border-b border-slate-200 px-3 py-3 text-center text-palette-blue-86">
                    <button
                      type="button"
                      draggable
                      onClick={event => event.stopPropagation()}
                      onDragStart={event => handleDragStart(event, item.id)}
                      onDrag={moveDragPreview}
                      onDragEnd={handleDragEnd}
                      aria-label={`${item.name} 순서 변경`}
                      title="누른 상태로 드래그하여 순서 변경"
                      className="mx-auto inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-lg text-palette-blue-86 transition hover:bg-palette-blue-19 hover:text-brand active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3">
                    <span className="font-black text-slate-800">{item.name}</span>
                  </td>
                  <td
                    className="truncate border-b border-slate-200 px-3 py-3 font-semibold text-slate-500"
                    title={item.description}
                  >
                    {item.description || '-'}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3 text-center font-semibold text-palette-blue-95">
                    {item.memberCount.toLocaleString()}명
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3 text-center font-semibold text-palette-blue-95">
                    {item.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading || !filteredItems.length ? (
          <section className="border-t border-dashed border-palette-blue-34 px-6 py-4 text-center text-sm text-slate-400">
            {isLoading ? '드롭다운 항목을 불러오는 중입니다.' : '등록된 항목이 없습니다.'}
          </section>
        ) : null}
      </div>

      {filteredItems.length ? (
        <FixedPaginationBar
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : null}

      {modalOpen ? (
        <ItemModal
          mode={modalState.mode}
          category={activeCategory}
          draft={modalState.draft}
          isSaving={isSaving}
          onChange={handleChangeDraft}
          onClose={handleCloseModal}
          onDelete={handleDeleteDepartment}
          onSave={handleSaveModal}
        />
      ) : null}
    </>
  );
}

export function FileUploadProtectionContent({ toolbarAction = null, variant = 'file' }) {
  const isPrivacyVariant = variant === 'privacy';
  const { data, isLoading, isError } = useFileUploadExtensionsQuery({
    enabled: !isPrivacyVariant,
  });
  const {
    data: piiCategoriesData,
    isLoading: isPiiCategoriesLoading,
    isError: isPiiCategoriesError,
  } = usePiiProtectionCategoriesQuery({
    enabled: isPrivacyVariant,
  });
  const [selectedPrivacyRowId, setSelectedPrivacyRowId] = useState(null);
  const { data: piiCategoryDetailData, isFetching: isPiiCategoryDetailFetching } =
    usePiiProtectionCategoryQuery(selectedPrivacyRowId, {
      enabled: isPrivacyVariant && Boolean(selectedPrivacyRowId),
    });
  const { mutate: saveFileUploadExtensions, isPending: isSaving } =
    usePutFileUploadExtensionsMutation();
  const { mutate: createPiiCategory, isPending: isCreatingPiiCategory } =
    useCreatePiiProtectionCategoryMutation();
  const { mutate: putPiiCategory, isPending: isPuttingPiiCategory } =
    usePutPiiProtectionCategoryMutation();
  const { mutate: patchPiiCategory, isPending: isPatchingPiiCategory } =
    usePatchPiiProtectionCategoryMutation();
  const { mutate: deletePiiCategory, isPending: isDeletingPiiCategory } =
    useDeletePiiProtectionCategoryMutation();
  const extensions = useMemo(
    () => (Array.isArray(data?.extensions) ? data.extensions : []),
    [data]
  );
  const privacyRows = useMemo(
    () => getPiiCategoryEntries(piiCategoriesData).map(normalizePiiCategory),
    [piiCategoriesData]
  );
  const rows = isPrivacyVariant ? privacyRows : extensions;
  const showLoading = isPrivacyVariant ? isPiiCategoriesLoading : isLoading;
  const showError = isPrivacyVariant ? isPiiCategoriesError : isError;
  const protectionSource = useMemo(() => ({ rows, isPrivacyVariant }), [rows, isPrivacyVariant]);
  const [blockedExtensions, setBlockedExtensions] = useDraftState(protectionSource, source =>
    source.rows
      .filter(item => (source.isPrivacyVariant ? item.enabled : item.blocked))
      .map(item => String(source.isPrivacyVariant ? item.id : item.extension))
  );
  const [privacyActions, setPrivacyActions] = useDraftState(protectionSource, source =>
    Object.fromEntries(source.rows.map(item => [item.id, item.action ?? PRIVACY_ACTION_OPTIONS[0]]))
  );
  const [privacyModalState, setPrivacyModalState] = useState({ mode: null, draft: null });
  const detailSource = useMemo(
    () => ({ isPrivacyVariant, piiCategoryDetailData, selectedPrivacyRowId }),
    [isPrivacyVariant, piiCategoryDetailData, selectedPrivacyRowId]
  );
  const [privacyDetailDraft, setPrivacyDetailDraft] = useDraftState(
    detailSource,
    (source, previous = null) => {
      if (!source.isPrivacyVariant || !source.selectedPrivacyRowId) return previous;
      const category = getPiiCategoryEntries(source.piiCategoryDetailData).map(
        normalizePiiCategory
      )[0];
      if (!category) return previous;
      return {
        id: category.id,
        category: category.category,
        keywords: category.keywords.length ? category.keywords : [''],
        action: category.action,
        enabled: category.enabled,
      };
    }
  );
  const [privacyDeleteTarget, setPrivacyDeleteTarget] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(ALL_FILE_EXTENSION_CATEGORIES);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { containerRef: tableAreaRef, rowsPerPage } = useAdaptiveRowsPerPage({
    maxRows: MAX_FILE_EXTENSION_ROWS_PER_PAGE,
    minRows: 4,
    rowHeight: 55,
  });
  const isSavingPiiCategory =
    isCreatingPiiCategory ||
    isPuttingPiiCategory ||
    isPatchingPiiCategory ||
    isDeletingPiiCategory ||
    isPiiCategoryDetailFetching;

  const blockedSet = useMemo(() => new Set(blockedExtensions), [blockedExtensions]);
  const categoryOptions = useMemo(() => {
    const categories = rows.map(item => String(item.category ?? '').trim()).filter(Boolean);

    return [ALL_FILE_EXTENSION_CATEGORIES, ...new Set(categories)];
  }, [rows]);
  const filteredExtensions = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return rows.filter(item => {
      const category = String(item.category ?? '');
      const detailItems = Array.isArray(item.mime_types) ? item.mime_types : [];
      const matchesCategory =
        selectedCategory === ALL_FILE_EXTENSION_CATEGORIES || category === selectedCategory;
      const searchableText = [
        isPrivacyVariant ? item.category : item.extension,
        isPrivacyVariant ? null : item.label,
        item.category,
        isPrivacyVariant ? privacyActions[item.id] : null,
        ...(isPrivacyVariant && Array.isArray(item.keywords) ? item.keywords : []),
        ...detailItems,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = keyword ? searchableText.includes(keyword) : true;

      return matchesCategory && matchesSearch;
    });
  }, [isPrivacyVariant, privacyActions, rows, searchQuery, selectedCategory]);
  const totalPages = Math.max(1, Math.ceil(filteredExtensions.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visibleExtensions = filteredExtensions.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );
  const getTableCellClass = (index, className = '') =>
    tableCellClass(
      index,
      `${isPrivacyVariant ? 'py-[calc(var(--app-pad-xs)*0.7)]' : ''} ${className}`.trim()
    );
  const handleToggleExtension = extension => {
    const nextBlockedExtensions = blockedExtensions.includes(extension)
      ? blockedExtensions.filter(item => item !== extension)
      : [...blockedExtensions, extension];

    setBlockedExtensions(nextBlockedExtensions);
    if (isPrivacyVariant) {
      patchPiiCategory({
        categoryId: extension,
        payload: {
          enabled: nextBlockedExtensions.includes(extension),
        },
      });
      return;
    }

    saveFileUploadExtensions(
      {
        blockedExtensions: nextBlockedExtensions,
      },
      {
        onError: () => {
          setBlockedExtensions(
            rows.filter(item => item.blocked).map(item => String(item.extension ?? ''))
          );
        },
      }
    );
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleChangeCategory = category => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory(ALL_FILE_EXTENSION_CATEGORIES);
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleChangePrivacyAction = (keyword, action) => {
    setPrivacyActions(current => ({ ...current, [keyword]: action }));
    patchPiiCategory({
      categoryId: keyword,
      payload: {
        action: PRIVACY_ACTION_TO_API[action] ?? 'masked',
      },
    });
  };

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const handleOpenPrivacyAddModal = () => {
    setPrivacyModalState({
      mode: 'add',
      draft: {
        id: null,
        category: '',
        keywords: [''],
        action: PRIVACY_ACTION_OPTIONS[0],
        enabled: true,
      },
    });
  };

  const handleOpenPrivacyEditModal = item => {
    if (selectedPrivacyRowId === item.id) {
      setSelectedPrivacyRowId(null);
      setPrivacyDetailDraft(null);
      return;
    }

    setSelectedPrivacyRowId(item.id);
    setPrivacyDetailDraft({
      id: item.id,
      category: item.category,
      keywords: Array.isArray(item.keywords) && item.keywords.length ? item.keywords : [''],
      action: privacyActions[item.id] ?? item.action ?? PRIVACY_ACTION_OPTIONS[0],
      enabled: blockedSet.has(item.id),
    });
  };

  const handleChangePrivacyDraft = nextValue => {
    setPrivacyModalState(current => ({
      ...current,
      draft: { ...current.draft, ...nextValue },
    }));
  };

  const handleClosePrivacyModal = () => {
    setPrivacyModalState({ mode: null, draft: null });
  };

  const handleChangePrivacyDetailDraft = nextValue => {
    setPrivacyDetailDraft(current => ({ ...current, ...nextValue }));
  };

  const handleClosePrivacyDetail = () => {
    setSelectedPrivacyRowId(null);
    setPrivacyDetailDraft(null);
  };

  const savePrivacyDraft = (draft, mode = 'edit') => {
    if (!draft?.category.trim()) return false;

    const payload = buildPiiCategoryPayload(draft);
    if (!payload.keywords.length) return false;

    if (mode === 'edit') {
      putPiiCategory({
        categoryId: draft.id,
        payload,
      });
    } else {
      createPiiCategory(payload);
    }

    setCurrentPage(1);
    return true;
  };

  const handleSavePrivacyModal = () => {
    const { mode, draft } = privacyModalState;
    if (!savePrivacyDraft(draft, mode)) return;
    handleClosePrivacyModal();
  };

  const handleSavePrivacyDetail = () => {
    if (!savePrivacyDraft(privacyDetailDraft, 'edit')) return;
    handleClosePrivacyDetail();
  };

  const handleRequestDeletePrivacyKeyword = draft => {
    setPrivacyDeleteTarget(draft);
  };

  const handleClosePrivacyDeleteModal = () => {
    setPrivacyDeleteTarget(null);
  };

  const handleConfirmDeletePrivacyKeyword = () => {
    const draft = privacyDeleteTarget;
    const keywordId = draft?.id;
    if (!keywordId) return;

    deletePiiCategory(keywordId);
    if (privacyModalState.draft?.id === keywordId) {
      handleClosePrivacyModal();
    }
    if (selectedPrivacyRowId === keywordId) {
      handleClosePrivacyDetail();
    }
    handleClosePrivacyDeleteModal();
  };

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {toolbarAction ? <div className="flex shrink-0 justify-start">{toolbarAction}</div> : null}

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:justify-end">
          <CustomDropdown
            value={selectedCategory}
            options={categoryOptions}
            onChange={handleChangeCategory}
            ariaLabel={isPrivacyVariant ? '개인정보 키워드 분류 필터' : '파일 확장자 분류 필터'}
            className="w-full lg:w-[12rem] lg:shrink-0 [&>button]:h-12 [&>button]:rounded-xl"
          />

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-[38rem]">
            <AppSearchField
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
              placeholder={
                isPrivacyVariant ? '분류, 키워드, 처리 방식 검색' : '확장자, 정보, MIME 타입 검색'
              }
            />
            <AppButton onClick={handleSearch} className="h-12 min-w-[4.5rem]">
              검색
            </AppButton>
            <MonitoringIconButtonTooltip label="초기화">
              <MonitoringResetButton
                onClick={handleResetFilters}
                heightClass="h-12"
                widthClass="w-12 shrink-0"
                aria-label="초기화"
              />
            </MonitoringIconButtonTooltip>
            {isPrivacyVariant ? (
              <AppButton
                onClick={handleOpenPrivacyAddModal}
                disabled={isSavingPiiCategory}
                className="h-12 min-w-[5.25rem]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />새 분류 추가
              </AppButton>
            ) : null}
          </div>
        </div>
      </div>

      <div ref={tableAreaRef} className={tableSurfaceClass}>
        <div className="overflow-x-auto">
          <table className={`min-w-[min(100%,53.75rem)] ${tableClass} text-left`}>
            {isPrivacyVariant ? (
              <colgroup>
                <col className="w-[36%]" />
                <col className="w-[24%]" />
                <col className="w-[28%]" />
                <col className="w-[12%]" />
              </colgroup>
            ) : (
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[20%]" />
                <col className="w-[16%]" />
                <col className="w-[40%]" />
                <col className="w-[10%]" />
              </colgroup>
            )}
            <thead className={tableHeadClass}>
              <tr className={tableHeaderRowClass}>
                <th className={tableHeaderCellClass}>{isPrivacyVariant ? '분류' : '확장자'}</th>
                {isPrivacyVariant ? null : <th className={tableHeaderCellClass}>정보</th>}
                <th className={tableHeaderCellClass}>
                  {isPrivacyVariant ? '포함 키워드' : '분류'}
                </th>
                {isPrivacyVariant ? null : <th className={tableHeaderCellClass}>MIME 타입</th>}
                {isPrivacyVariant ? <th className={tableHeaderCellClass}>처리 방식</th> : null}
                <th className={tableHeaderCellClass}>{isPrivacyVariant ? '사용' : '차단'}</th>
              </tr>
            </thead>
            <tbody className={tableBodyClass}>
              {visibleExtensions.map((item, index) => {
                const extension = String(isPrivacyVariant ? item.id : item.extension);
                const keywords = Array.isArray(item.keywords) ? item.keywords : [];
                const keywordCount = Number(item.keywordCount ?? keywords.length);
                const mimeTypes = Array.isArray(item.mime_types) ? item.mime_types : [];
                const isBlocked = blockedSet.has(extension);
                const isSelectedPrivacyRow = isPrivacyVariant && selectedPrivacyRowId === item.id;

                return (
                  <Fragment key={extension}>
                    <tr
                      onClick={
                        isPrivacyVariant ? () => handleOpenPrivacyEditModal(item) : undefined
                      }
                      className={tableRowClass({
                        selected: isSelectedPrivacyRow,
                        striped: index % 2 === 1,
                        interactive: isPrivacyVariant,
                      })}
                    >
                      <td className={getTableCellClass(index, 'whitespace-nowrap')}>
                        <span className="pl-2 font-black text-brand">
                          {isPrivacyVariant ? item.category : `.${extension}`}
                        </span>
                      </td>
                      {isPrivacyVariant ? null : (
                        <td className={getTableCellClass(index)}>
                          <span className="font-black text-palette-blue-115">
                            {item.label ?? '-'}
                          </span>
                        </td>
                      )}
                      <td
                        className={getTableCellClass(index, 'font-semibold text-palette-blue-95')}
                      >
                        {isPrivacyVariant ? (
                          <span className="pl-2 font-black text-brand">
                            {keywordCount.toLocaleString()}개
                          </span>
                        ) : (
                          (item.category ?? '-')
                        )}
                      </td>
                      {isPrivacyVariant ? null : (
                        <td
                          className={getTableCellClass(
                            index,
                            'truncate font-semibold text-slate-500'
                          )}
                          title={mimeTypes.join(', ')}
                        >
                          {mimeTypes.length ? mimeTypes.join(', ') : '-'}
                        </td>
                      )}
                      {isPrivacyVariant ? (
                        <td className={getTableCellClass(index)}>
                          <div className="flex flex-wrap items-center gap-[var(--app-gap-xs)]">
                            {PRIVACY_ACTION_OPTIONS.map(action => {
                              const isSelected =
                                (privacyActions[extension] ??
                                  item.action ??
                                  PRIVACY_ACTION_OPTIONS[0]) === action;

                              return (
                                <button
                                  key={action}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={event => {
                                    event.stopPropagation();
                                    handleChangePrivacyAction(extension, action);
                                  }}
                                  disabled={isSavingPiiCategory}
                                  className={`inline-flex h-[calc(var(--app-control-xs)*0.9)] items-center gap-[calc(var(--app-gap-xs)*0.8)] rounded-[var(--app-radius-md)] border border-transparent bg-transparent px-[var(--app-pad-xs)] text-fluid-37 font-bold whitespace-nowrap transition ${
                                    isSelected ? 'text-brand' : 'text-slate-500 hover:text-brand'
                                  }`.trim()}
                                >
                                  <span
                                    className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                                      isSelected ? 'border-brand' : 'border-slate-300'
                                    }`.trim()}
                                    aria-hidden="true"
                                  >
                                    <span
                                      className={`h-2 w-2 rounded-full transition ${
                                        isSelected ? 'bg-brand' : 'bg-transparent'
                                      }`.trim()}
                                    />
                                  </span>
                                  {action}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      ) : null}
                      <td className={getTableCellClass(index)}>
                        <span
                          className="inline-flex"
                          onClick={isPrivacyVariant ? event => event.stopPropagation() : undefined}
                        >
                          <AppToggle
                            checked={isBlocked}
                            onChange={() => handleToggleExtension(extension)}
                            aria-label={`${isPrivacyVariant ? item.category : extension} ${
                              isPrivacyVariant ? '분류 사용 여부' : '확장자 차단 여부'
                            }`}
                            disabled={isPrivacyVariant ? isSavingPiiCategory : isSaving}
                          />
                        </span>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {showLoading || showError || !filteredExtensions.length ? (
          <section className="border-t border-dashed border-palette-blue-34 px-6 py-4 text-center text-sm font-semibold text-slate-400">
            {showLoading
              ? `${isPrivacyVariant ? '개인정보 키워드' : '파일 확장자'} 정보를 불러오는 중입니다.`
              : showError
                ? `${isPrivacyVariant ? '개인정보 키워드' : '파일 확장자'} 정보를 불러오지 못했습니다.`
                : rows.length
                  ? `검색 조건에 맞는 ${isPrivacyVariant ? '개인정보 키워드' : '파일 확장자'}가 없습니다.`
                  : `등록된 ${isPrivacyVariant ? '개인정보 키워드' : '파일 확장자'}가 없습니다.`}
          </section>
        ) : null}
      </div>

      {filteredExtensions.length ? (
        <FixedPaginationBar
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : null}

      {isPrivacyVariant && privacyModalState.mode ? (
        <PrivacyKeywordModal
          mode={privacyModalState.mode}
          draft={privacyModalState.draft}
          isSaving={isSavingPiiCategory}
          onChange={handleChangePrivacyDraft}
          onClose={handleClosePrivacyModal}
          onDelete={() => handleRequestDeletePrivacyKeyword(privacyModalState.draft)}
          onSave={handleSavePrivacyModal}
        />
      ) : null}

      {isPrivacyVariant && privacyDetailDraft ? (
        <PrivacyKeywordDetailModal
          draft={privacyDetailDraft}
          isSaving={isSavingPiiCategory}
          onChange={handleChangePrivacyDetailDraft}
          onClose={handleClosePrivacyDetail}
          onDelete={() => handleRequestDeletePrivacyKeyword(privacyDetailDraft)}
          onSave={handleSavePrivacyDetail}
        />
      ) : null}

      {isPrivacyVariant && privacyDeleteTarget ? (
        <PrivacyCategoryDeleteModal
          target={privacyDeleteTarget}
          isSaving={isSavingPiiCategory}
          onClose={handleClosePrivacyDeleteModal}
          onConfirm={handleConfirmDeletePrivacyKeyword}
        />
      ) : null}
    </>
  );
}
