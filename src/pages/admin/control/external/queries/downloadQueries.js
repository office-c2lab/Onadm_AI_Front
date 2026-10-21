import { useMutation } from '@tanstack/react-query';

const WINDOWS_SETUP_ZIP_FILENAME = 'ondam-ai-windows-setup.zip';
const WINDOWS_SETUP_MSI_FILENAME = 'OndamAIClient.msi';
const MACOS_SETUP_ZIP_FILENAME = 'ondam-ai-macos-setup.zip';

function createLocalPackage(filename) {
  return Promise.resolve(
    new Blob([`ONDAM AI local package: ${filename}\n`], { type: 'application/octet-stream' })
  );
}

const downloadWindowsSetupZip = () => createLocalPackage(WINDOWS_SETUP_ZIP_FILENAME);
const downloadWindowsSetupMsi = () => createLocalPackage(WINDOWS_SETUP_MSI_FILENAME);
const downloadMacosSetupZip = () => createLocalPackage(MACOS_SETUP_ZIP_FILENAME);

function saveBlob(blob, filename) {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export function useWindowsSetupDownloadMutation() {
  return useMutation({
    mutationFn: downloadWindowsSetupZip,
    onSuccess: blob => saveBlob(blob, WINDOWS_SETUP_ZIP_FILENAME),
  });
}

export function useWindowsSetupMsiDownloadMutation() {
  return useMutation({
    mutationFn: downloadWindowsSetupMsi,
    onSuccess: blob => saveBlob(blob, WINDOWS_SETUP_MSI_FILENAME),
  });
}

export function useMacosSetupDownloadMutation() {
  return useMutation({
    mutationFn: downloadMacosSetupZip,
    onSuccess: blob => saveBlob(blob, MACOS_SETUP_ZIP_FILENAME),
  });
}
