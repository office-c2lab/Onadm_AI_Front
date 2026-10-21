import { useMutation, useQuery } from '@tanstack/react-query';
import { exportMonitoringEvents, getMonitoringEvents } from '../api/monitoring.js';

export const MONITORING_EVENTS_LIMIT = 1000;
export const MONITORING_EVENTS_REFETCH_INTERVAL = 5000;

export const monitoringQueryKeys = {
  all: ['monitoring'],
  events: params => [...monitoringQueryKeys.all, 'events', params],
};

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

