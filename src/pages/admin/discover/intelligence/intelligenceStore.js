const STORAGE_KEY = 'ondam-intelligence-services-v1';
const REMOVED_KEY = 'ondam-intelligence-removed-services-v1';

function readSavedServices() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function loadIntelligenceServices(defaultServices = []) {
  let removedIds = [];
  if (typeof window !== 'undefined') {
    try {
      const saved = JSON.parse(window.localStorage.getItem(REMOVED_KEY) ?? '[]');
      removedIds = Array.isArray(saved) ? saved : [];
    } catch {
      removedIds = [];
    }
  }
  const seenDomains = new Set();
  return [...readSavedServices(), ...defaultServices].filter(service => {
    const domainKey = service.domain?.toLowerCase();
    if (
      service.ai !== 'AI 서비스' ||
      removedIds.includes(service.id) ||
      !domainKey ||
      seenDomains.has(domainKey)
    ) {
      return false;
    }
    seenDomains.add(domainKey);
    return true;
  });
}

export function saveIntelligenceService(service) {
  if (typeof window === 'undefined') return;
  const services = readSavedServices();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([service, ...services.filter(item => item.id !== service.id)])
  );
  try {
    const removed = JSON.parse(window.localStorage.getItem(REMOVED_KEY) ?? '[]');
    window.localStorage.setItem(
      REMOVED_KEY,
      JSON.stringify((Array.isArray(removed) ? removed : []).filter(id => id !== service.id))
    );
  } catch {
    window.localStorage.setItem(REMOVED_KEY, '[]');
  }
}

export function deleteIntelligenceService(serviceId) {
  if (typeof window === 'undefined') return;
  const services = readSavedServices().filter(service => service.id !== serviceId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  let removed;
  try {
    const saved = JSON.parse(window.localStorage.getItem(REMOVED_KEY) ?? '[]');
    removed = Array.isArray(saved) ? saved : [];
  } catch {
    removed = [];
  }
  window.localStorage.setItem(REMOVED_KEY, JSON.stringify([...new Set([serviceId, ...removed])]));
}

export function saveAnalysisToIntelligence(analysis, defaultServices = []) {
  if (analysis.ai !== 'AI 서비스') return;
  const existing = loadIntelligenceServices(defaultServices).find(
    service => service.domain.toLowerCase() === analysis.domain.toLowerCase()
  );
  saveIntelligenceService({
    ...existing,
    id: existing?.id ?? `intel-${analysis.domain.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    analysisId: analysis.id,
    domain: analysis.domain,
    url: analysis.url,
    ips: analysis.ips ?? [],
    ai: analysis.ai,
    type: analysis.kind,
    status: existing?.status ?? '결정 대기',
    risk: existing?.risk ?? '미확인',
    confidence: analysis.confidence,
    lastAnalyzed: analysis.time,
    registeredAt: existing?.registeredAt ?? existing?.lastAnalyzed ?? analysis.time,
    updatedAt: analysis.time,
    sourceAnalysisId: analysis.id,
    summary: `${analysis.domain}의 AI 서비스 분석이 완료되어 운영 정책 결정을 기다리고 있습니다.`,
    risks: existing?.risks ?? [
      '입력 데이터 외부 전송 여부 확인',
      '서비스 이용약관 및 데이터 보관 정책 검토',
    ],
    policyHistory: existing?.policyHistory ?? [],
  });
}
