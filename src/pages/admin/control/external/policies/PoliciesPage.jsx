import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import AppButton from '../components/AppButton.jsx';
import AppSearchField from '../components/AppSearchField.jsx';
import FixedPaginationBar from '../components/FixedPaginationBar.jsx';
import SectionCard from '../components/SectionCard.jsx';
import TableListHeader from '../components/TableListHeader.jsx';
import {
  MonitoringIconButtonTooltip,
  MonitoringResetButton,
} from '../components/monitoring/MonitoringListComponents.jsx';
import {
  monitoringTableCellClass,
  monitoringTableClass,
  monitoringTableHeadClass,
  monitoringTableHeaderCellClass,
  monitoringTableHeaderRowClass,
  monitoringTableRowClass,
  monitoringTableSurfaceClass,
} from '../components/monitoring/monitoringTableStyles.js';
import useAdaptiveRowsPerPage from '../hooks/useAdaptiveRowsPerPage.js';
import PageLayout from '../../components/PageLayout.jsx';
import { usePatchPolicyEnabledMutation, usePoliciesQuery } from '../queries/policyQueries.js';
import { FileUploadProtectionContent } from '../components/settings/SettingsContent.jsx';

const MAX_ROWS_PER_PAGE = 10;
const POLICY_SETTINGS_BACK_BUTTON_CLASS = 'h-12 shrink-0 px-5';
const POLICY_SETTING_DEFINITIONS = [
  {
    view: 'fileUploadSettings',
    label: '파일 업로드 보호 정책',
    codes: ['file_upload_protection'],
    nameKeywords: ['파일 업로드 보호'],
  },
  {
    view: 'privacySettings',
    label: '개인정보 보호 정책',
    codes: [
      'privacy_protection',
      'privacy_policy',
      'personal_information_protection',
      'personal_data_protection',
      'pii_protection',
    ],
    nameKeywords: ['개인정보 보호'],
  },
];

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

function getPolicyEntries(data) {
  if (Array.isArray(data)) return data.map((value, index) => [value?.code ?? index, value]);
  if (Array.isArray(data?.policies)) {
    return data.policies.map((value, index) => [value?.code ?? index, value]);
  }
  if (data && typeof data === 'object') return Object.entries(data);

  return [];
}

function toStringList(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (item && typeof item === 'object') {
          return (
            item.name ??
            item.service_name ??
            item.serviceName ??
            item.service_code ??
            item.serviceCode ??
            item.code ??
            item.id
          );
        }

        return item;
      })
      .map(item => String(item).trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([, itemValue]) => {
        if (typeof itemValue === 'boolean') return itemValue;
        if (itemValue && typeof itemValue === 'object' && 'enabled' in itemValue) {
          return Boolean(itemValue.enabled);
        }

        return true;
      })
      .map(([itemKey, itemValue]) => {
        if (itemValue && typeof itemValue === 'object') {
          return (
            itemValue.name ??
            itemValue.service_name ??
            itemValue.serviceName ??
            itemValue.service_code ??
            itemValue.serviceCode ??
            itemValue.code ??
            itemKey
          );
        }

        return itemKey;
      })
      .map(item => String(item).trim())
      .filter(Boolean);
  }

  return [];
}

function getPolicyAction(handling, action) {
  if (action) return String(action);
  if (handling === '허용') return '허용';
  if (handling === '마스킹') return '마스킹 후 전송';

  return handling;
}

function getPolicySettingDefinition(policy) {
  if (!policy) return null;

  const normalizedCode = String(policy.code ?? '').toLowerCase();
  const policyName = String(policy.name ?? '');

  return (
    POLICY_SETTING_DEFINITIONS.find(
      definition =>
        definition.codes.includes(normalizedCode) ||
        definition.nameKeywords.some(keyword => policyName.includes(keyword))
    ) ?? null
  );
}

function normalizePolicy([key, value]) {
  const policy = value && typeof value === 'object' ? value : {};
  const code = String(policy.code ?? policy.policy_code ?? policy.policyCode ?? policy.id ?? key);
  const services = toStringList(policy.applied_services ?? policy.appliedServices);
  const serviceLabel =
    policy.serviceLabel ?? policy.service_label ?? (services.length ? services.join(', ') : '-');
  const handling = String(policy.handling ?? policy.action ?? '허용');
  const enabled =
    typeof value === 'boolean'
      ? value
      : Boolean(policy.enabled ?? policy.is_enabled ?? policy.isEnabled);

  return {
    id: code,
    code,
    name: String(policy.name ?? policy.policy_name ?? policy.policyName ?? code),
    category: String(policy.category ?? policy.type ?? '-'),
    services,
    serviceLabel,
    action: getPolicyAction(handling, policy.action),
    status: enabled ? '사용' : '미사용',
    updatedAt: String(
      policy.updated_at_kst ??
        policy.updatedAtKst ??
        policy.updatedAt ??
        policy.updated_at ??
        policy.modified_at ??
        policy.modifiedAt ??
        '-'
    ),
    description: String(policy.description ?? ''),
    detects: toStringList(policy.detects ?? policy.detection_targets ?? policy.detectionTargets),
    exceptions: toStringList(policy.exceptions),
    handling,
    alerts: {
      admin: Boolean(policy.alerts?.admin ?? policy.admin_alert ?? policy.adminAlert),
    },
    enabled,
  };
}

