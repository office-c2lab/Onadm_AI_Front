import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { delay, mockStore } from '../data/mockStore.js';

const getRegisteredClients = () =>
  delay({ clients: mockStore.clients, total: mockStore.clients.length });
const patchClientMetadata = ({ id, metadata }) => {
  const client = mockStore.clients.find(item => String(item.id) === String(id));
  if (client) {
    Object.assign(client, metadata);
    const department = mockStore.dropdowns.department.find(
      item => item.id === metadata.department_option_id
    );
    const position = mockStore.dropdowns.position.find(
      item => item.id === metadata.position_option_id
    );
    if (department) client.department = department.name;
    if (position) client.position = position.name;
  }
  return delay(client);
};
const deleteClient = id => {
  mockStore.clients = mockStore.clients.filter(item => String(item.id) !== String(id));
  return delay({ success: true });
};

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
