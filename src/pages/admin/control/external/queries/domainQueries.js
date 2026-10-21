import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDomains, patchDomainEnabled } from '../api/domains.js';

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

