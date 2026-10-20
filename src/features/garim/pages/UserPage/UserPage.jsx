import { Fragment, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import AppButton from '../../components/AppButton.jsx';
import AppSearchField from '../../components/AppSearchField.jsx';
import FixedPaginationBar from '../../components/FixedPaginationBar.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import {
  MonitoringDropdown,
  MonitoringIconButtonTooltip,
  MonitoringResetButton,
} from '../../components/monitoring/MonitoringListComponents.jsx';
import {
  monitoringTableCellClass,
  monitoringTableClass,
  monitoringTableHeadClass,
  monitoringTableHeaderCellClass,
  monitoringTableHeaderRowClass,
  monitoringTableRowClass,
  monitoringTableSurfaceClass,
} from '../../components/monitoring/monitoringTableStyles.js';
import useAdaptiveRowsPerPage from '../../hooks/useAdaptiveRowsPerPage.js';
import PageLayout from '../../layout/PageLayout.jsx';
import { useDropdownSelectOptionsQuery } from '../../queries/dropdownSettingsQueries.js';
import {
  useDeleteClientMutation,
  usePatchClientMetadataMutation,
  useRegisteredClientsQuery,
} from '../../queries/userManagementQueries.js';
import macIcon from '../../assets/icons/mac.svg';
import windowIcon from '../../assets/icons/window.svg';

const DEFAULT_DEPARTMENT_OPTION = '전체 부서';
const DEFAULT_POSITION_OPTION = '전체 직책';
const MAX_ROWS_PER_PAGE = 10;
function buildDropdownOptions(items, currentValue) {
  const optionNames = items.map(item => item.name);
  const trimmedCurrentValue = currentValue?.trim();

  if (trimmedCurrentValue && !optionNames.includes(trimmedCurrentValue)) {
    return [trimmedCurrentValue, ...optionNames];
  }

  return optionNames;
}

function normalizeDropdownSelectOptions(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map(item => ({
      id: item.id,
      name: String(item.name ?? '').trim(),
    }))
    .filter(item => item.id != null && item.name);
}

function findOptionIdByName(items, name) {
  const normalizedName = name?.trim();
  if (!normalizedName) return null;

  return items.find(item => item.name === normalizedName)?.id ?? null;
}

function getFallbackValue(value) {
  return value?.trim() || '-';
}

function getOsIcon(osType) {
  const normalizedOsType = osType?.trim().toLowerCase();

  if (normalizedOsType === 'macos') {
    return { src: macIcon, label: 'macos' };
  }

  if (normalizedOsType === 'windows') {
    return { src: windowIcon, label: 'windows' };
  }

  return null;
}

function normalizeClient(client) {
  return {
    id: String(client.id ?? client.client_id),
    name: client.user_name ?? '',
    ip: client.client_ip ?? '-',
    departmentOptionId: client.department_option_id ?? null,
    positionOptionId: client.position_option_id ?? null,
    department: client.department ?? '',
    position: client.position ?? '',
    osType: client.os_type ?? '',
    createdAt: client.time_kst ?? '-',
  };
}

function createUserDraft(user) {
  return {
    name: user.name,
    department: user.department,
    position: user.position,
  };
}

function DetailField({ label, children }) {
  return (
    <div className="grid grid-cols-[4.4rem_1fr] items-center gap-3 text-[13px]">
      <span className="font-semibold text-[#5E6A84]">{label}</span>
      {children}
    </div>
  );
}

function TextInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={event => onChange(event.target.value)}
      className="h-10 w-full rounded-md border border-[#D7DDE8] bg-white px-3 text-[13px] font-medium text-[#344054] outline-none transition focus:border-[#8BC6FF] focus:ring-4 focus:ring-[#DEEEFF]"
    />
  );
}

