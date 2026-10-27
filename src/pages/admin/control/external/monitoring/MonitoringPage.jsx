import {
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppButton from '../components/AppButton.jsx';
import AppSearchField from '../components/AppSearchField.jsx';
import FixedPaginationBar from '../components/FixedPaginationBar.jsx';
import { getServiceLogo } from '../components/ServiceLogoBadge.jsx';
import {
  DateRangePicker,
  MonitoringActionButton,
  MonitoringDataTable,
  MonitoringIconButtonTooltip,
  MonitoringResetButton,
} from '../components/monitoring/MonitoringListComponents.jsx';
import {
  APP_PAGE_HORIZONTAL_PADDING_CLASS,
  APP_PAGE_INNER_WIDTH_CLASS,
  APP_PAGE_OUTER_WIDTH_CLASS,
} from '../constants/contentLayout.js';
import { getStatusTextClassName as getStatusColorClassName } from '../constants/statusColors.js';
import useAdaptiveRowsPerPage from '../hooks/useAdaptiveRowsPerPage.js';
import { useDropdownSelectOptionsQuery } from '../queries/dropdownSettingsQueries.js';
import {
  useMonitoringEventsExportMutation,
  useMonitoringEventsQuery,
} from '../queries/monitoringQueries.js';

const ALL_USERS_OPTION = '사용자';
const ALL_DEPARTMENTS_OPTION = '부서';
const ALL_POSITIONS_OPTION = '직급';
const ALL_POLICIES_OPTION = '정책';
const MAX_ROWS_PER_PAGE = 10;
const MONITORING_FILTER_STORAGE_KEY = 'garim:monitoring-filters:v1';

function getStoredMonitoringFilters() {
  if (typeof window === 'undefined') return {};

  try {
    const storedValue = window.localStorage.getItem(MONITORING_FILTER_STORAGE_KEY);
    if (!storedValue) return {};

    const parsedValue = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
  } catch {
    return {};
  }
}

function getStoredFilterValues(value) {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.map(item => String(item).trim()).filter(Boolean))];
}

function getStoredFilterText(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function normalizeDropdownOptionNames(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map(item => String(item?.name ?? '').trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, 'ko'));
}

function normalizeMonitoringEvent(event, index) {
  if (event.detectedAt) {
    const originalPrompt = getOriginalPromptDetail(event);
    const forwardedPrompt = getForwardedPromptDetail(event);
    const displayPrompt =
      getLogStatusCategory(event) === 'normal' && (!forwardedPrompt || forwardedPrompt === '-')
        ? originalPrompt
        : forwardedPrompt;
    const eventId = event.id ?? event.event_id ?? event.no ?? `${event.detectedAt}-${index}`;

    return {
      ...event,
      id: eventId,
      no: event.no ?? event.id ?? event.event_id ?? index + 1,
      prompt: displayPrompt,
      promptDetail: originalPrompt,
      originalPromptDetail: originalPrompt,
      forwardedPromptDetail: displayPrompt,
      policyCode: getPolicyCode(event),
      policyName: getPolicyName(event),
      detectionDetail: getGuardrailReason(event),
      actionDetail: getActionDetail(event),
      department:
        event.department ?? event.dept ?? event.organization ?? event.org ?? event.team ?? '-',
      position: event.position ?? event.jobTitle ?? event.job_title ?? event.role ?? '-',
      maskedPromptDetail: getMaskedPromptDetail(event),
      attachedFiles: normalizeAttachedFiles(event),
      attachmentAnalysisResults: normalizeAttachmentAnalysisResults(event),
    };
  }

  const result = event.status === '허용' ? '정상' : (event.status ?? '정상');
  const isNormal = result === '정상';
  const originalPrompt = getOriginalPromptDetail(event);
  const forwardedPrompt = getForwardedPromptDetail(event);
  const displayPrompt =
    isNormal && (!forwardedPrompt || forwardedPrompt === '-') ? originalPrompt : forwardedPrompt;
  const answer = event.ai_response ?? '-';
  const userName =
    event.username ?? event.user_name ?? event.user ?? event.user_id ?? event.userId ?? '-';

  return {
    id: event.id ?? event.event_id ?? event.no ?? `${event.time_kst ?? 'event'}-${index}`,
    no: event.no ?? event.id ?? event.event_id ?? index + 1,
    detectedAt: event.time_kst ?? '-',
    aiType: event.service ?? '-',
    organization: '-',
    prompt: displayPrompt,
    result,
    content: getGuardrailReason(event),
    userIp: event.client_ip ?? '-',
    userId: userName,
    department:
      event.department ?? event.dept ?? event.organization ?? event.org ?? event.team ?? '-',
    position: event.position ?? event.jobTitle ?? event.job_title ?? event.role ?? '-',
    level: isNormal ? 'safe' : 'danger',
    promptDetail: originalPrompt,
    originalPromptDetail: originalPrompt,
    forwardedPromptDetail: displayPrompt,
    maskedPromptDetail: getMaskedPromptDetail(event),
    answerDetail: answer,
    policyCode: getPolicyCode(event),
    policyName: getPolicyName(event),
    attachedFiles: normalizeAttachedFiles(event),
    attachmentAnalysisResults: normalizeAttachmentAnalysisResults(event),
    detectionDetail: getGuardrailReason(event),
    actionDetail: getActionDetail(event),
  };
}

function getOriginalPromptDetail(event) {
  return (
    event.originalPromptDetail ??
    event.original_prompt_detail ??
    event.originalInput ??
    event.original_input ??
    event.promptDetail ??
    event.prompt ??
    event.input ??
    '-'
  );
}

function getForwardedPromptDetail(event) {
  return (
    event.forwardedPromptDetail ??
    event.forwarded_prompt_detail ??
    event.forwarded_prompt ??
    event.forwardedInput ??
    event.forwarded_input ??
    event.maskedPromptDetail ??
    event.masked_prompt_detail ??
    event.maskedPrompt ??
    event.masked_prompt ??
    event.masked_input ??
    event.maskedInput ??
    '-'
  );
}

function getGuardrailReason(event) {
  return (
    event.guardrailReason ??
    event.guardrail_reason ??
    event.detectionDetail ??
    event.detection_detail ??
    event.reason ??
    ''
  );
}

function getPolicyCode(event) {
  return event.policyCode ?? event.policy_code ?? '';
}

function getPolicyName(event) {
  return event.policyName ?? event.policy_name ?? event.policy ?? '';
}

function getActionDetail(event) {
  return event.actionDetail ?? event.action_detail ?? event.ai_response ?? '';
}

function getMaskedPromptDetail(event) {
  return (
    event.maskedPromptDetail ??
    event.masked_prompt_detail ??
    event.maskedPrompt ??
    event.masked_prompt ??
    event.masked_input ??
    event.maskedInput ??
    '-'
  );
}

function normalizeAttachedFiles(event) {
  const rawFiles =
    event.attachedFiles ??
    event.attachments ??
    event.files ??
    event.file_list ??
    event.uploaded_files ??
    event.fileName ??
    event.filename ??
    event.file_name;

  if (!rawFiles) {
    return [];
  }

  const files = Array.isArray(rawFiles) ? rawFiles : [rawFiles];

  return files
    .map(file => {
      if (!file) return '';

      if (typeof file === 'string') {
        return file;
      }

      const name =
        file.name ?? file.fileName ?? file.filename ?? file.file_name ?? file.originalName;
      const size = file.size ?? file.fileSize ?? file.file_size;

      if (!name) return '';

      return size ? `${name} (${size})` : name;
    })
    .filter(Boolean);
}

