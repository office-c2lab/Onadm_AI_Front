import { useMutation } from '@tanstack/react-query';
import {
  downloadMacosSetupZip,
  downloadWindowsSetupMsi,
  downloadWindowsSetupZip,
  MACOS_SETUP_ZIP_FILENAME,
  WINDOWS_SETUP_MSI_FILENAME,
  WINDOWS_SETUP_ZIP_FILENAME,
} from '../api/downloads.js';

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

