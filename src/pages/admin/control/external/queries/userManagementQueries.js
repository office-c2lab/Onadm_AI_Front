import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteClient, getRegisteredClients, patchClientMetadata } from '../api/userManagement.js';

export const USER_MANAGEMENT_CLIENTS_LIMIT = 1000;

export const userManagementQueryKeys = {
  all: ['user-management'],
  clients: params => [...userManagementQueryKeys.all, 'clients', params],
};

export function useRegisteredClientsQuery() {
  const params = {
    limit: USER_MANAGEMENT_CLIENTS_LIMIT,
    offset: 0,
  };

  return useQuery({
    queryKey: userManagementQueryKeys.clients(params),
    queryFn: () => getRegisteredClients(params),
    refetchInterval: 5000,
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  });
}

export function usePatchClientMetadataMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchClientMetadata,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userManagementQueryKeys.all }),
  });
}

export function useDeleteClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userManagementQueryKeys.all }),
  });
}

