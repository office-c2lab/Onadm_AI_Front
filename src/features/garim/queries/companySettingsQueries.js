import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDownloadSettings,
  getTemplateSettings,
  patchDownloadSettings,
  patchTemplateSettings,
} from '../api/companySettings.js';

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

