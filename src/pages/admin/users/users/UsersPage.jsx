import DialogLayer from '../../../../components/ui/DialogLayer.jsx';
import { Fragment, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';
import AppButton from '../../../../components/ui/Button.jsx';
import AppSearchField from '../../../../components/ui/SearchField.jsx';
import FixedPaginationBar from '../../../../components/pagination/FixedPaginationBar.jsx';
import SectionCard from '../../../../components/ui/SectionCard.jsx';
import {
  MonitoringIconButtonTooltip,
  MonitoringResetButton,
} from '../../control/external/components/monitoring/MonitoringListComponents.jsx';
import {
  tableCellClass,
  tableClass,
  tableHeadClass,
  tableHeaderCellClass,
  tableHeaderRowClass,
  tableRowClass,
  tableSurfaceClass,
} from '../../../../styles/table.js';
import useAdaptiveRowsPerPage from '../../control/external/hooks/useAdaptiveRowsPerPage.js';
import PageLayout from '../../../../components/layout/PageLayout.jsx';
import { useDropdownSelectOptionsQuery } from '../../control/external/queries/dropdownSettingsQueries.js';
import {
  useDeleteClientMutation,
  usePatchClientMetadataMutation,
  useRegisteredClientsQuery,
} from '../../control/external/queries/userManagementQueries.js';

const DEFAULT_DEPARTMENT_OPTION = '전체 부서';
const DEFAULT_POSITION_OPTION = '전체 직책';
const DEFAULT_STATUS_OPTION = '전체 상태';
const MAX_ROWS_PER_PAGE = 10;
const USER_STATUSES = ['승인 대기', '활성', '비활성', '거절됨'];
const STATUS_FILTER_OPTIONS = [DEFAULT_STATUS_OPTION, ...USER_STATUSES];
const DEFAULT_USER_STATUSES = {
  1: '승인 대기',
  2: '활성',
  3: '비활성',
  4: '거절됨',
  5: '승인 대기',
  6: '활성',
};
const MOCK_USER_EMAILS = {
  1: 'minjun.kim@example.com',
  2: 'seoyeon.park@example.com',
  3: 'doyun.lee@example.com',
  4: 'yujin.choi@example.com',
  5: 'haneul.jung@example.com',
  6: 'jiho.kang@example.com',
};
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

function normalizeClient(client) {
  return {
    id: String(client.id ?? client.client_id),
    name: client.user_name ?? '',
    email: client.email ?? MOCK_USER_EMAILS[client.id] ?? '-',
    departmentOptionId: client.department_option_id ?? null,
    positionOptionId: client.position_option_id ?? null,
    department: client.department ?? '',
    position: client.position ?? '',
    status:
      client.account_status ?? client.status ?? DEFAULT_USER_STATUSES[client.id] ?? '승인 대기',
    statusChangeReason: client.status_change_reason ?? '',
    createdAt: client.time_kst ?? '-',
  };
}

function UserStatusBadge({ status }) {
  const statusClassName = {
    '승인 대기': 'bg-palette-orange-01 text-palette-orange-03',
    활성: 'bg-palette-green-01 text-palette-green-04',
    비활성: 'bg-palette-blue-21 text-palette-blue-82',
    거절됨: 'bg-palette-red-02 text-palette-red-07',
  };

  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
        statusClassName[status] ?? statusClassName['비활성']
      }`}
    >
      {status}
    </span>
  );
}

function createUserDraft(user) {
  return {
    name: user.name,
    email: user.email,
    department: user.department,
    position: user.position,
    status: user.status,
    statusChangeReason: user.statusChangeReason,
  };
}

function DetailField({ label, children }) {
  return (
    <div className="grid grid-cols-[4.4rem_1fr] items-center gap-3 text-compact">
      <span className="font-semibold text-palette-blue-89">{label}</span>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={event => onChange(event.target.value)}
      className="h-10 w-full rounded-md border border-palette-blue-44 bg-white px-3 text-compact font-medium text-text-secondary outline-none transition focus:border-focus-border focus:ring-4 focus:ring-focus-ring"
    />
  );
}

function DetailSection({ title, children, className = '' }) {
  return (
    <section className={`border-divider px-5 py-5 ${className}`.trim()}>
      <h3 className="mb-4 text-body-sm font-bold text-palette-blue-109">{title}</h3>
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
  const [validationError, setValidationError] = useState('');
  const detailDepartmentOptions = useMemo(
    () => buildDropdownOptions(departmentOptions, draft.department),
    [departmentOptions, draft.department]
  );
  const detailPositionOptions = useMemo(
    () => buildDropdownOptions(positionOptions, draft.position),
    [draft.position, positionOptions]
  );
  const updateDraft = patch => {
    setDraft(current => ({ ...current, ...patch }));
    setValidationError('');
  };

  const handleCancel = () => {
    setDraft(createUserDraft(user));
    onCancel();
  };

  const handleSave = () => {
    if (!draft.email.trim()) {
      setValidationError('이메일을 입력해 주세요.');
      return;
    }
    if (draft.status !== user.status && !draft.statusChangeReason.trim()) {
      setValidationError('계정 상태를 변경하려면 변경 사유를 입력해 주세요.');
      return;
    }
    onSave({
      ...draft,
      email: draft.email.trim(),
      statusChangeReason: draft.statusChangeReason.trim(),
    });
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">사용자 상세 설정</h2>
          <p className="mt-1 text-sm text-slate-400">
            선택한 사용자의 기본 정보와 계정 상태를 관리할 수 있습니다.
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
          <DetailField label="이메일">
            <TextInput
              type="email"
              value={draft.email}
              onChange={value => updateDraft({ email: value })}
            />
          </DetailField>
          <DetailField label="부서">
            <CustomDropdown
              value={draft.department}
              onChange={value => updateDraft({ department: value })}
              options={detailDepartmentOptions}
              ariaLabel="부서 선택"
              placeholder="부서 선택"
              className="w-full [&>button]:min-h-10 [&>button]:rounded-md"
            />
          </DetailField>
          <DetailField label="직책">
            <CustomDropdown
              value={draft.position}
              onChange={value => updateDraft({ position: value })}
              options={detailPositionOptions}
              ariaLabel="직책 선택"
              placeholder="직책 선택"
              className="w-full [&>button]:min-h-10 [&>button]:rounded-md"
            />
          </DetailField>
        </DetailSection>

        <DetailSection title="계정 상태" className="border-t xl:border-t-0">
          <DetailField label="계정 상태">
            <CustomDropdown
              value={draft.status}
              onChange={value =>
                updateDraft({
                  status: value,
                  statusChangeReason: value === user.status ? user.statusChangeReason : '',
                })
              }
              options={USER_STATUSES}
              ariaLabel="계정 상태 선택"
              className="w-full [&>button]:min-h-10 [&>button]:rounded-md"
            />
          </DetailField>
          <DetailField label="변경 사유">
            <textarea
              value={draft.statusChangeReason}
              onChange={event => updateDraft({ statusChangeReason: event.target.value })}
              placeholder="계정 상태 변경 사유를 입력해 주세요"
              rows={4}
              className="min-h-24 w-full resize-y rounded-md border border-palette-blue-44 bg-white px-3 py-2.5 text-compact font-medium text-text-secondary outline-none transition placeholder:text-palette-blue-64 focus:border-focus-border focus:ring-4 focus:ring-focus-ring"
            />
          </DetailField>
        </DetailSection>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-5 sm:px-6 xl:col-span-2">
          <p role="alert" className="text-sm font-medium text-palette-red-07">
            {validationError}
          </p>
          <div className="flex gap-3">
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
    </div>
  );
}

function DeleteUserModal({ user, isDeleting = false, errorMessage = '', onClose, onConfirm }) {
  const deleteRows = [
    { label: '사용자명', value: getFallbackValue(user.name) },
    { label: '이메일', value: getFallbackValue(user.email) },
    { label: '부서', value: getFallbackValue(user.department) },
    { label: '계정 상태', value: getFallbackValue(user.status) },
  ];

  return (
    <DialogLayer onClose={onClose} className="app-modal-stage z-[90]">
      <button
        type="button"
        aria-label="사용자 삭제 닫기"
        className="app-modal-backdrop cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-modal-title"
        className="app-modal-panel"
      >
        <div className="app-modal-header flex items-center justify-between gap-[var(--app-gap-md)] border-b border-border-subtle">
          <h3 id="delete-user-modal-title" className="text-modal-title font-bold text-text-primary">
            사용자 삭제
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
            <p>선택한 사용자를 삭제하시겠습니까?</p>
            <p>삭제한 사용자 정보는 되돌릴 수 없습니다.</p>
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

          {errorMessage ? (
            <p className="mt-4 rounded-lg bg-palette-red-01 px-4 py-3 text-sm font-semibold text-rose-600">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-border-subtle px-6 py-4">
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
    </DialogLayer>
  );
}

export default function UserPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState(DEFAULT_DEPARTMENT_OPTION);
  const [position, setPosition] = useState(DEFAULT_POSITION_OPTION);
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_OPTION);
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
  const departmentFilterOptions = useMemo(
    () =>
      departmentOptions.map(option => ({
        value: option,
        label: option === DEFAULT_DEPARTMENT_OPTION ? '전체' : option,
      })),
    [departmentOptions]
  );
  const positionFilterOptions = useMemo(
    () =>
      positionOptions.map(option => ({
        value: option,
        label: option === DEFAULT_POSITION_OPTION ? '전체' : option,
      })),
    [positionOptions]
  );

  const selectedUser = users.find(user => user.id === selectedId) ?? null;

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return users.filter(user => {
      const matchesQuery = normalizedQuery
        ? [user.name, user.email].some(value => value.toLowerCase().includes(normalizedQuery))
        : true;
      const matchesDepartment =
        department === DEFAULT_DEPARTMENT_OPTION || user.department === department;
      const matchesPosition = position === DEFAULT_POSITION_OPTION || user.position === position;
      const matchesStatus = statusFilter === DEFAULT_STATUS_OPTION || user.status === statusFilter;

      return matchesQuery && matchesDepartment && matchesPosition && matchesStatus;
    });
  }, [department, position, searchQuery, statusFilter, users]);
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
  const handleChangeStatus = nextStatus => {
    setStatusFilter(nextStatus);
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
    setStatusFilter(DEFAULT_STATUS_OPTION);
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
          email: draft.email,
          department_option_id: findOptionIdByName(detailDepartmentItems, draft.department),
          position_option_id: findOptionIdByName(detailPositionItems, draft.position),
          account_status: draft.status,
          status_change_reason: draft.statusChangeReason,
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
    <div className="app-control-scope flex h-dvh min-h-0 flex-col overflow-hidden text-text-primary">
      <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <PageLayout bottomPaddingClassName="pb-0">
          <div className="flex min-h-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-4 pt-1">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex w-full flex-col gap-3 lg:flex-1 lg:flex-row lg:flex-wrap">
                  <CustomDropdown
                    value={department}
                    onChange={handleChangeDepartment}
                    options={departmentFilterOptions}
                    ariaLabel="전체 부서"
                    className="w-full lg:w-[clamp(10rem,13vw,12rem)] lg:shrink-0 [&>button]:h-12 [&>button]:rounded-xl"
                  />

                  <CustomDropdown
                    value={position}
                    onChange={handleChangePosition}
                    options={positionFilterOptions}
                    ariaLabel="전체 직책"
                    className="w-full lg:w-[clamp(10rem,13vw,12rem)] lg:shrink-0 [&>button]:h-12 [&>button]:rounded-xl"
                  />

                  <CustomDropdown
                    value={statusFilter}
                    onChange={handleChangeStatus}
                    options={STATUS_FILTER_OPTIONS}
                    ariaLabel="상태 필터"
                    className="w-full lg:w-[clamp(10rem,13vw,12rem)] lg:shrink-0 [&>button]:h-12 [&>button]:rounded-xl"
                  />

                  <div className="flex flex-1 flex-col gap-3 sm:min-w-[20rem] sm:flex-row lg:min-w-[20rem]">
                    <AppSearchField
                      value={searchInput}
                      onChange={event => setSearchInput(event.target.value)}
                      placeholder="사용자명, 이메일 검색"
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

            <SectionCard className={selectedUser ? 'overflow-visible' : 'overflow-hidden'}>
              <div
                ref={tableAreaRef}
                className={`${tableSurfaceClass} ${selectedUser ? '!overflow-visible' : ''}`}
              >
                <div className={selectedUser ? 'overflow-visible' : 'overflow-hidden'}>
                  <table className={`${tableClass} text-left`}>
                    <thead className={tableHeadClass}>
                      <tr className={tableHeaderRowClass}>
                        <th className={`${tableHeaderCellClass} w-[12%] whitespace-nowrap px-4`}>
                          사용자명
                        </th>
                        <th className={`${tableHeaderCellClass} w-[30%] whitespace-nowrap px-3`}>
                          이메일
                        </th>
                        <th
                          className={`${tableHeaderCellClass} w-[15%] whitespace-nowrap px-3 !text-center`}
                        >
                          상태
                        </th>
                        <th className={`${tableHeaderCellClass} w-[16%] whitespace-nowrap px-3`}>
                          부서
                        </th>
                        <th className={`${tableHeaderCellClass} w-[12%] whitespace-nowrap px-3`}>
                          직책
                        </th>
                        <th className={`${tableHeaderCellClass} w-[15%] whitespace-nowrap px-3`}>
                          처리 시각
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleUsers.map((user, index) => {
                        const isSelected = user.id === selectedId;

                        return (
                          <Fragment key={user.id}>
                            <tr
                              onClick={() =>
                                setSelectedId(current => (current === user.id ? null : user.id))
                              }
                              className={tableRowClass({
                                selected: isSelected,
                                striped: index % 2 === 1,
                                interactive: true,
                              })}
                            >
                              <td className={tableCellClass(index, 'whitespace-nowrap px-4')}>
                                {getFallbackValue(user.name)}
                              </td>
                              <td
                                className={tableCellClass(index, 'min-w-0 px-3')}
                                title={user.email}
                              >
                                <span className="block truncate">{user.email}</span>
                              </td>
                              <td
                                className={tableCellClass(
                                  index,
                                  'whitespace-nowrap px-3 text-center'
                                )}
                              >
                                <UserStatusBadge status={user.status} />
                              </td>
                              <td className={tableCellClass(index, 'whitespace-nowrap px-3')}>
                                {getFallbackValue(user.department)}
                              </td>
                              <td className={tableCellClass(index, 'whitespace-nowrap px-3')}>
                                <div className="truncate">{getFallbackValue(user.position)}</div>
                              </td>
                              <td className={tableCellClass(index, 'whitespace-nowrap px-3')}>
                                {user.createdAt}
                              </td>
                            </tr>
                            {isSelected ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="border-t border-palette-blue-28 bg-white p-0"
                                >
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
                  <section className="border-t border-dashed border-palette-blue-34 px-6 py-4 text-center text-sm text-slate-400">
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
            <DeleteUserModal
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
      </section>
    </div>
  );
}
