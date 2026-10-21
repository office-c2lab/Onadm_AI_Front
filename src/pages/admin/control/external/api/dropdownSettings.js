import { delay, mockStore } from './mockStore.js';
const list = kind => mockStore.dropdowns[kind] ?? [];
export const getDropdownSelectOptions = () =>
  delay({ departments: list('department'), positions: list('position') });
export function getDropdownOptions({ kind, q = '' }) {
  return delay({ options: list(kind).filter(item => item.name.includes(q)) });
}
export async function createDropdownOption({ kind, option }) {
  const item = {
    ...option,
    id: Date.now(),
    sort_order: list(kind).length + 1,
    employee_count: 0,
    created_at_kst: '2026-10-20',
  };
  list(kind).push(item);
  return delay(item);
}
export async function patchDropdownOrder({ kind, ids }) {
  mockStore.dropdowns[kind] = ids
    .map(id => list(kind).find(item => item.id === id))
    .filter(Boolean)
    .map((item, index) => ({ ...item, sort_order: index + 1 }));
  return delay({ success: true });
}
export async function patchDropdownOption({ kind, optionId, option }) {
  const item = list(kind).find(value => value.id === optionId);
  if (item) Object.assign(item, option);
  return delay(item);
}
export async function deleteDropdownOption({ kind, optionId }) {
  mockStore.dropdowns[kind] = list(kind).filter(item => item.id !== optionId);
  return delay({ success: true });
}