function normalizeAttachmentAnalysisResults(event) {
  const rawResults =
    event.attachmentAnalysisResults ??
    event.attachment_analysis_results ??
    event.fileAnalysisResults ??
    event.file_analysis_results ??
    event.attachmentAnalysis ??
    event.attachment_analysis ??
    event.fileAnalysis ??
    event.file_analysis;

  if (!rawResults) {
    return [];
  }

  const results = Array.isArray(rawResults) ? rawResults : [rawResults];

  return results
    .flatMap(result => {
      if (!result) return [];

      if (typeof result === 'string') {
        return result
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean);
      }

      const fileName =
        result.fileName ??
        result.filename ??
        result.file_name ??
        result.name ??
        result.originalName;
      const status = result.status ?? result.result ?? result.outcome;
      const detail = result.detail ?? result.message ?? result.description ?? result.reason;
      const detections = result.detections ?? result.detectedItems ?? result.detected_items;
      const detectionText = Array.isArray(detections) ? detections.join(', ') : detections;
      const parts = [fileName, status, detail, detectionText].filter(Boolean);

      return parts.length ? [parts.join(' - ')] : [];
    })
    .filter(Boolean);
}

function createDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date(endDate);

  startDate.setDate(endDate.getDate() - 13);

  return {
    startDate: formatDateValue(startDate),
    endDate: formatDateValue(endDate),
  };
}

function getLogStatusCategory(log) {
  const result = log.result ?? log.status;
  const actionDetail = log.actionDetail ?? '';

  if (result === '정상' || result === '허용') return 'normal';
  if (result === '마스킹') return 'masking';
  if (result === '차단') return 'block';

  if (actionDetail.includes('경고로 기록')) return 'normal';

  if (
    result === '개인정보 탐지' ||
    actionDetail.includes('마스킹') ||
    actionDetail.includes('치환') ||
    actionDetail.includes('대체') ||
    actionDetail.includes('제거한 버전')
  ) {
    return 'masking';
  }

  return 'block';
}

function getStatusLabel(row) {
  const statusCategory = getLogStatusCategory(row);

  if (statusCategory === 'masking') return '마스킹';
  if (statusCategory === 'block') return '차단';
  return '정상';
}

function getDetectedPolicyName(row) {
  return row.policyName || row.policy_name || '-';
}

function getStatusTextClassName(row) {
  return getStatusColorClassName(getLogStatusCategory(row));
}

