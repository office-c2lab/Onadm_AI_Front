import { delay, mockStore } from './mockStore.js';
export const getRegisteredClients = () =>
  delay({ clients: mockStore.clients, total: mockStore.clients.length });
export async function patchClientMetadata({ id, metadata }) {
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
}
export async function deleteClient(id) {
  mockStore.clients = mockStore.clients.filter(item => String(item.id) !== String(id));
  return delay({ success: true });
}
