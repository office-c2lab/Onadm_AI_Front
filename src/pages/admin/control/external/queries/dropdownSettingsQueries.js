import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { delay, mockStore } from '../data/mockStore.js';
import { userManagementQueryKeys } from './userManagementQueries.js';

const list = kind => mockStore.dropdowns[kind] ?? [];
const getDropdownSelectOptions = () =>
  delay({ departments: list('department'), positions: list('position') });
const getDropdownOptions = ({ kind, q = '' }) =>
  delay({ options: list(kind).filter(item => item.name.includes(q)) });
const createDropdownOption = ({ kind, option }) => {
  const item = {
    ...option,
    id: Date.now(),
    sort_order: list(kind).length + 1,
    employee_count: 0,
    created_at_kst: '2026-10-20',
  };
  list(kind).push(item);
  return delay(item);
};
const patchDropdownOrder = ({ kind, ids }) => {
  mockStore.dropdowns[kind] = ids
    .map(id => list(kind).find(item => item.id === id))
    .filter(Boolean)
    .map((item, index) => ({ ...item, sort_order: index + 1 }));
  return delay({ success: true });
};
const patchDropdownOption = ({ kind, optionId, option }) => {
  const item = list(kind).find(value => value.id === optionId);
  if (item) Object.assign(item, option);
  return delay(item);
};
const deleteDropdownOption = ({ kind, optionId }) => {
  mockStore.dropdowns[kind] = list(kind).filter(item => item.id !== optionId);
  return delay({ success: true });
};

export const dropdownSettingsQueryKeys = {
  all: ['dropdown-settings'],
  select: params => [...dropdownSettingsQueryKeys.all, 'select', params],
  options: params => [...dropdownSettingsQueryKeys.all, 'options', params],
};

function invalidateDropdowns(queryClient) {
  queryClient.invalidateQueries({ queryKey: dropdownSettingsQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: userManagementQueryKeys.all });
}

export function useDropdownSelectOptionsQuery(params = {}) {
  return useQuery({
    queryKey: dropdownSettingsQueryKeys.select(params),
    queryFn: () => getDropdownSelectOptions(params),
  });
}

export function useDropdownOptionsQuery({ kind, q = '' }) {
  return useQuery({
    queryKey: dropdownSettingsQueryKeys.options({ kind, q }),
    queryFn: () => getDropdownOptions({ kind, q }),
    enabled: Boolean(kind),
  });
}

export function useCreateDropdownOptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDropdownOption,
    onSuccess: () => invalidateDropdowns(queryClient),
  });
}

export function usePatchDropdownOptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchDropdownOption,
    onSuccess: () => invalidateDropdowns(queryClient),
  });
}

export function usePatchDropdownOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchDropdownOrder,
    onSuccess: () => invalidateDropdowns(queryClient),
  });
}

export function useDeleteDropdownOptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDropdownOption,
    onSuccess: () => invalidateDropdowns(queryClient),
  });
}
