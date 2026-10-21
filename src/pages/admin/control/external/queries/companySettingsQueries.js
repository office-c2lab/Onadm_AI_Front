import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { delay, mockStore } from '../data/mockStore.js';

const getTemplateSettings = () => delay(mockStore.template);
const getDownloadSettings = () => delay(mockStore.download);
const patchTemplateSettings = template => {
  mockStore.template = { ...mockStore.template, ...template };
  return delay(mockStore.template);
};
const patchDownloadSettings = settings => {
  mockStore.download = { ...mockStore.download, ...settings };
  return delay(mockStore.download);
};

export const companySettingsQueryKeys = {
  all: ['company-settings'],
  template: () => [...companySettingsQueryKeys.all, 'template'],
  download: () => [...companySettingsQueryKeys.all, 'download'],
};

export function useTemplateSettingsQuery() {
  return useQuery({
    queryKey: companySettingsQueryKeys.template(),
    queryFn: getTemplateSettings,
  });
}

export function usePatchTemplateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchTemplateSettings,
    onSuccess: data => {
      queryClient.setQueryData(companySettingsQueryKeys.template(), data);
    },
  });
}

export function useDownloadSettingsQuery() {
  return useQuery({
    queryKey: companySettingsQueryKeys.download(),
    queryFn: getDownloadSettings,
  });
}

export function usePatchDownloadSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchDownloadSettings,
    onSuccess: data => {
      queryClient.setQueryData(companySettingsQueryKeys.download(), data);
    },
  });
}
