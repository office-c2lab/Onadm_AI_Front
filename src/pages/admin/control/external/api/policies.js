import { delay, mockStore } from './mockStore.js';
export const getPolicies = () =>
  delay({
    policies: mockStore.policies,
    applied_services: ['ChatGPT', 'Gemini', 'Claude', 'Genspark', 'MS Copilot'],
  });
export async function patchPolicyEnabled({ code, enabled }) {
  const item = mockStore.policies.find(policy => policy.code === code);
  if (item) item.enabled = enabled;
  return delay(item);
}
export const getFileUploadExtensions = () => delay({ extensions: mockStore.extensions });
export async function putFileUploadExtensions({ blockedExtensions }) {
  mockStore.extensions.forEach(item => {
    item.blocked = blockedExtensions.includes(item.extension);
  });
  return delay({ extensions: mockStore.extensions });
}
export const getPiiProtectionCategories = () => delay({ categories: mockStore.piiCategories });
export const getPiiProtectionCategory = categoryId =>
  delay({ category: mockStore.piiCategories.find(item => String(item.id) === String(categoryId)) });
export async function createPiiProtectionCategory(payload) {
  const item = { id: Date.now(), ...payload };
  mockStore.piiCategories.push(item);
  return delay(item);
}
export async function putPiiProtectionCategory({ categoryId, payload }) {
  const item = mockStore.piiCategories.find(value => String(value.id) === String(categoryId));
  if (item) Object.assign(item, payload);
  return delay(item);
}
export const patchPiiProtectionCategory = putPiiProtectionCategory;
export async function deletePiiProtectionCategory(categoryId) {
  mockStore.piiCategories = mockStore.piiCategories.filter(
    item => String(item.id) !== String(categoryId)
  );
  return delay({ success: true });
}
