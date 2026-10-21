import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { delay, mockStore } from '../data/mockStore.js';

const getDomains = () => delay({ domains: mockStore.domains });
const patchDomainEnabled = ({ serviceCode, enabled }) => {
  const domain = mockStore.domains.find(item => item.service_code === serviceCode);
  if (domain) domain.enabled = enabled;
  return delay(domain);
};

export const domainQueryKeys = {
  all: ['domains'],
  list: () => [...domainQueryKeys.all, 'list'],
};

export function useDomainsQuery() {
  return useQuery({
    queryKey: domainQueryKeys.list(),
    queryFn: getDomains,
  });
}

export function usePatchDomainEnabledMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchDomainEnabled,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: domainQueryKeys.all }),
  });
}
