import { useMutation, useQuery } from '@tanstack/react-query';
import { mockStore } from '../data/mockStore.js';

export const MONITORING_EVENTS_LIMIT = 1000;
export const MONITORING_EVENTS_REFETCH_INTERVAL = 5000;

export const monitoringQueryKeys = {
  all: ['monitoring'],
  events: params => [...monitoringQueryKeys.all, 'events', params],
};

function getMonitoringEvents({ status = 'all', q = '' } = {}) {
  const query = q.trim().toLowerCase();
  const events = mockStore.events.filter(event => {
    const statusMatches =
      status === 'all' ||
      (status === 'normal' ? ['정상', '허용'].includes(event.status) : event.status === '차단');
    return statusMatches && (!query || JSON.stringify(event).toLowerCase().includes(query));
  });
  return Promise.resolve({ events: structuredClone(events), total: events.length });
}

function exportMonitoringEvents({ ids = [] }) {
  const events = ids.length
    ? mockStore.events.filter(event => ids.includes(event.id))
    : mockStore.events;
  const csvText = [
    'ID,시간,서비스,사용자,상태',
    ...events.map(event =>
      [
        event.id,
        event.time_kst,
        event.service,
        event.user_name,
        event.status === '허용' ? '정상' : event.status,
      ].join(',')
    ),
  ].join('\n');
  return Promise.resolve({ csvText, filename: 'ondam-ai-monitoring.csv' });
}

function saveCsv(csvText, filename) {
  const csvContent = typeof csvText === 'string' ? csvText : String(csvText ?? '');
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export function getMonitoringApiStatus(statusFilter) {
  if (statusFilter === 'normal') return 'normal';
  if (statusFilter === 'block') return 'block';

  return 'all';
}

export function useMonitoringEventsQuery({ statusFilter = 'all', q = '' } = {}) {
  const apiStatus = getMonitoringApiStatus(statusFilter);
  const params = {
    limit: MONITORING_EVENTS_LIMIT,
    offset: 0,
    status: apiStatus,
    q,
  };

  return useQuery({
    queryKey: monitoringQueryKeys.events(params),
    queryFn: () => getMonitoringEvents(params),
    refetchInterval: MONITORING_EVENTS_REFETCH_INTERVAL,
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  });
}

export function useMonitoringEventsExportMutation() {
  return useMutation({
    mutationFn: exportMonitoringEvents,
    onSuccess: ({ csvText, filename }) => saveCsv(csvText, filename),
  });
}
