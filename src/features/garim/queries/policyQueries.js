import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPiiProtectionCategory,
  deletePiiProtectionCategory,
  getFileUploadExtensions,
  getPiiProtectionCategories,
  getPiiProtectionCategory,
  getPolicies,
  patchPolicyEnabled,
  patchPiiProtectionCategory,
  putPiiProtectionCategory,
  putFileUploadExtensions,
} from '../api/policies.js';

export const policyQueryKeys = {
  all: ['policies'],
  list: () => [...policyQueryKeys.all, 'list'],
  fileUploadExtensions: () => [...policyQueryKeys.all, 'file-upload-extensions'],
  piiProtectionCategories: () => [...policyQueryKeys.all, 'pii-protection-categories'],
  piiProtectionCategory: categoryId => [
    ...policyQueryKeys.piiProtectionCategories(),
    String(categoryId),
  ],
};

export function usePoliciesQuery() {
  return useQuery({
    queryKey: policyQueryKeys.list(),
    queryFn: getPolicies,
  });
}

export function usePatchPolicyEnabledMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchPolicyEnabled,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: policyQueryKeys.all }),
  });
}

export function useFileUploadExtensionsQuery(options = {}) {
  return useQuery({
    queryKey: policyQueryKeys.fileUploadExtensions(),
    queryFn: getFileUploadExtensions,
    ...options,
  });
}

export function usePutFileUploadExtensionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putFileUploadExtensions,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: policyQueryKeys.fileUploadExtensions() }),
  });
}

export function usePiiProtectionCategoriesQuery(options = {}) {
  return useQuery({
    queryKey: policyQueryKeys.piiProtectionCategories(),
    queryFn: getPiiProtectionCategories,
    ...options,
  });
}

export function usePiiProtectionCategoryQuery(categoryId, options = {}) {
  return useQuery({
    queryKey: policyQueryKeys.piiProtectionCategory(categoryId),
    queryFn: () => getPiiProtectionCategory(categoryId),
    enabled: Boolean(categoryId),
    ...options,
  });
}

export function useCreatePiiProtectionCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPiiProtectionCategory,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: policyQueryKeys.piiProtectionCategories() }),
  });
}

export function usePutPiiProtectionCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putPiiProtectionCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: policyQueryKeys.piiProtectionCategories() });
      queryClient.invalidateQueries({
        queryKey: policyQueryKeys.piiProtectionCategory(variables.categoryId),
      });
    },
  });
}

export function usePatchPiiProtectionCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchPiiProtectionCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: policyQueryKeys.piiProtectionCategories() });
      queryClient.invalidateQueries({
        queryKey: policyQueryKeys.piiProtectionCategory(variables.categoryId),
      });
    },
  });
}

export function useDeletePiiProtectionCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePiiProtectionCategory,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: policyQueryKeys.piiProtectionCategories() }),
  });
}