function normalizeLogDateTime(value) {
  return String(value).replace(' ', 'T');
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildAnswerDetail(row) {
  return row.answerDetail || '-';
}

function buildPromptPanelState(row, showOriginal) {
  const statusCategory = getLogStatusCategory(row);

  if (statusCategory === 'normal') {
    return {
      title: '프롬프트',
      text: row.forwardedPromptDetail ?? row.originalPromptDetail ?? row.promptDetail ?? '-',
      toggleLabel: null,
      canToggle: false,
    };
  }

  if (showOriginal) {
    const toggleLabel =
      statusCategory === 'block' ? '차단 안내 보기' : '마스킹 처리된 프롬프트 보기';

    return {
      title: '원문 프롬프트',
      text: row.originalPromptDetail ?? row.promptDetail ?? '-',
      toggleLabel,
      canToggle: true,
    };
  }

  if (statusCategory === 'block') {
    return {
      title: '차단 안내',
      text: row.forwardedPromptDetail || '-',
      toggleLabel: '원문 프롬프트 보기',
      canToggle: true,
    };
  }

  if (statusCategory === 'masking') {
    return {
      title: '마스킹 처리된 프롬프트',
      text: row.forwardedPromptDetail ?? row.maskedPromptDetail ?? '-',
      toggleLabel: '원문 프롬프트 보기',
      canToggle: true,
    };
  }

  return {
    title: '실제 전달 프롬프트',
    text: row.forwardedPromptDetail ?? row.maskedPromptDetail ?? '-',
    toggleLabel: '원문 프롬프트 보기',
    canToggle: true,
  };
}

function buildDetailContext(row) {
  const statusCategory = getLogStatusCategory(row);
  const detectionDetail = row.detectionDetail || '-';
  const policyName = getDetectedPolicyName(row);
  const actionStatus =
    statusCategory === 'masking'
      ? '마스킹 처리'
      : statusCategory === 'block'
        ? '차단 처리'
        : '정상 처리';

  return {
    policyName,
    actionStatus,
    policyItems: policyName === '-' ? [] : [policyName],
    answerDetail: buildAnswerDetail(row),
    evidenceLines: splitDetailLines(detectionDetail),
    actionLines: [actionStatus],
  };
}

function splitDetailLines(value) {
  if (!value || value === '-') return ['-'];

  return String(value)
    .split('\n')
    .flatMap(line => line.split('. '))
    .map(line => line.replaceAll('·', '').trim())
    .filter(Boolean)
    .map(line => (line.endsWith('.') ? line : `${line}.`));
}

function DetailSectionLabel({ children }) {
  return <div className="text-[13px] font-bold tracking-[-0.01em] text-[#075DF6]">{children}</div>;
}

function DetailSummaryItem({ label, value, valueNode = null, valueClassName = '' }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-[#7C86A7]">{label}</p>
      {valueNode ?? (
        <p
          className={`truncate pt-1 text-[13px] font-semibold tracking-[-0.01em] text-[#2E3A59] ${valueClassName}`.trim()}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function ServiceSummaryValue({ service }) {
  const serviceLogo = getServiceLogo(service);

  return (
    <div className="flex min-w-0 items-center gap-2 pt-1">
      {serviceLogo ? (
        <img
          src={serviceLogo}
          alt={`${service} logo`}
          className="h-[var(--app-icon-md)] w-[var(--app-icon-md)] shrink-0 object-contain"
          loading="lazy"
        />
      ) : null}
      <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-[#2E3A59]">
        {service}
      </span>
    </div>
  );
}

function MonitoringMultiSelectDropdown({
  selectedValues,
  options,
  allOption,
  allLabel,
  selectionLabel,
  ariaLabel,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const displayValue =
    selectedValues.length === 0
      ? allLabel
      : selectedValues.length === 1
        ? selectedValues[0]
        : `${selectionLabel} ${selectedValues.length}개`;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = event => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = event => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleOptionChange = option => {
    if (option === allOption) {
      onChange([]);
      return;
    }

    onChange(
      selectedValues.includes(option)
        ? selectedValues.filter(value => value !== option)
        : [...selectedValues, option]
    );
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(current => !current)}
        className={`flex h-[var(--app-control-lg)] w-full cursor-pointer items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          isOpen
            ? 'border-blue-500 text-slate-900'
            : 'border-slate-200 text-slate-700 hover:border-slate-300'
        }`.trim()}
      >
        <span className="min-w-0 flex-1 truncate">{displayValue}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`.trim()}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+0.25rem)] z-40 max-h-60 w-full min-w-[12rem] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/10">
          {options.map(option => {
            const isSelected =
              option === allOption ? selectedValues.length === 0 : selectedValues.includes(option);

            return (
              <button
                key={option}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleOptionChange(option)}
                className={`flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm transition-colors ${
                  isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                }`.trim()}
              >
                <span className="min-w-0 flex-1 truncate">
                  {option === allOption ? '전체' : option}
                </span>
                {isSelected ? (
                  <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function UserScopeFilterDropdown({
  selectedDepartments,
  selectedPositions,
  selectedUsers,
  boundaryRef,
  departmentOptions,
  positionOptions,
  userOptions,
  onDepartmentChange,
  onPositionChange,
  onUserChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSelectionPanelOpen, setIsSelectionPanelOpen] = useState(true);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const [draftFilters, setDraftFilters] = useState({
    departments: selectedDepartments,
    positions: selectedPositions,
    users: selectedUsers,
  });
  const [filterQueries, setFilterQueries] = useState({
    department: '',
    position: '',
    user: '',
  });
  const rootRef = useRef(null);
  const optionLabels = {
    [ALL_DEPARTMENTS_OPTION]: '전체',
    [ALL_POSITIONS_OPTION]: '전체',
    [ALL_USERS_OPTION]: '전체',
  };
  const selectedParts = [
    selectedDepartments.length === 1
      ? selectedDepartments[0]
      : selectedDepartments.length > 1
        ? `부서 ${selectedDepartments.length}개`
        : '',
    selectedPositions.length === 1
      ? selectedPositions[0]
      : selectedPositions.length > 1
        ? `직급 ${selectedPositions.length}개`
        : '',
    selectedUsers.length === 1
      ? selectedUsers[0]
      : selectedUsers.length > 1
        ? `사용자 ${selectedUsers.length}명`
        : '',
  ].filter(Boolean);
  const displayValue = selectedParts.length ? selectedParts.join(' / ') : '사용자 필터';

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = event => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const updateDropdownBounds = () => {
      const rootRect = rootRef.current?.getBoundingClientRect();
      const boundaryRect = boundaryRef.current?.getBoundingClientRect();
      if (!rootRect || !boundaryRect) return;

      setDropdownStyle({
        left: `${boundaryRect.left - rootRect.left}px`,
        width: `${boundaryRect.width}px`,
      });
    };

    updateDropdownBounds();
    window.addEventListener('resize', updateDropdownBounds);
    const resizeObserver = new ResizeObserver(updateDropdownBounds);
    if (boundaryRef.current) resizeObserver.observe(boundaryRef.current);

    return () => {
      window.removeEventListener('resize', updateDropdownBounds);
      resizeObserver.disconnect();
    };
  }, [boundaryRef, isOpen]);

  const sections = [
    {
      title: '부서',
      queryKey: 'department',
      valueKey: 'departments',
      searchPlaceholder: '부서 검색',
      defaultValue: ALL_DEPARTMENTS_OPTION,
      value: draftFilters.departments,
      options: departmentOptions,
      multiple: true,
    },
    {
      title: '직급',
      queryKey: 'position',
      valueKey: 'positions',
      searchPlaceholder: '직급 검색',
      defaultValue: ALL_POSITIONS_OPTION,
      value: draftFilters.positions,
      options: positionOptions,
      multiple: true,
    },
    {
      title: '사용자',
      queryKey: 'user',
      valueKey: 'users',
      searchPlaceholder: '사용자명 검색',
      defaultValue: ALL_USERS_OPTION,
      value: draftFilters.users,
      options: userOptions,
      multiple: true,
    },
  ];
  const activeFilters = sections.flatMap(section => {
    if (section.multiple) {
      return section.value.map(value => ({
        ...section,
        key: `${section.queryKey}-${value}`,
        label: value,
      }));
    }

    return section.value === section.defaultValue
      ? []
      : [{ ...section, key: section.queryKey, label: section.value }];
  });
  const activeFilterCount = activeFilters.length;
  const activeFilterRows = sections.map(section => ({
    ...section,
    filters: activeFilters.filter(filter => filter.queryKey === section.queryKey),
  }));

  const openDropdown = () => {
    setDraftFilters({
      departments: selectedDepartments,
      positions: selectedPositions,
      users: selectedUsers,
    });
    setFilterQueries({ department: '', position: '', user: '' });
    setIsOpen(true);
  };

  const handleToggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    openDropdown();
  };

  const handleQueryChange = (queryKey, value) => {
    setFilterQueries(current => ({ ...current, [queryKey]: value }));
  };

  const handleOptionChange = (section, option) => {
    if (section.multiple) {
      setDraftFilters(current => {
        if (option === section.defaultValue) {
          return { ...current, [section.valueKey]: [] };
        }

        const currentValues = current[section.valueKey];
        const nextValues = currentValues.includes(option)
          ? currentValues.filter(value => value !== option)
          : [...currentValues, option];

        return { ...current, [section.valueKey]: nextValues };
      });
      return;
    }

    setDraftFilters(current => ({ ...current, [section.queryKey]: option }));
    handleQueryChange(section.queryKey, '');
  };

  const handleRemoveActiveFilter = filter => {
    if (filter.multiple) {
      setDraftFilters(current => ({
        ...current,
        [filter.valueKey]: current[filter.valueKey].filter(value => value !== filter.label),
      }));
      return;
    }

    handleOptionChange(filter, filter.defaultValue);
  };

  const handleClearAll = () => {
    setDraftFilters({
      departments: [],
      positions: [],
      users: [],
    });
    setFilterQueries({ department: '', position: '', user: '' });
  };

  const handleCancel = () => {
    setDraftFilters({
      departments: selectedDepartments,
      positions: selectedPositions,
      users: selectedUsers,
    });
    setFilterQueries({ department: '', position: '', user: '' });
    setIsOpen(false);
  };

  const handleConfirm = () => {
    onDepartmentChange(draftFilters.departments);
    onPositionChange(draftFilters.positions);
    onUserChange(draftFilters.users);
    setFilterQueries({ department: '', position: '', user: '' });
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <button
        type="button"
        aria-label="사용자 및 조직 필터"
        aria-expanded={isOpen}
        onClick={handleToggleDropdown}
        className={`flex h-[var(--app-control-lg)] w-full cursor-pointer items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          isOpen
            ? 'border-blue-500 text-slate-900'
            : 'border-slate-200 text-slate-700 hover:border-slate-300'
        }`.trim()}
      >
        <span className="flex min-w-0 flex-1 items-center">
          <span className="truncate">{displayValue}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`.trim()}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          style={dropdownStyle ?? undefined}
          className={`absolute top-[calc(100%+0.25rem)] z-40 grid items-start gap-3 ${
            isSelectionPanelOpen ? 'md:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)]' : 'grid-cols-1'
          } ${dropdownStyle ? 'visible' : 'invisible'}`.trim()}
        >
          <div
            className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-900/10 ${
              isSelectionPanelOpen ? '' : 'md:w-3/5 md:justify-self-center'
            }`.trim()}
          >
            <div className="flex min-h-[3.25rem] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">사용자 및 조직 필터</p>
              <button
                type="button"
                aria-expanded={isSelectionPanelOpen}
                onClick={() => setIsSelectionPanelOpen(current => !current)}
                className={`inline-flex h-[var(--app-control-xs)] shrink-0 items-center gap-1.5 rounded-[var(--app-radius-md)] border px-2.5 text-[clamp(0.74rem,0.84vw,0.8rem)] font-bold transition ${
                  isSelectionPanelOpen
                    ? 'border-[#B6D9FF] bg-[#EFF6FF] text-[#075DF6]'
                    : 'border-[#D7DEEA] bg-white text-[#667085] hover:border-[#B6D9FF] hover:text-[#075DF6]'
                }`.trim()}
              >
                선택 항목
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${isSelectionPanelOpen ? 'rotate-180' : ''}`.trim()}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="grid min-w-0 md:grid-cols-3">
              {sections.map(section => {
                const query = filterQueries[section.queryKey].trim().toLocaleLowerCase('ko');
                const filteredOptions = section.options.filter(option => {
                  if (!query) return true;
                  if (option === section.defaultValue) return false;
                  return option.toLocaleLowerCase('ko').includes(query);
                });

                return (
                  <section
                    key={section.title}
                    className="min-w-0 md:border-l md:border-slate-200 md:first:border-l-0"
                  >
                    <div className="border-b border-slate-200 px-3 py-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-700">
                          {section.title}
                        </span>
                      </div>
                      <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                        <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <input
                          type="search"
                          value={filterQueries[section.queryKey]}
                          onChange={event =>
                            handleQueryChange(section.queryKey, event.target.value)
                          }
                          placeholder={section.searchPlaceholder}
                          aria-label={section.searchPlaceholder}
                          className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        />
                      </label>
                    </div>
                    <div className="hover-scrollbar flex max-h-60 flex-col gap-1 overflow-y-auto overscroll-contain p-1.5">
                      {filteredOptions.map(option => {
                        const isSelected = section.multiple
                          ? option === section.defaultValue
                            ? section.value.length === 0
                            : section.value.includes(option)
                          : option === section.value;

                        return (
                          <button
                            key={`${section.title}-${option}`}
                            type="button"
                            onClick={() => handleOptionChange(section, option)}
                            aria-pressed={section.multiple ? isSelected : undefined}
                            title={optionLabels[option] ?? option}
                            className={`flex min-h-9 w-full shrink-0 cursor-pointer items-center gap-2 rounded-md px-2.5 text-left text-sm transition-colors ${
                              isSelected
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`.trim()}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {optionLabels[option] ?? option}
                            </span>
                            {isSelected ? (
                              <Check
                                className="h-4 w-4 shrink-0"
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            ) : null}
                          </button>
                        );
                      })}
                      {!filteredOptions.length ? (
                        <p className="px-2 py-5 text-center text-[clamp(0.76rem,0.86vw,0.82rem)] font-medium text-[#98A2B3]">
                          검색 결과가 없습니다.
                        </p>
                      ) : null}
                    </div>
                  </section>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-3">
              <div>
                {activeFilterCount ? (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="h-[var(--app-control-md)] rounded-[var(--app-radius-md)] px-3 text-[clamp(0.78rem,0.88vw,0.84rem)] font-bold text-[#075DF6] transition hover:bg-[#EFF6FF]"
                  >
                    전체 초기화
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="h-[var(--app-control-md)] min-w-[5rem] rounded-[var(--app-radius-md)] border border-[#D7DEEA] bg-white px-4 text-[clamp(0.8rem,0.9vw,0.86rem)] font-bold text-[#667085] transition hover:border-[#BCC7D8] hover:bg-[#F8FAFC]"
                >
                  취소
                </button>
                <AppButton
                  onClick={handleConfirm}
                  className="h-[var(--app-control-md)] min-w-[5rem] rounded-[var(--app-radius-md)] px-4"
                >
                  확인
                </AppButton>
              </div>
            </div>
          </div>

          {isSelectionPanelOpen ? (
            <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-900/10">
              <div className="flex min-h-[3.25rem] items-center border-b border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">선택 항목</p>
              </div>
              <div className="divide-y divide-[#E7EBF4] px-[var(--app-pad-md)]">
                {activeFilterRows.map(row => (
                  <div key={row.queryKey} className="py-[var(--app-pad-sm)]">
                    <p className="mb-2 text-[clamp(0.74rem,0.84vw,0.8rem)] font-black text-[#667085]">
                      {row.title}
                    </p>
                    {row.filters.length ? (
                      <div className="flex min-w-0 flex-wrap gap-2">
                        {row.filters.map(filter => (
                          <button
                            key={filter.key}
                            type="button"
                            onClick={() => handleRemoveActiveFilter(filter)}
                            aria-label={`${filter.title} ${filter.label} 필터 해제`}
                            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#B6D9FF] bg-[#EFF6FF] px-2.5 py-1 text-[clamp(0.74rem,0.84vw,0.8rem)] font-bold text-[#075DF6] transition hover:bg-[#DEEEFF]"
                          >
                            <span className="truncate">{filter.label}</span>
                            <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[clamp(0.74rem,0.84vw,0.8rem)] font-medium text-[#98A2B3]">
                        전체
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DetailPanel({ title, children, action }) {
  return (
    <section className="min-h-[clamp(7rem,8.9vw,8rem)] min-w-0 px-[var(--app-pad-md)] py-[var(--app-pad-md)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--app-gap-sm)] pb-[var(--app-pad-md)]">
        <DetailSectionLabel>{title}</DetailSectionLabel>
        {action}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function PromptVisibilityToggle({ showOriginal, onToggle, label }) {
  const ToggleIcon = showOriginal ? Eye : EyeOff;
  const buttonText = label ?? (showOriginal ? '처리 후 프롬프트 보기' : '원문 프롬프트 보기');

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-[#075DF6]">{buttonText}</span>
      <button
        type="button"
        aria-label={buttonText}
        aria-pressed={showOriginal}
        onClick={onToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F6FA] text-[#075DF6] transition hover:bg-[#EFF6FF]"
      >
        <ToggleIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function DetailPanelText({ children, subtle = false }) {
  return (
    <div
      className={`monitoring-detail-scroll max-h-[min(28vh,13.75rem)] min-w-0 overflow-y-auto rounded-[var(--app-radius-sm)] border border-[#D6E9FF] bg-[#FCFDFF] px-[var(--app-pad-sm)] py-[var(--app-pad-xs)] text-[clamp(0.74rem,0.87vw,0.78rem)] leading-[1.7] whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${
        subtle ? 'text-[#5B6686]' : 'text-[#2F3A56]'
      }`.trim()}
    >
      {children}
    </div>
  );
}

function getUserBubbleClassName(statusCategory) {
  if (statusCategory === 'masking') {
    return 'rounded-tr-[4px] border border-[#FACC15] bg-[#FEF3C7] text-[#854D0E]';
  }

  if (statusCategory === 'block') {
    return 'rounded-tr-[4px] border border-[#FDA4AF] bg-[#FEE2E2] text-[#991B1B]';
  }

  return 'rounded-tr-[4px] bg-[#075DF6] text-white';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedConversationText({ text, searchTerm }) {
  const value = String(text ?? '');
  const normalizedSearchTerm = searchTerm.trim();

  if (!normalizedSearchTerm) return value;

  const matcher = new RegExp(`(${escapeRegExp(normalizedSearchTerm)})`, 'gi');
  const parts = value.split(matcher);

  return parts.map((part, index) =>
    part.toLowerCase() === normalizedSearchTerm.toLowerCase() ? (
      <mark
        key={`${part}-${index}`}
        className="rounded-[3px] bg-[#FDE68A] px-0.5 font-bold text-[#78350F]"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

function ConversationSearchControl({ value, onChange, onSubmit }) {
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        onSubmit();
      }}
      className="grid w-full max-w-[30rem] min-w-0 grid-cols-[minmax(0,1fr)_minmax(4.75rem,max-content)] gap-[var(--app-gap-sm)]"
    >
      <AppSearchField
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="검색어"
        className="w-full min-w-0"
      />
      <AppButton
        type="submit"
        className="h-[var(--app-control-lg)] min-w-[clamp(4.75rem,5.6vw,5.25rem)]"
      >
        검색
      </AppButton>
    </form>
  );
}

function ConversationMessage({
  role,
  label,
  children,
  searchTerm = '',
  statusCategory = 'normal',
  assistantLogo = null,
  assistantName = '',
}) {
  const isAssistant = role === 'assistant';
  const Icon = isAssistant ? Bot : UserRound;

  return (
    <div
      className={`flex min-w-0 items-start gap-3 ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`.trim()}
    >
      {isAssistant ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#B6D9FF] bg-white text-[#075DF6] shadow-[0_6px_14px_rgba(7, 93, 246,0.12)]">
          {assistantLogo ? (
            <img
              src={assistantLogo}
              alt={`${assistantName || 'AI'} logo`}
              className="h-5 w-5 object-contain"
              loading="lazy"
            />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>
      ) : null}
      <div
        className={`flex min-w-0 max-w-[min(44rem,86%)] flex-col gap-1 ${
          isAssistant ? 'items-start' : 'items-end'
        }`.trim()}
      >
        <span className="px-1 text-[11px] font-bold text-[#64728C]">{label}</span>
        <div
          className={`min-w-0 rounded-[14px] px-4 py-3 text-[clamp(0.74rem,0.87vw,0.78rem)] leading-[1.7] whitespace-pre-wrap break-words shadow-[0_8px_20px_rgba(15,23,42,0.06)] [overflow-wrap:anywhere] ${
            isAssistant
              ? 'rounded-tl-[4px] border border-[#D6E9FF] bg-white text-[#2F3A56]'
              : getUserBubbleClassName(statusCategory)
          }`.trim()}
        >
          <HighlightedConversationText text={children} searchTerm={searchTerm} />
        </div>
      </div>
      {isAssistant ? null : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#075DF6] text-white">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

function DetailConversationPreview({
  promptTitle,
  promptText,
  answerText,
  service,
  statusCategory,
  searchTerm,
}) {
  const serviceLogo = service ? getServiceLogo(service) : null;

  return (
    <div className="monitoring-detail-scroll max-h-[min(44vh,22rem)] min-w-0 overflow-y-auto rounded-[10px] border border-[#E2E8F0] bg-[#F8FBFF] px-4 py-4">
      <div className="flex min-w-0 flex-col gap-4">
        <ConversationMessage
          role="user"
          label={promptTitle}
          searchTerm={searchTerm}
          statusCategory={statusCategory}
        >
          {promptText}
        </ConversationMessage>
        <ConversationMessage
          role="assistant"
          label="답변"
          searchTerm={searchTerm}
          assistantLogo={serviceLogo}
          assistantName={service}
        >
          {answerText}
        </ConversationMessage>
      </div>
    </div>
  );
}

function DetailBulletList({ items, showMarkers = true, itemClassName = '' }) {
  return (
    <ul className="monitoring-detail-scroll max-h-[min(28vh,13.75rem)] min-w-0 space-y-[var(--app-gap-xs)] overflow-y-auto rounded-[var(--app-radius-sm)] border border-[#D6E9FF] bg-[#FCFDFF] px-[var(--app-pad-sm)] py-[var(--app-pad-xs)] text-[clamp(0.74rem,0.87vw,0.78rem)] leading-[1.65] text-[#2F3A56]">
      {items.map(item => (
        <li key={item} className="flex min-w-0 gap-2">
          {showMarkers ? (
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#075DF6]" />
          ) : null}
          <span className={`min-w-0 break-words [overflow-wrap:anywhere] ${itemClassName}`.trim()}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function DetailFileList({ files }) {
  if (!files.length) {
    return <DetailPanelText subtle>첨부된 파일이 없습니다.</DetailPanelText>;
  }

  return <DetailBulletList items={files} />;
}

function DetailAnalysisList({ results }) {
  if (!results.length) {
    return <DetailPanelText subtle>분석 결과가 없습니다.</DetailPanelText>;
  }

  return <DetailBulletList items={results} />;
}

export function MonitoringLogView({
  useStatusFilter = false,
  emptyMessage = '현재 조건에 맞는 모니터링 로그가 없습니다.',
}) {
  const [searchParams] = useSearchParams();
  const defaultDateRange = useMemo(() => createDefaultDateRange(), []);
  const storedFilters = useMemo(() => getStoredMonitoringFilters(), []);
  const [startDate, setStartDate] = useState(
    () => searchParams.get('startDate') ?? defaultDateRange.startDate
  );
  const [endDate, setEndDate] = useState(
    () => searchParams.get('endDate') ?? defaultDateRange.endDate
  );
  const [selectedPolicies, setSelectedPolicies] = useState(() =>
    getStoredFilterValues(storedFilters.policies)
  );
  const [selectedDepartments, setSelectedDepartments] = useState(() =>
    getStoredFilterValues(storedFilters.departments)
  );
  const [selectedPositions, setSelectedPositions] = useState(() =>
    getStoredFilterValues(storedFilters.positions)
  );
  const [selectedUsers, setSelectedUsers] = useState(() => {
    const urlUsers = searchParams.getAll('user').filter(Boolean);
    return urlUsers.length ? urlUsers : getStoredFilterValues(storedFilters.users);
  });
  const initialSearchQuery = searchParams.has('q')
    ? (searchParams.get('q') ?? '')
    : getStoredFilterText(storedFilters.searchQuery);
  const [searchInput, setSearchInput] = useState(initialSearchQuery);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedLogId, setSelectedLogId] = useState();
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [downloadErrorMessage, setDownloadErrorMessage] = useState('');
  const [originalPromptRowIds, setOriginalPromptRowIds] = useState([]);
  const [conversationSearchInputs, setConversationSearchInputs] = useState({});
  const [conversationSearchTerms, setConversationSearchTerms] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const lastPersistedFilterStateRef = useRef(
    JSON.stringify({
      policies: selectedPolicies,
      departments: selectedDepartments,
      positions: selectedPositions,
      users: selectedUsers,
      searchQuery,
    })
  );
  const { containerRef: tableAreaRef, rowsPerPage } = useAdaptiveRowsPerPage({
    maxRows: MAX_ROWS_PER_PAGE,
    minRows: 4,
    rowHeight: 36,
  });
  const requestedStatusFilter = useStatusFilter ? (searchParams.get('status') ?? 'all') : 'all';
  const statusFilter = requestedStatusFilter === 'allow' ? 'normal' : requestedStatusFilter;
  const {
    data: monitoringData,
    isError,
    isFetching,
    isLoading,
  } = useMonitoringEventsQuery({
    statusFilter,
    q: searchQuery,
  });
  const { mutate: exportMonitoringEvents, isPending: isDownloadingCsv } =
    useMonitoringEventsExportMutation();
  const { data: dropdownSelectData, isLoading: isDropdownOptionsLoading } =
    useDropdownSelectOptionsQuery();

  const monitoringLogs = useMemo(() => {
    if (isError) return [];

    return (monitoringData?.events ?? []).map(normalizeMonitoringEvent);
  }, [isError, monitoringData?.events]);

  const dropdownDepartmentOptions = useMemo(
    () => normalizeDropdownOptionNames(dropdownSelectData?.departments),
    [dropdownSelectData?.departments]
  );
  const dropdownPositionOptions = useMemo(
    () => normalizeDropdownOptionNames(dropdownSelectData?.positions),
    [dropdownSelectData?.positions]
  );

  const policyOptions = useMemo(() => {
    const policies = monitoringLogs
      .map(log => getDetectedPolicyName(log))
      .filter(policy => policy && policy !== '-')
      .sort((left, right) => left.localeCompare(right, 'ko'));

    return [ALL_POLICIES_OPTION, ...new Set(policies)];
  }, [monitoringLogs]);

  const departmentOptions = useMemo(() => {
    const logDepartments = monitoringLogs
      .map(log => log.department)
      .filter(department => department && department !== '-')
      .sort((left, right) => left.localeCompare(right, 'ko'));
    const departments = [...dropdownDepartmentOptions, ...logDepartments].filter(
      (value, index, array) => array.indexOf(value) === index
    );

    return [ALL_DEPARTMENTS_OPTION, ...departments];
  }, [dropdownDepartmentOptions, monitoringLogs]);

  const positionOptions = useMemo(() => {
    const logPositions = monitoringLogs
      .map(log => log.position)
      .filter(position => position && position !== '-')
      .sort((left, right) => left.localeCompare(right, 'ko'));
    const positions = [...dropdownPositionOptions, ...logPositions].filter(
      (value, index, array) => array.indexOf(value) === index
    );

    return [ALL_POSITIONS_OPTION, ...positions];
  }, [dropdownPositionOptions, monitoringLogs]);

  const userOptions = useMemo(() => {
    const users = monitoringLogs
      .map(log => log.userId)
      .filter(user => user && user !== '-')
      .sort((left, right) => left.localeCompare(right, 'ko'));

    return [ALL_USERS_OPTION, ...new Set(users)];
  }, [monitoringLogs]);

  const filteredLogs = useMemo(() => {
    return monitoringLogs.filter(log => {
      const logDate = new Date(normalizeLogDateTime(log.detectedAt));
      const startBoundary = startDate ? new Date(`${startDate}T00:00:00`) : null;
      const endBoundary = endDate ? new Date(`${endDate}T23:59:59`) : null;
      const matchesDateRange =
        (!startBoundary || logDate >= startBoundary) && (!endBoundary || logDate <= endBoundary);
      const matchesPolicy =
        !selectedPolicies.length || selectedPolicies.includes(getDetectedPolicyName(log));
      const matchesDepartment =
        !selectedDepartments.length || selectedDepartments.includes(log.department);
      const matchesPosition = !selectedPositions.length || selectedPositions.includes(log.position);
      const matchesUser = !selectedUsers.length || selectedUsers.includes(log.userId);
      const normalizedSearchQuery = searchQuery.trim().toLowerCase();
      const matchesSearch = normalizedSearchQuery
        ? [
            log.detectedAt,
            log.aiType,
            log.result,
            log.userIp,
            log.userId,
            log.department,
            log.position,
            log.prompt,
            log.promptDetail,
            log.originalPromptDetail,
            log.forwardedPromptDetail,
            log.maskedPromptDetail,
            log.answerDetail,
            log.detectionDetail,
            log.actionDetail,
            log.policyCode,
            log.policyName,
            getDetectedPolicyName(log),
            ...(log.attachedFiles ?? []),
            ...(log.attachmentAnalysisResults ?? []),
          ]
            .filter(Boolean)
            .some(value => String(value).toLowerCase().includes(normalizedSearchQuery))
        : true;
      const logStatusCategory = getLogStatusCategory(log);
      const matchesStatus = !useStatusFilter
        ? true
        : statusFilter === 'all'
          ? true
          : statusFilter === logStatusCategory;
      return (
        matchesDateRange &&
        matchesPolicy &&
        matchesDepartment &&
        matchesPosition &&
        matchesUser &&
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    endDate,
    monitoringLogs,
    selectedDepartments,
    selectedPolicies,
    selectedPositions,
    selectedUsers,
    searchQuery,
    startDate,
    statusFilter,
    useStatusFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const pagedLogs = useMemo(() => {
    const startIndex = (safePage - 1) * rowsPerPage;
    return filteredLogs.slice(startIndex, startIndex + rowsPerPage).map(log => ({
      ...log,
      displayResult: getStatusLabel(log),
      detectedPolicy: getDetectedPolicyName(log),
    }));
  }, [filteredLogs, rowsPerPage, safePage]);

  const statusMessage = isError
    ? '모니터링 데이터를 불러오지 못했습니다.'
    : isLoading
      ? '모니터링 데이터를 불러오는 중입니다.'
      : isFetching
        ? '모니터링 데이터를 갱신하는 중입니다.'
        : !filteredLogs.length
          ? emptyMessage
          : '';

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCurrentPage(1);
    setSelectedLogId(null);
    setSelectedRowIds([]);
  }, [statusFilter]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isLoading || isDropdownOptionsLoading) return;

    setSelectedPositions(current => {
      const validPositions = current.filter(position => positionOptions.includes(position));
      return validPositions.length === current.length ? current : validPositions;
    });
  }, [isDropdownOptionsLoading, isLoading, positionOptions]);

  useEffect(() => {
    if (isLoading) return;

    setSelectedPolicies(current => {
      const validPolicies = current.filter(policy => policyOptions.includes(policy));
      return validPolicies.length === current.length ? current : validPolicies;
    });
  }, [isLoading, policyOptions]);

  useEffect(() => {
    if (isLoading || isDropdownOptionsLoading) return;

    setSelectedDepartments(current => {
      const validDepartments = current.filter(department => departmentOptions.includes(department));
      return validDepartments.length === current.length ? current : validDepartments;
    });
  }, [departmentOptions, isDropdownOptionsLoading, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    setSelectedUsers(current => {
      const validUsers = current.filter(user => userOptions.includes(user));
      return validUsers.length === current.length ? current : validUsers;
    });
  }, [isLoading, userOptions]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const serializedFilters = JSON.stringify({
      policies: selectedPolicies,
      departments: selectedDepartments,
      positions: selectedPositions,
      users: selectedUsers,
      searchQuery,
    });
    if (serializedFilters === lastPersistedFilterStateRef.current) return;

    try {
      window.localStorage.setItem(MONITORING_FILTER_STORAGE_KEY, serializedFilters);
      lastPersistedFilterStateRef.current = serializedFilters;
    } catch {
      // 필터 저장을 사용할 수 없는 환경에서도 조회 기능은 그대로 동작한다.
    }
  }, [searchQuery, selectedDepartments, selectedPolicies, selectedPositions, selectedUsers]);

  const handleToggleRowSelection = rowId => {
    setSelectedRowIds(current =>
      current.includes(rowId) ? current.filter(id => id !== rowId) : [...current, rowId]
    );
  };

  const handleToggleAllRowsSelection = rowIds => {
    setSelectedRowIds(current => {
      const allSelected = rowIds.every(id => current.includes(id));

      if (allSelected) {
        return current.filter(id => !rowIds.includes(id));
      }

      return [...new Set([...current, ...rowIds])];
    });
  };

  const handleSelectLog = log => {
    setSelectedLogId(current => {
      const isClosing = current === log.id;

      setSelectedRowIds(selectedCurrent => {
        if (isClosing) {
          return selectedCurrent.filter(id => id !== log.id);
        }

        return selectedCurrent.includes(log.id) ? selectedCurrent : [...selectedCurrent, log.id];
      });

      return isClosing ? null : log.id;
    });
  };

  const handleTogglePromptVisibility = rowId => {
    setOriginalPromptRowIds(current =>
      current.includes(rowId) ? current.filter(id => id !== rowId) : [...current, rowId]
    );
  };

  const handleConversationSearchInputChange = (rowId, value) => {
    setConversationSearchInputs(current => ({
      ...current,
      [rowId]: value,
    }));
  };

  const handleConversationSearch = rowId => {
    setConversationSearchTerms(current => ({
      ...current,
      [rowId]: (conversationSearchInputs[rowId] ?? '').trim(),
    }));
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
    setSelectedLogId(null);
    setSelectedRowIds([]);
  };

  const handleResetFilters = () => {
    lastPersistedFilterStateRef.current = JSON.stringify({
      policies: [],
      departments: [],
      positions: [],
      users: [],
      searchQuery: '',
    });
    try {
      window.localStorage.removeItem(MONITORING_FILTER_STORAGE_KEY);
    } catch {
      // 필터 저장을 사용할 수 없는 환경에서도 초기화는 계속한다.
    }

    setStartDate(defaultDateRange.startDate);
    setEndDate(defaultDateRange.endDate);
    setSelectedPolicies([]);
    setSelectedDepartments([]);
    setSelectedPositions([]);
    setSelectedUsers([]);
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
    setSelectedLogId(null);
    setSelectedRowIds([]);
  };
  const handlePolicyFilterChange = value => {
    setSelectedPolicies(value);
    setCurrentPage(1);
    setSelectedLogId(null);
    setSelectedRowIds([]);
  };
  const handleDepartmentFilterChange = value => {
    setSelectedDepartments(value);
    setCurrentPage(1);
    setSelectedLogId(null);
    setSelectedRowIds([]);
  };
  const handlePositionFilterChange = value => {
    setSelectedPositions(value);
    setCurrentPage(1);
    setSelectedLogId(null);
    setSelectedRowIds([]);
  };
  const handleUserFilterChange = value => {
    setSelectedUsers(value);
    setCurrentPage(1);
    setSelectedLogId(null);
    setSelectedRowIds([]);
  };
  const selectedExportIds = useMemo(
    () => selectedRowIds.map(id => Number(id)).filter(id => Number.isFinite(id)),
    [selectedRowIds]
  );
  const hasSelectedRows = selectedExportIds.length > 0;

  const handleDownloadCsv = () => {
    if (!selectedExportIds.length) return;

    setDownloadErrorMessage('');
    exportMonitoringEvents(
      { ids: selectedExportIds },
      {
        onError: () => {
          setDownloadErrorMessage('CSV 다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        },
      }
    );
  };

  return (
    <div
      className={`mx-auto mb-[calc(var(--app-pad-md)*-1)] flex h-[calc(100%+var(--app-pad-md))] min-h-0 w-full flex-col ${APP_PAGE_HORIZONTAL_PADDING_CLASS} pt-[var(--app-page-top)] ${APP_PAGE_OUTER_WIDTH_CLASS}`.trim()}
    >
      <div
        className={`mx-auto flex h-full min-h-0 w-full flex-col ${APP_PAGE_INNER_WIDTH_CLASS}`.trim()}
      >
        <div className="mt-[calc(var(--app-gap-xs)*-0.35)] w-full">
          <div className="mt-[calc(var(--app-gap-xs)/2)]">
            <div className="grid max-w-full items-end gap-[var(--app-gap-sm)] sm:grid-cols-2 lg:grid-cols-[minmax(7.75rem,0.72fr)_minmax(10.25rem,1fr)_minmax(12.5rem,1.22fr)_minmax(21rem,2.05fr)]">
              <DateRangePicker
                label="조회 기간"
                labelClassName="sr-only"
                startDate={startDate}
                endDate={endDate}
                onChange={range => {
                  setStartDate(range.startDate);
                  setEndDate(range.endDate);
                  setCurrentPage(1);
                }}
                widthClass="w-full min-w-0"
              />

              <MonitoringMultiSelectDropdown
                selectedValues={selectedPolicies}
                options={policyOptions}
                allOption={ALL_POLICIES_OPTION}
                allLabel="전체 정책"
                selectionLabel="정책"
                ariaLabel="탐지된 정책"
                onChange={handlePolicyFilterChange}
              />

              <UserScopeFilterDropdown
                selectedDepartments={selectedDepartments}
                selectedPositions={selectedPositions}
                selectedUsers={selectedUsers}
                boundaryRef={tableAreaRef}
                departmentOptions={departmentOptions}
                positionOptions={positionOptions}
                userOptions={userOptions}
                onDepartmentChange={handleDepartmentFilterChange}
                onPositionChange={handlePositionFilterChange}
                onUserChange={handleUserFilterChange}
              />

              <div className="w-full min-w-0 sm:col-span-2 lg:col-span-1">
                <div className="grid w-full grid-cols-1 gap-[var(--app-gap-sm)] sm:grid-cols-[minmax(0,1fr)_minmax(4.75rem,max-content)_auto_auto]">
                  <AppSearchField
                    value={searchInput}
                    onChange={event => setSearchInput(event.target.value)}
                    placeholder="검색어"
                    className="w-full min-w-0"
                  />
                  <AppButton
                    onClick={handleSearch}
                    className="h-[var(--app-control-lg)] min-w-[clamp(4.75rem,5.6vw,5.25rem)]"
                  >
                    검색
                  </AppButton>
                  <MonitoringIconButtonTooltip label="초기화">
                    <MonitoringResetButton
                      onClick={handleResetFilters}
                      widthClass="w-[var(--app-control-lg)] min-w-[var(--app-control-lg)]"
                      textClassName="shadow-[0_0.625rem_1.5rem_rgba(7, 93, 246,0.18)]"
                      aria-label="초기화"
                    />
                  </MonitoringIconButtonTooltip>
                  <MonitoringIconButtonTooltip
                    label={
                      isDownloadingCsv
                        ? 'CSV 다운로드 중'
                        : hasSelectedRows
                          ? 'CSV 다운로드'
                          : '항목을 선택하세요'
                    }
                  >
                    <MonitoringActionButton
                      variant="csvDownload"
                      heightClass="h-[var(--app-control-lg)]"
                      widthClass="w-[var(--app-control-lg)] min-w-[var(--app-control-lg)] px-0"
                      onClick={handleDownloadCsv}
                      disabled={!hasSelectedRows || isDownloadingCsv}
                      aria-label="CSV 다운로드"
                    >
                      <Download
                        className="h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] shrink-0"
                        strokeWidth={2.8}
                        aria-hidden="true"
                      />
                    </MonitoringActionButton>
                  </MonitoringIconButtonTooltip>
                </div>
              </div>
            </div>
            <div className="mt-[var(--app-gap-lg)] flex items-center justify-end gap-[var(--app-gap-sm)]">
              {downloadErrorMessage ? (
                <p className="text-sm font-semibold text-[#E11D48]">{downloadErrorMessage}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div ref={tableAreaRef} className="mt-[var(--app-gap-md)] flex min-h-0 flex-1 flex-col">
          <MonitoringDataTable
            rows={pagedLogs}
            title="모니터링 목록"
            count={filteredLogs.length}
            activeRowId={selectedLogId}
            selectedRowIds={selectedRowIds}
            onToggleRowSelection={handleToggleRowSelection}
            onToggleAllRowsSelection={handleToggleAllRowsSelection}
            rowNumberStart={(safePage - 1) * rowsPerPage + 1}
            onSelectRow={handleSelectLog}
            renderExpandedRow={row => {
              const detail = buildDetailContext(row);
              const isOriginalPromptVisible = originalPromptRowIds.includes(row.id);
              const promptPanel = buildPromptPanelState(row, isOriginalPromptVisible);
              const statusCategory = getLogStatusCategory(row);
              const conversationSearchInput = conversationSearchInputs[row.id] ?? '';
              const conversationSearchTerm = conversationSearchTerms[row.id] ?? '';

              return (
                <div className="grid gap-0">
                  <section className="bg-white">
                    <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
                      <div className="px-4 py-4">
                        <DetailSummaryItem label="탐지 일시" value={row.detectedAt} />
                      </div>
                      <div className="border-t border-[#E7EBF5] px-4 py-4 md:border-t-0 md:border-l md:border-[#E7EBF5]">
                        <DetailSummaryItem
                          label="서비스"
                          value={row.aiType}
                          valueNode={<ServiceSummaryValue service={row.aiType} />}
                        />
                      </div>
                      <div className="border-t border-[#E7EBF5] px-4 py-4 xl:border-t-0 xl:border-l xl:border-[#E7EBF5]">
                        <DetailSummaryItem
                          label="처리 상태"
                          value={detail.actionStatus}
                          valueClassName={getStatusTextClassName(row)}
                        />
                      </div>
                      <div className="border-t border-[#E7EBF5] px-4 py-4 md:border-t md:border-[#E7EBF5] xl:border-t-0 xl:border-l xl:border-[#E7EBF5]">
                        <DetailSummaryItem label="적용 정책" value={detail.policyName} />
                      </div>
                      <div className="border-t border-[#E7EBF5] px-4 py-4">
                        <DetailSummaryItem label="IP" value={row.userIp} />
                      </div>
                      <div className="border-t border-[#E7EBF5] px-4 py-4 md:border-l md:border-[#E7EBF5]">
                        <DetailSummaryItem label="사용자명" value={row.userId ?? '-'} />
                      </div>
                      <div className="border-t border-[#E7EBF5] px-4 py-4 xl:border-l xl:border-[#E7EBF5]">
                        <DetailSummaryItem label="부서" value={row.department ?? '-'} />
                      </div>
                      <div className="border-t border-[#E7EBF5] px-4 py-4 md:border-l md:border-[#E7EBF5] xl:border-l xl:border-[#E7EBF5]">
                        <DetailSummaryItem label="직책" value={row.position ?? '-'} />
                      </div>
                    </div>
                  </section>

                  <section className="border-t border-[#E7EBF5] bg-white">
                    <div className="grid lg:grid-cols-2">
                      <div className="min-w-0 border-b border-[#E7EBF5] lg:col-span-2">
                        <DetailPanel
                          title="입력 프롬프트 및 답변"
                          action={
                            promptPanel.canToggle ? (
                              <PromptVisibilityToggle
                                showOriginal={isOriginalPromptVisible}
                                label={promptPanel.toggleLabel}
                                onToggle={() => handleTogglePromptVisibility(row.id)}
                              />
                            ) : (
                              <ConversationSearchControl
                                value={conversationSearchInput}
                                onChange={value =>
                                  handleConversationSearchInputChange(row.id, value)
                                }
                                onSubmit={() => handleConversationSearch(row.id)}
                              />
                            )
                          }
                        >
                          {promptPanel.canToggle ? (
                            <div className="mb-3 flex min-w-0 justify-end">
                              <ConversationSearchControl
                                value={conversationSearchInput}
                                onChange={value =>
                                  handleConversationSearchInputChange(row.id, value)
                                }
                                onSubmit={() => handleConversationSearch(row.id)}
                              />
                            </div>
                          ) : null}
                          <DetailConversationPreview
                            promptTitle={promptPanel.title}
                            promptText={promptPanel.text}
                            answerText={detail.answerDetail}
                            service={row.aiType}
                            statusCategory={statusCategory}
                            searchTerm={conversationSearchTerm}
                          />
                        </DetailPanel>
                      </div>
                      <div className="min-w-0 border-b border-[#E7EBF5] lg:border-r lg:border-[#E7EBF5]">
                        <DetailPanel title="첨부된 파일">
                          <DetailFileList files={row.attachedFiles ?? []} />
                        </DetailPanel>
                      </div>
                      <div className="min-w-0 border-b border-[#E7EBF5]">
                        <DetailPanel title="첨부 파일 분석 결과">
                          <DetailAnalysisList results={row.attachmentAnalysisResults ?? []} />
                        </DetailPanel>
                      </div>
                      <div className="min-w-0 border-b border-[#E7EBF5] lg:border-r lg:border-[#E7EBF5]">
                        <DetailPanel title="탐지 근거">
                          <DetailBulletList items={detail.evidenceLines} showMarkers={false} />
                        </DetailPanel>
                      </div>
                      <div className="min-w-0 border-b border-[#E7EBF5]">
                        <DetailPanel title="조치 내용">
                          <DetailBulletList
                            items={detail.actionLines}
                            showMarkers={false}
                            itemClassName={`font-semibold ${getStatusTextClassName(row)}`}
                          />
                        </DetailPanel>
                      </div>
                    </div>
                  </section>
                </div>
              );
            }}
            className="shrink-0"
          />

          {statusMessage ? (
            <section className="mt-2 shrink-0 border-t border-dashed border-[#DCEAF1] px-6 py-4 text-center text-sm text-[#94A3B8]">
              {statusMessage}
            </section>
          ) : null}

          <FixedPaginationBar
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  return <MonitoringLogView useStatusFilter />;
}
