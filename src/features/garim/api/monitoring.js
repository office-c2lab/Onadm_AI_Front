import { delay, mockStore } from './mockStore.js';
export function getMonitoringEvents({ status = 'all', q = '' } = {}) {
  const query = q.trim().toLowerCase();
  const events = mockStore.events.filter(event => {
    const statusMatches =
      status === 'all' || (status === 'normal' ? ['정상', '허용'].includes(event.status) : event.status === '차단');
    return statusMatches && (!query || JSON.stringify(event).toLowerCase().includes(query));
  });
  return delay({ events, total: events.length });
}
export async function exportMonitoringEvents({ ids = [] }) {
  const events = ids.length
    ? mockStore.events.filter(event => ids.includes(event.id))
    : mockStore.events;
  const csvText = [
    'ID,시간,서비스,사용자,상태',
    ...events.map(event =>
      [event.id, event.time_kst, event.service, event.user_name, event.status === '허용' ? '정상' : event.status].join(',')
    ),
  ].join('\n');
  return { csvText, filename: 'ondam-ai-monitoring-mock.csv' };
}
