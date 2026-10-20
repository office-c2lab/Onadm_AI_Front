import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDropdownOption,
  deleteDropdownOption,
  getDropdownOptions,
  getDropdownSelectOptions,
  patchDropdownOption,
  patchDropdownOrder,
} from '../api/dropdownSettings.js';
import { userManagementQueryKeys } from './userManagementQueries.js';

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

