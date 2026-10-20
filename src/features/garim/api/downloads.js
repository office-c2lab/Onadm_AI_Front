export const WINDOWS_SETUP_ZIP_FILENAME = 'ondam-ai-windows-setup.zip';
export const WINDOWS_SETUP_MSI_FILENAME = 'OndamAIClient.msi';
export const MACOS_SETUP_ZIP_FILENAME = 'ondam-ai-macos-setup.zip';

function createMockPackage(filename) {
  return Promise.resolve(
    new Blob(
      [
        `ONDAM AI mock package: ${filename}\n`,
        'API 연동 전 화면 테스트를 위한 목업 다운로드 파일입니다.\n',
      ],
      { type: 'application/octet-stream' }
    )
  );
}

export const downloadWindowsSetupZip = () => createMockPackage(WINDOWS_SETUP_ZIP_FILENAME);
export const downloadWindowsSetupMsi = () => createMockPackage(WINDOWS_SETUP_MSI_FILENAME);
export const downloadMacosSetupZip = () => createMockPackage(MACOS_SETUP_ZIP_FILENAME);