function StatusToggleIndicator({ checked, ariaLabel, disabled = false, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onToggle}
      className={joinClasses(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition duration-200 hover:brightness-[1.04] disabled:cursor-not-allowed disabled:opacity-60',
        checked
          ? 'border-[#075DF6] bg-[#075DF6] shadow-[0_8px_18px_rgba(7,93,246,0.28)]'
          : 'border-[#C8E1FF] bg-[#B6D9FF]'
      )}
    >
      <span
        className={joinClasses(
          'h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(15,18,20,0.18)] transition duration-200',
          checked ? 'translate-x-[1.35rem]' : 'translate-x-[0.15rem]'
        )}
      />
    </button>
  );
}

function PolicyValueList({ items, emptyMessage }) {
  if (!items.length) {
    return <p className="text-sm font-medium text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <span
          key={item}
          className="inline-flex rounded-full border border-[#D7E8FF] bg-[#F3F8FF] px-3 py-1.5 text-xs font-semibold text-[#245EA8]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function GeneralPolicyDetailContent({ policy, isSaving, onBack, onToggleStatus }) {
  if (!policy) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[var(--app-radius-lg)] border border-dashed border-[#D8DEEA] bg-white px-6 py-10">
        <p className="text-sm font-semibold text-slate-500">정책 상세 정보를 찾을 수 없습니다.</p>
        <AppButton onClick={onBack} className={POLICY_SETTINGS_BACK_BUTTON_CLASS}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          정책 관리로 이동
        </AppButton>
      </div>
    );
  }

  const summaryRows = [
    ['정책 코드', policy.code],
    ['정책 분류', policy.category],
    ['처리 방식', policy.action],
    ['최근 수정', policy.updatedAt],
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <AppButton onClick={onBack} className={POLICY_SETTINGS_BACK_BUTTON_CLASS}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          정책 관리로 이동
        </AppButton>
      </div>

      <SectionCard className="overflow-hidden">
        <header className="flex flex-col gap-5 border-b border-[#E7EBF4] bg-[#FCFDFF] px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-[-0.025em] text-[#11182E]">
                {policy.name}
              </h2>
              <span className="rounded-full bg-[#EAF3FF] px-2.5 py-1 text-xs font-semibold text-[#075DF6]">
                {policy.category}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium leading-6 text-[#69758D]">
              {policy.description || '등록된 정책 설명이 없습니다.'}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-slate-400">사용 여부</p>
              <p className="mt-0.5 text-sm font-bold text-slate-700">{policy.status}</p>
            </div>
            <StatusToggleIndicator
              checked={policy.enabled}
              ariaLabel={`${policy.name} 사용 여부`}
              disabled={isSaving}
              onToggle={onToggleStatus}
            />
          </div>
        </header>

        <div className="grid lg:grid-cols-2">
          <section className="border-b border-[#E7EBF4] px-5 py-6 sm:px-6 lg:border-r">
            <h3 className="text-sm font-bold text-[#26354D]">기본 정보</h3>
            <dl className="mt-4 divide-y divide-[#EEF2F7] rounded-xl border border-[#E2E8F0] bg-white px-4">
              {summaryRows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[6rem_1fr] gap-4 py-3 text-sm">
                  <dt className="font-semibold text-slate-400">{label}</dt>
                  <dd className="min-w-0 break-words font-semibold text-slate-700">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="border-b border-[#E7EBF4] px-5 py-6 sm:px-6">
            <h3 className="text-sm font-bold text-[#26354D]">적용 서비스</h3>
            <div className="mt-4">
              <PolicyValueList items={policy.services} emptyMessage="적용된 서비스가 없습니다." />
            </div>
          </section>

          <section className="px-5 py-6 sm:px-6 lg:border-r">
            <h3 className="text-sm font-bold text-[#26354D]">탐지 대상</h3>
            <div className="mt-4">
              <PolicyValueList items={policy.detects} emptyMessage="등록된 탐지 대상이 없습니다." />
            </div>
          </section>

          <section className="border-t border-[#E7EBF4] px-5 py-6 sm:px-6 lg:border-t-0">
            <h3 className="text-sm font-bold text-[#26354D]">예외 항목</h3>
            <div className="mt-4">
              <PolicyValueList
                items={policy.exceptions}
                emptyMessage="등록된 예외 항목이 없습니다."
              />
            </div>
          </section>
        </div>
      </SectionCard>
    </div>
  );
}

function PolicyRuleDetailContent({ policy, onBack }) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!policy) {
    return <GeneralPolicyDetailContent policy={policy} onBack={onBack} />;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const rules = policy.detects.map((target, index) => ({
    id: `${policy.code}-${index}`,
    target,
    category: policy.category,
    action: policy.action,
    services: policy.services,
  }));
  const filteredRules = rules.filter(rule => {
    if (!normalizedQuery) return true;

    return [rule.target, rule.category, rule.action, ...rule.services]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const handleReset = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex shrink-0 justify-start">
          <AppButton onClick={onBack} className={POLICY_SETTINGS_BACK_BUTTON_CLASS}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            정책 관리로 이동
          </AppButton>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-[38rem] lg:justify-end">
          <AppSearchField
            value={searchInput}
            onChange={event => setSearchInput(event.target.value)}
            placeholder="탐지 항목, 분류, 처리 방식 검색"
          />
          <AppButton onClick={() => setSearchQuery(searchInput)} className="h-12 min-w-[4.5rem]">
            검색
          </AppButton>
          <MonitoringIconButtonTooltip label="초기화">
            <MonitoringResetButton
              onClick={handleReset}
              heightClass="h-12"
              widthClass="w-12 shrink-0"
              aria-label="초기화"
            />
          </MonitoringIconButtonTooltip>
        </div>
      </div>

      <div className={monitoringTableSurfaceClass}>
        <TableListHeader title="탐지 항목 목록" count={filteredRules.length} />
        <div className="overflow-x-auto">
          <table className={`min-w-[min(100%,53.75rem)] ${monitoringTableClass} text-left`}>
            <colgroup>
              <col className="w-[25%]" />
              <col className="w-[18%]" />
              <col className="w-[20%]" />
              <col className="w-[37%]" />
            </colgroup>
            <thead className={monitoringTableHeadClass}>
              <tr className={monitoringTableHeaderRowClass}>
                <th className={monitoringTableHeaderCellClass}>탐지 항목</th>
                <th className={monitoringTableHeaderCellClass}>분류</th>
                <th className={monitoringTableHeaderCellClass}>처리 방식</th>
                <th className={monitoringTableHeaderCellClass}>적용 서비스</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule, index) => (
                <tr key={rule.id} className={monitoringTableRowClass({ striped: index % 2 === 1 })}>
                  <td
                    className={monitoringTableCellClass(
                      index,
                      'whitespace-nowrap font-black text-[#075DF6]'
                    )}
                  >
                    {rule.target}
                  </td>
                  <td className={monitoringTableCellClass(index, 'font-semibold text-[#50607F]')}>
                    {rule.category}
                  </td>
                  <td className={monitoringTableCellClass(index, 'font-semibold text-[#50607F]')}>
                    {rule.action}
                  </td>
                  <td
                    className={monitoringTableCellClass(
                      index,
                      'truncate font-semibold text-[#64748B]'
                    )}
                    title={rule.services.join(', ')}
                  >
                    {rule.services.length ? rule.services.join(', ') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredRules.length ? (
          <section className="border-t border-dashed border-[#DCEAF1] px-6 py-4 text-center text-sm font-semibold text-[#94A3B8]">
            {rules.length
              ? '검색 조건에 맞는 탐지 항목이 없습니다.'
              : '등록된 탐지 항목이 없습니다.'}
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default function PolicyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get('view');
  const requestedPolicyCode = searchParams.get('policy');
  const activeView = ['fileUploadSettings', 'privacySettings', 'policyDetail'].includes(
    requestedView
  )
    ? requestedView
    : 'policies';
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isError, isFetching, isLoading } = usePoliciesQuery();
  const {
    mutate: patchPolicyEnabled,
    isPending: isSaving,
    variables,
  } = usePatchPolicyEnabledMutation();
  const { containerRef: tableAreaRef, rowsPerPage } = useAdaptiveRowsPerPage({
    maxRows: MAX_ROWS_PER_PAGE,
    minRows: 4,
    rowHeight: 55,
  });

  const policyList = useMemo(() => getPolicyEntries(data).map(normalizePolicy), [data]);
  const filteredPolicies = policyList;
  const totalPages = Math.max(1, Math.ceil(filteredPolicies.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visiblePolicies = filteredPolicies.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const selectedPolicy = policyList.find(policy => policy.code === requestedPolicyCode) ?? null;
  const savingPolicyCode = isSaving ? variables?.code : null;
  const handleChangeView = (view, policyCode = null) => {
    setCurrentPage(1);
    setSearchParams(current => {
      const nextParams = new URLSearchParams(current);

      if (view === 'policies') {
        nextParams.delete('view');
        nextParams.delete('policy');
      } else {
        nextParams.set('view', view);
        if (policyCode) {
          nextParams.set('policy', policyCode);
        } else {
          nextParams.delete('policy');
        }
      }

      return nextParams;
    });
  };

  const handleSelectPolicy = policyId => {
    const policy = policyList.find(item => item.id === policyId);
    const settingDefinition = getPolicySettingDefinition(policy);

    if (settingDefinition) {
      handleChangeView(settingDefinition.view);
      return;
    }

    if (policy) handleChangeView('policyDetail', policy.code);
  };

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const handleTogglePolicyStatus = policyId => {
    const policy = policyList.find(item => item.id === policyId);
    if (!policy) return;

    patchPolicyEnabled({
      code: policy.code,
      enabled: !policy.enabled,
    });
  };

  const statusMessage = isError
    ? '정책 목록을 불러오지 못했습니다.'
    : isLoading
      ? '정책 목록을 불러오는 중입니다.'
      : isFetching
        ? '정책 목록을 갱신하는 중입니다.'
        : !filteredPolicies.length
          ? '등록된 정책이 없습니다.'
          : '';

  return (
    <PageLayout bottomPaddingClassName="pb-0">
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        {activeView === 'policies' ? (
          <>
            <SectionCard className="overflow-hidden">
              <div ref={tableAreaRef} className={monitoringTableSurfaceClass}>
                <TableListHeader title="정책 목록" count={filteredPolicies.length} />
                <div className="overflow-x-auto">
                  <table className={`min-w-[min(100%,47.5rem)] ${monitoringTableClass} text-left`}>
                    <thead className={monitoringTableHeadClass}>
                      <tr className={monitoringTableHeaderRowClass}>
                        <th className={`${monitoringTableHeaderCellClass} w-[26%] px-5 sm:px-6`}>
                          정책명
                        </th>
                        <th className={`${monitoringTableHeaderCellClass} w-[58%]`}>설명</th>
                        <th className={`${monitoringTableHeaderCellClass} w-[16%] !text-center`}>
                          사용 여부
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePolicies.map((policy, index) => (
                        <tr
                          key={policy.id}
                          className={monitoringTableRowClass({
                            striped: index % 2 === 1,
                            interactive: true,
                          })}
                          onClick={() => handleSelectPolicy(policy.id)}
                        >
                          <td
                            className={monitoringTableCellClass(
                              index,
                              'whitespace-nowrap px-5 font-semibold text-slate-800 sm:px-6'
                            )}
                          >
                            {policy.name}
                          </td>
                          <td className={monitoringTableCellClass(index)}>
                            <div className="truncate text-slate-600" title={policy.description}>
                              {policy.description || '-'}
                            </div>
                          </td>
                          <td
                            className={monitoringTableCellClass(
                              index,
                              'whitespace-nowrap text-center font-semibold text-slate-600'
                            )}
                          >
                            <StatusToggleIndicator
                              checked={policy.status === '사용'}
                              ariaLabel={`${policy.name} 사용 여부`}
                              disabled={savingPolicyCode === policy.code}
                              onToggle={event => {
                                event.stopPropagation();
                                handleTogglePolicyStatus(policy.id);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {statusMessage ? (
                  <div className="px-6 py-12 text-center text-sm text-slate-400">
                    {statusMessage}
                  </div>
                ) : null}
              </div>
            </SectionCard>

            {filteredPolicies.length ? (
              <FixedPaginationBar
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            ) : null}
          </>
        ) : activeView === 'fileUploadSettings' ? (
          <FileUploadProtectionContent
            toolbarAction={
              <AppButton
                onClick={() => handleChangeView('policies')}
                className={POLICY_SETTINGS_BACK_BUTTON_CLASS}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                정책 관리로 이동
              </AppButton>
            }
          />
        ) : activeView === 'policyDetail' ? (
          <PolicyRuleDetailContent
            policy={selectedPolicy}
            onBack={() => handleChangeView('policies')}
          />
        ) : (
          <FileUploadProtectionContent
            variant="privacy"
            toolbarAction={
              <AppButton
                onClick={() => handleChangeView('policies')}
                className={POLICY_SETTINGS_BACK_BUTTON_CLASS}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                정책 관리로 이동
              </AppButton>
            }
          />
        )}
      </div>
    </PageLayout>
  );
}