function DetailSection({ title, children, className = '' }) {
  return (
    <section className={`border-[#E3E8F2] px-5 py-5 ${className}`.trim()}>
      <h3 className="mb-4 text-[14px] font-bold text-[#23304A]">{title}</h3>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}

function UserDetailPanel({
  user,
  departmentOptions,
  positionOptions,
  onCancel,
  onDelete,
  onSave,
  isSaving,
}) {
  const [draft, setDraft] = useState(() => createUserDraft(user));
  const detailDepartmentOptions = useMemo(
    () => buildDropdownOptions(departmentOptions, draft.department),
    [departmentOptions, draft.department]
  );
  const detailPositionOptions = useMemo(
    () => buildDropdownOptions(positionOptions, draft.position),
    [draft.position, positionOptions]
  );
  const osIcon = getOsIcon(user.osType);

  const updateDraft = patch => {
    setDraft(current => ({ ...current, ...patch }));
  };

  const handleCancel = () => {
    setDraft(createUserDraft(user));
    onCancel();
  };

  const handleSave = () => {
    onSave(draft);
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">사용자 상세 설정</h2>
          <p className="mt-1 text-sm text-slate-400">
            선택한 사용자의 기본 정보와 고정 IP를 확인할 수 있습니다.
          </p>
        </div>

        <div className="flex gap-2">
          <AppButton variant="danger" onClick={onDelete} className="h-10 min-w-[4.5rem]">
            삭제
          </AppButton>
        </div>
      </div>

      <div className="grid bg-white xl:grid-cols-[1.05fr_0.95fr]">
        <DetailSection title="기본 정보" className="xl:border-r">
          <DetailField label="사용자명">
            <TextInput value={draft.name} onChange={value => updateDraft({ name: value })} />
          </DetailField>
          <DetailField label="부서">
            <MonitoringDropdown
              value={draft.department}
              displayValue={draft.department || '부서 선택'}
              onChange={value => updateDraft({ department: value })}
              options={detailDepartmentOptions}
              ariaLabel="부서 선택"
              widthClass="w-full"
              placement="right"
              verticalPlacement="top"
              triggerTextClassName="text-[13px]"
              optionTextClassName="text-[13px]"
              selectedOptionTextClassName="text-[13px]"
              triggerClassName="h-10 rounded-md border-[#D7DDE8] bg-white shadow-none hover:border-[#B6D9FF] hover:bg-[#F8FBFF] active:border-[#8BC6FF] active:bg-[#EFF6FF] focus:border-[#8BC6FF] focus:ring-4 focus:ring-[#DEEEFF]"
            />
          </DetailField>
          <DetailField label="직책">
            <MonitoringDropdown
              value={draft.position}
              displayValue={draft.position || '직책 선택'}
              onChange={value => updateDraft({ position: value })}
              options={detailPositionOptions}
              ariaLabel="직책 선택"
              widthClass="w-full"
              placement="right"
              verticalPlacement="top"
              triggerTextClassName="text-[13px]"
              optionTextClassName="text-[13px]"
              selectedOptionTextClassName="text-[13px]"
              triggerClassName="h-10 rounded-md border-[#D7DDE8] bg-white shadow-none hover:border-[#B6D9FF] hover:bg-[#F8FBFF] active:border-[#8BC6FF] active:bg-[#EFF6FF] focus:border-[#8BC6FF] focus:ring-4 focus:ring-[#DEEEFF]"
            />
          </DetailField>
        </DetailSection>

        <DetailSection title="IP 정보" className="border-t xl:border-t-0">
          <DetailField label="고정 IP">
            <div className="flex h-10 cursor-default select-none items-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[13px] font-semibold text-[#344054]">
              {user.ip}
            </div>
          </DetailField>
          <DetailField label="운영체제">
            <div className="flex h-10 cursor-default select-none items-center gap-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[13px] font-semibold text-[#344054]">
              {osIcon ? (
                <img
                  src={osIcon.src}
                  alt={osIcon.label}
                  title={osIcon.label}
                  className="h-5 w-5 object-contain"
                />
              ) : null}
              <span>{getFallbackValue(user.osType)}</span>
            </div>
          </DetailField>
        </DetailSection>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-5 sm:px-6 xl:col-span-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            취소
          </button>
          <AppButton onClick={handleSave} disabled={isSaving} className="h-11 px-6">
            {isSaving ? '저장 중' : '저장'}
          </AppButton>
        </div>
      </div>
    </div>
  );
}

function DeleteIpModal({ user, isDeleting = false, errorMessage = '', onClose, onConfirm }) {
  const deleteRows = [
    { label: 'IP 주소', value: user.ip },
    { label: '사용자명', value: getFallbackValue(user.name) },
    { label: '부서', value: getFallbackValue(user.department) },
    { label: '직책', value: getFallbackValue(user.position) },
  ];

  return (
    <div className="app-modal-stage z-[90]">
      <button
        type="button"
        aria-label="등록 IP 삭제 닫기"
        className="app-modal-backdrop cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-ip-modal-title"
        className="app-modal-panel"
      >
        <div className="app-modal-header flex items-center justify-between gap-[var(--app-gap-md)] border-b border-[#E7EBF4]">
          <h3
            id="delete-ip-modal-title"
            className="text-[clamp(1rem,1.2vw,1.125rem)] font-bold text-[#111827]"
          >
            등록 IP 삭제
          </h3>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8A93A5] transition hover:bg-[#F4F6FA] hover:text-[#075DF6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="app-modal-body">
          <div className="space-y-1.5 text-sm font-semibold leading-6 text-[#4B5563]">
            <p>선택한 IP 등록 정보를 삭제하시겠습니까?</p>
            <p>사용자 정보도 함께 제거됩니다.</p>
            <p>적용 해제는 사용자 PC에서 삭제 파일 실행이 필요합니다.</p>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-sm font-bold text-[#111827]">삭제 대상</span>
              <span className="h-px flex-1 bg-[#E7EBF4]" />
            </div>

            <dl className="mt-3 rounded-lg border border-[#E1E6EF] px-5 py-4">
              {deleteRows.map(row => (
                <div
                  key={row.label}
                  className="grid min-h-7 grid-cols-[7.2rem_1fr] items-center gap-2 text-[13px]"
                >
                  <dt className="font-extrabold text-[#526078]">{row.label}</dt>
                  <dd className="truncate font-semibold text-[#2D3748]" title={row.value}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-lg bg-[#FFF1F2] px-4 py-3 text-sm font-semibold text-[#E11D48]">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E7EBF4] px-6 py-4">
          <AppButton
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
            className="h-11 min-w-[4.5rem]"
          >
            취소
          </AppButton>
          <AppButton
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-11 min-w-[4.5rem]"
          >
            {isDeleting ? '삭제 중' : '삭제'}
          </AppButton>
        </div>
      </div>
    </div>
  );
}

export default function UserPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState(DEFAULT_DEPARTMENT_OPTION);
  const [position, setPosition] = useState(DEFAULT_POSITION_OPTION);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data: clientsData, isError, isLoading } = useRegisteredClientsQuery();
  const { data: dropdownSelectData } = useDropdownSelectOptionsQuery();
  const { mutate: patchClientMetadata, isPending: isSaving } = usePatchClientMetadataMutation();
  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClientMutation();
  const { containerRef: tableAreaRef, rowsPerPage } = useAdaptiveRowsPerPage({
    maxRows: MAX_ROWS_PER_PAGE,
    minRows: 4,
    rowHeight: 55,
  });

  const users = useMemo(() => {
    return (clientsData?.clients ?? []).map(normalizeClient);
  }, [clientsData?.clients]);

  const detailDepartmentItems = useMemo(
    () => normalizeDropdownSelectOptions(dropdownSelectData?.departments),
    [dropdownSelectData?.departments]
  );
  const detailPositionItems = useMemo(
    () => normalizeDropdownSelectOptions(dropdownSelectData?.positions),
    [dropdownSelectData?.positions]
  );
  const departmentOptions = useMemo(() => {
    const dropdownDepartments = detailDepartmentItems.map(item => item.name);
    const userDepartments = users.map(user => user.department.trim()).filter(Boolean);
    const departments = [...dropdownDepartments, ...userDepartments].filter(
      (value, index, array) => array.indexOf(value) === index
    );

    return [DEFAULT_DEPARTMENT_OPTION, ...departments];
  }, [detailDepartmentItems, users]);
  const positionOptions = useMemo(() => {
    const dropdownPositions = detailPositionItems.map(item => item.name);
    const userPositions = users.map(user => user.position.trim()).filter(Boolean);
    const positions = [...dropdownPositions, ...userPositions].filter(
      (value, index, array) => array.indexOf(value) === index
    );

    return [DEFAULT_POSITION_OPTION, ...positions];
  }, [detailPositionItems, users]);

  const selectedUser = users.find(user => user.id === selectedId) ?? null;

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return users.filter(user => {
      const matchesQuery = normalizedQuery
        ? [user.name, user.ip].some(value => value.toLowerCase().includes(normalizedQuery))
        : true;
      const matchesDepartment =
        department === DEFAULT_DEPARTMENT_OPTION || user.department === department;
      const matchesPosition = position === DEFAULT_POSITION_OPTION || user.position === position;

      return matchesQuery && matchesDepartment && matchesPosition;
    });
  }, [department, position, searchQuery, users]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visibleUsers = filteredUsers.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const handleChangeDepartment = nextDepartment => {
    setDepartment(nextDepartment);
    setCurrentPage(1);
    setSelectedId(null);
  };
  const handleChangePosition = nextPosition => {
    setPosition(nextPosition);
    setCurrentPage(1);
    setSelectedId(null);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
    setSelectedId(null);
  };

  const handleResetFilters = () => {
    setDepartment(DEFAULT_DEPARTMENT_OPTION);
    setPosition(DEFAULT_POSITION_OPTION);
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
    setSelectedId(null);
  };

  const handlePageChange = page => {
    setCurrentPage(page);
    setSelectedId(null);
  };

  const handleSaveSelectedUser = draft => {
    if (!selectedUser) return;

    patchClientMetadata(
      {
        id: selectedUser.id,
        metadata: {
          user_name: draft.name,
          department_option_id: findOptionIdByName(detailDepartmentItems, draft.department),
          position_option_id: findOptionIdByName(detailPositionItems, draft.position),
        },
      },
      {
        onSuccess: () => setSelectedId(null),
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    setDeleteErrorMessage('');
    deleteClient(deleteTarget.id, {
      onSuccess: () => {
        setSelectedId(current => (current === deleteTarget.id ? null : current));
        setDeleteTarget(null);
      },
      onError: () => {
        setDeleteErrorMessage('사용자 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      },
    });
  };

  const statusMessage = isError
    ? '사용자 목록을 불러오지 못했습니다.'
    : isLoading
      ? '사용자 목록을 불러오는 중입니다.'
      : !filteredUsers.length
        ? '현재 조건에 맞는 사용자가 없습니다.'
        : '';

  return (
    <PageLayout bottomPaddingClassName="pb-0">
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-3 lg:flex-1 lg:flex-row">
              <MonitoringDropdown
                value={department}
                onChange={handleChangeDepartment}
                options={departmentOptions}
                ariaLabel="전체 부서"
                widthClass="w-full lg:w-[clamp(10rem,13vw,12rem)] lg:shrink-0"
                triggerClassName="h-12 rounded-xl border-slate-200 bg-white shadow-none"
                optionLabelMap={{ [DEFAULT_DEPARTMENT_OPTION]: '전체' }}
              />

              <MonitoringDropdown
                value={position}
                onChange={handleChangePosition}
                options={positionOptions}
                ariaLabel="전체 직책"
                widthClass="w-full lg:w-[clamp(10rem,13vw,12rem)] lg:shrink-0"
                triggerClassName="h-12 rounded-xl border-slate-200 bg-white shadow-none"
                optionLabelMap={{ [DEFAULT_POSITION_OPTION]: '전체' }}
              />

              <div className="flex flex-1 flex-col gap-3 sm:min-w-[20rem] sm:flex-row lg:w-[clamp(18rem,30vw,24rem)] lg:min-w-0 lg:flex-none">
                <AppSearchField
                  value={searchInput}
                  onChange={event => setSearchInput(event.target.value)}
                  placeholder="사용자명, IP 검색"
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
              </div>
            </div>
          </div>
        </div>

        <SectionCard className="overflow-hidden">
          <div ref={tableAreaRef} className={monitoringTableSurfaceClass}>
            <div className="overflow-hidden">
              <table className={`${monitoringTableClass} text-left`}>
                <thead className={monitoringTableHeadClass}>
                  <tr className={monitoringTableHeaderRowClass}>
                    <th className={`${monitoringTableHeaderCellClass} w-[4%] px-4`} />
                    <th
                      className={`${monitoringTableHeaderCellClass} w-[18%] whitespace-nowrap px-3`}
                    >
                      IP 주소
                    </th>
                    <th
                      className={`${monitoringTableHeaderCellClass} w-[10%] whitespace-nowrap px-3 !text-center`}
                    >
                      운영체제
                    </th>
                    <th
                      className={`${monitoringTableHeaderCellClass} w-[16%] whitespace-nowrap px-3`}
                    >
                      사용자명
                    </th>
                    <th
                      className={`${monitoringTableHeaderCellClass} w-[16%] whitespace-nowrap px-3`}
                    >
                      부서
                    </th>
                    <th
                      className={`${monitoringTableHeaderCellClass} w-[16%] whitespace-nowrap px-3`}
                    >
                      직책
                    </th>
                    <th
                      className={`${monitoringTableHeaderCellClass} w-[20%] whitespace-nowrap px-3`}
                    >
                      최초 등록일
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user, index) => {
                    const isSelected = user.id === selectedId;
                    const osIcon = getOsIcon(user.osType);

                    return (
                      <Fragment key={user.id}>
                        <tr
                          onClick={() =>
                            setSelectedId(current => (current === user.id ? null : user.id))
                          }
                          className={monitoringTableRowClass({
                            selected: isSelected,
                            striped: index % 2 === 1,
                            interactive: true,
                          })}
                        >
                          <td className={monitoringTableCellClass(index, 'px-4 align-middle')}>
                            <button
                              type="button"
                              aria-label={`${user.name} 선택`}
                              className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                                isSelected ? 'border-[#075DF6]' : 'border-slate-300'
                              }`.trim()}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-full transition ${
                                  isSelected ? 'bg-[#075DF6]' : 'bg-transparent'
                                }`.trim()}
                              />
                            </button>
                          </td>
                          <td className={monitoringTableCellClass(index, 'whitespace-nowrap px-3')}>
                            <span className="font-semibold text-slate-800">{user.ip}</span>
                          </td>
                          <td
                            className={monitoringTableCellClass(
                              index,
                              'whitespace-nowrap px-3 text-center'
                            )}
                          >
                            {osIcon ? (
                              <div className="flex items-center justify-center">
                                <div className="flex h-[var(--app-control-xs)] w-[var(--app-control-xs)] items-center justify-center rounded-[var(--app-radius-md)] border border-[#8BC6FF] bg-[#F7FBFF] shadow-[0_0.625rem_1.5rem_rgba(7, 93, 246,0.08)]">
                                  <img
                                    src={osIcon.src}
                                    alt={osIcon.label}
                                    title={osIcon.label}
                                    className="h-[var(--app-icon-md)] w-[var(--app-icon-md)] object-contain"
                                  />
                                </div>
                              </div>
                            ) : (
                              getFallbackValue(user.osType)
                            )}
                          </td>
                          <td className={monitoringTableCellClass(index, 'whitespace-nowrap px-3')}>
                            {getFallbackValue(user.name)}
                          </td>
                          <td className={monitoringTableCellClass(index, 'whitespace-nowrap px-3')}>
                            {getFallbackValue(user.department)}
                          </td>
                          <td className={monitoringTableCellClass(index, 'whitespace-nowrap px-3')}>
                            <div className="truncate">{getFallbackValue(user.position)}</div>
                          </td>
                          <td className={monitoringTableCellClass(index, 'whitespace-nowrap px-3')}>
                            {user.createdAt}
                          </td>
                        </tr>
                        {isSelected ? (
                          <tr>
                            <td colSpan={7} className="border-t border-[#E5EBF5] bg-white p-0">
                              {selectedUser ? (
                                <UserDetailPanel
                                  key={selectedUser.id}
                                  user={selectedUser}
                                  departmentOptions={detailDepartmentItems}
                                  positionOptions={detailPositionItems}
                                  onCancel={() => setSelectedId(null)}
                                  onDelete={() => {
                                    setDeleteErrorMessage('');
                                    setDeleteTarget(selectedUser);
                                  }}
                                  onSave={handleSaveSelectedUser}
                                  isSaving={isSaving}
                                />
                              ) : null}
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {statusMessage ? (
              <section className="border-t border-dashed border-[#DCEAF1] px-6 py-4 text-center text-sm text-[#94A3B8]">
                {statusMessage}
              </section>
            ) : null}
          </div>
        </SectionCard>

        {filteredUsers.length ? (
          <FixedPaginationBar
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        ) : null}
      </div>

      {deleteTarget ? (
        <DeleteIpModal
          user={deleteTarget}
          isDeleting={isDeleting}
          errorMessage={deleteErrorMessage}
          onClose={() => {
            if (isDeleting) return;
            setDeleteErrorMessage('');
            setDeleteTarget(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </PageLayout>
  );
}
