import { delay, mockStore } from './mockStore.js';
export const getDomains = () => delay({ domains: mockStore.domains });
export async function patchDomainEnabled({ serviceCode, enabled }) {
  const item = mockStore.domains.find(domain => domain.service_code === serviceCode);
  if (item) item.enabled = enabled;
  return delay(item);
}
