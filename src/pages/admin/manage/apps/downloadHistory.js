const downloaders = [
  {
    userId: 'U-1042',
    name: '김민서',
    department: '전략기획팀',
    position: '과장',
    email: 'minseo.kim@ondam.ai',
  },
  {
    userId: 'U-0871',
    name: '박준호',
    department: '경영지원팀',
    position: '대리',
    email: 'junho.park@ondam.ai',
  },
  {
    userId: 'U-1128',
    name: '이서윤',
    department: '고객경험팀',
    position: '매니저',
    email: 'seoyun.lee@ondam.ai',
  },
  {
    userId: 'U-0644',
    name: '최도윤',
    department: '플랫폼개발팀',
    position: '선임',
    email: 'doyun.choi@ondam.ai',
  },
  {
    userId: 'U-0915',
    name: '정하늘',
    department: '정보보호팀',
    position: '책임',
    email: 'haneul.jeong@ondam.ai',
  },
  {
    userId: 'U-1203',
    name: '윤지우',
    department: '데이터팀',
    position: '데이터 분석가',
    email: 'jiwoo.yoon@ondam.ai',
  },
  {
    userId: 'U-0759',
    name: '한예린',
    department: '재무팀',
    position: '대리',
    email: 'yerin.han@ondam.ai',
  },
  {
    userId: 'U-1097',
    name: '오현우',
    department: '인사총무팀',
    position: '주임',
    email: 'hyunwoo.oh@ondam.ai',
  },
];

const downloadedAt = [
  '2026.10.30 09:42',
  '2026.10.29 16:18',
  '2026.10.29 11:05',
  '2026.10.28 15:31',
  '2026.10.28 09:14',
  '2026.10.27 17:46',
  '2026.10.27 10:22',
  '2026.10.24 14:08',
  '2026.10.23 16:55',
  '2026.10.22 13:27',
  '2026.10.21 10:03',
  '2026.10.20 08:51',
];

function formatDownloadedAt(index) {
  if (downloadedAt[index]) return downloadedAt[index];

  const firstGeneratedTime = Date.UTC(2026, 9, 19, 18, 51);
  const generatedTime = firstGeneratedTime - (index - downloadedAt.length) * 5 * 60 * 60 * 1000;
  const koreaTime = new Date(generatedTime + 9 * 60 * 60 * 1000);
  const pad = value => String(value).padStart(2, '0');

  return `${koreaTime.getUTCFullYear()}.${pad(koreaTime.getUTCMonth() + 1)}.${pad(koreaTime.getUTCDate())} ${pad(koreaTime.getUTCHours())}:${pad(koreaTime.getUTCMinutes())}`;
}

function getRotation(value) {
  return (
    [...value].reduce((sum, character) => sum + character.charCodeAt(0), 0) % downloaders.length
  );
}

export function getAppDownloadCount(app) {
  return app?.downloadCount ?? app?.users ?? 0;
}

export function getAppDownloadHistory(app) {
  const total = getAppDownloadCount(app);
  if (!app || total <= 0) return [];

  const rotation = getRotation(app.id);
  const versions = app.versionHistory?.map(item => item.version) ?? [app.version];
  const recordCount = total;

  return Array.from({ length: recordCount }, (_, index) => ({
    id: `${app.id}-download-${index + 1}`,
    ...downloaders[(rotation + index) % downloaders.length],
    version: versions[index < 7 ? 0 : Math.min(1, versions.length - 1)] ?? app.version,
    downloadedAt: formatDownloadedAt(index),
  }));
}
