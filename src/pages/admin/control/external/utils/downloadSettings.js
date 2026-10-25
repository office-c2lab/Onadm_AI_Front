export const DEFAULT_DOWNLOAD_PATH = '/download';

export const reservedDownloadPaths = [
  '/',
  '/dashboard',
  '/monitoring',
  '/users',
  '/policies',
  '/domains',
  '/support',
];

export function normalizeDownloadPath(path = '') {
  const trimmedPath = path.trim();
  if (!trimmedPath) return DEFAULT_DOWNLOAD_PATH;
  const withSlash = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;

  return withSlash.replace(/\/+$/, '') || DEFAULT_DOWNLOAD_PATH;
}

export function normalizeDownloadSettings(settings = {}) {
  return {
    downloadPath: normalizeDownloadPath(settings.download_path),
  };
}
