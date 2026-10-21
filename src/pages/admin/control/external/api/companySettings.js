import { delay, mockStore } from './mockStore.js';
export const getTemplateSettings = () => delay(mockStore.template);
export async function patchTemplateSettings(template) {
  mockStore.template = { ...mockStore.template, ...template };
  return delay(mockStore.template);
}
export const getDownloadSettings = () => delay(mockStore.download);
export async function patchDownloadSettings(settings) {
  mockStore.download = { ...mockStore.download, ...settings };
  return delay(mockStore.download);
}
