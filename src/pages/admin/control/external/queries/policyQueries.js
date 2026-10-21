import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { delay, mockStore } from '../data/mockStore.js';

const getPolicies = () =>
  delay({
    policies: mockStore.policies,
    applied_services: ['ChatGPT', 'Gemini', 'Claude', 'Genspark', 'MS Copilot'],
  });
const patchPolicyEnabled = ({ code, enabled }) => {
  const policy = mockStore.policies.find(item => item.code === code);
  if (policy) policy.enabled = enabled;
  return delay(policy);
};
const getFileUploadExtensions = () => delay({ extensions: mockStore.extensions });
const putFileUploadExtensions = ({ blockedExtensions }) => {
  mockStore.extensions.forEach(item => {
    item.blocked = blockedExtensions.includes(item.extension);
  });
  return delay({ extensions: mockStore.extensions });
};
const getPiiProtectionCategories = () => delay({ categories: mockStore.piiCategories });
const getPiiProtectionCategory = categoryId =>
  delay({
    category: mockStore.piiCategories.find(item => String(item.id) === String(categoryId)),
  });
const createPiiProtectionCategory = payload => {
  const item = { id: Date.now(), ...payload };
  mockStore.piiCategories.push(item);
  return delay(item);
};
const putPiiProtectionCategory = ({ categoryId, payload }) => {
  const item = mockStore.piiCategories.find(value => String(value.id) === String(categoryId));
  if (item) Object.assign(item, payload);
  return delay(item);
};
const patchPiiProtectionCategory = putPiiProtectionCategory;
const deletePiiProtectionCategory = categoryId => {
  mockStore.piiCategories = mockStore.piiCategories.filter(
    item => String(item.id) !== String(categoryId)
  );
  return delay({ success: true });
};

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
