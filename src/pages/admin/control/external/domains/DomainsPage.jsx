import { useMemo, useState } from 'react';
import AppToggle from '../components/AppToggle.jsx';
import FixedPaginationBar from '../components/FixedPaginationBar.jsx';
import {
  APP_PAGE_HORIZONTAL_PADDING_CLASS,
  APP_PAGE_INNER_WIDTH_CLASS,
  APP_PAGE_OUTER_WIDTH_CLASS,
} from '../constants/contentLayout.js';
import { MonitoringDomainTable } from '../components/monitoring/MonitoringListComponents.jsx';
import ServiceLogoBadge from '../components/ServiceLogoBadge.jsx';
import useAdaptiveRowsPerPage from '../hooks/useAdaptiveRowsPerPage.js';
import { useDomainsQuery, usePatchDomainEnabledMutation } from '../queries/domainQueries.js';

const MAX_ROWS_PER_PAGE = 10;

function getDomainEntries(data) {
  if (Array.isArray(data)) return data.map((value, index) => [value?.service_code ?? index, value]);
  if (Array.isArray(data?.domains)) {
    return data.domains.map((value, index) => [value?.service_code ?? index, value]);
  }
  if (data && typeof data === 'object') return Object.entries(data);

  return [];
}

function normalizeDomain([key, value]) {
  const domain = value && typeof value === 'object' ? value : {};
  const serviceCode = String(
    domain.service_code ?? domain.serviceCode ?? domain.code ?? domain.id ?? key
  );
  const name = String(
    domain.name ?? domain.service_name ?? domain.serviceName ?? domain.title ?? serviceCode
  );
  const url = String(domain.url ?? domain.domain ?? domain.base_url ?? domain.baseUrl ?? '');

  return {
    id: serviceCode,
    serviceCode,
    name,
    url,
    enabled: Boolean(domain.enabled),
  };
}

export default function DomainPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isError, isFetching, isLoading } = useDomainsQuery();
  const {
    mutate: patchDomainEnabled,
    isPending: isSaving,
    variables,
  } = usePatchDomainEnabledMutation();
  const { containerRef: tableAreaRef, rowsPerPage } = useAdaptiveRowsPerPage({
    maxRows: MAX_ROWS_PER_PAGE,
    minRows: 4,
    rowHeight: 64,
  });
  const domains = useMemo(() => getDomainEntries(data).map(normalizeDomain), [data]);
  const totalPages = Math.max(1, Math.ceil(domains.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visibleDomains = domains.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const savingServiceCode = isSaving ? variables?.serviceCode : null;

  const handleToggle = domain => {
    patchDomainEnabled({
      serviceCode: domain.serviceCode,
      enabled: !domain.enabled,
    });
  };

  const statusMessage = isError
    ? '도메인 목록을 불러오지 못했습니다.'
    : isLoading
      ? '도메인 목록을 불러오는 중입니다.'
      : isFetching
        ? '도메인 목록을 갱신하는 중입니다.'
        : !domains.length
          ? '등록된 도메인이 없습니다.'
          : '';

  return (
    <div
      className={`mx-auto flex min-h-full w-full flex-1 ${APP_PAGE_HORIZONTAL_PADDING_CLASS} ${APP_PAGE_OUTER_WIDTH_CLASS}`.trim()}
    >
      <div
        className={`mx-auto flex min-h-full w-full flex-1 flex-col gap-[var(--app-gap-lg)] pt-[var(--app-page-top)] ${APP_PAGE_INNER_WIDTH_CLASS}`.trim()}
      >
        <section
          ref={tableAreaRef}
          className="rounded-[var(--app-radius-xl)] border border-[#E6EAF4] bg-[radial-gradient(circle_at_top,#FFFFFF_0%,#FBFCFF_72%,#F6F8FD_100%)] p-0 shadow-[0_1.5rem_3.75rem_rgba(15,23,42,0.08)]"
        >
          <MonitoringDomainTable
            rows={visibleDomains}
            renderLogo={domain => (
              <ServiceLogoBadge
                name={domain.name}
                url={domain.url}
                className="h-[var(--app-control-md)] w-[var(--app-control-md)] rounded-[var(--app-radius-sm)] !border-[#8BC6FF] bg-[#F7FBFF] shadow-[0_0.625rem_1.5rem_rgba(7, 93, 246,0.08)]"
              />
            )}
            renderToggle={domain => (
              <AppToggle
                checked={domain.enabled}
                disabled={savingServiceCode === domain.serviceCode}
                onChange={() => handleToggle(domain)}
                ariaLabel={`${domain.name} 사용 여부`}
              />
            )}
          />
          {statusMessage ? (
            <div className="border-t border-[#EEF1F6] bg-white px-[var(--app-pad-lg)] py-[var(--app-pad-md)] text-center text-[clamp(0.82rem,0.95vw,0.9rem)] font-semibold text-[#667085]">
              {statusMessage}
            </div>
          ) : null}
        </section>

        {domains.length ? (
          <FixedPaginationBar
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        ) : null}
      </div>
    </div>
  );
}
