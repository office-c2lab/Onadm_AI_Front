export const defaultCompanyTemplate = {
  logoPath: '',
  logoSrc: '/logo.png',
  companyName: 'ONDAM AI',
  companyDescription: 'ONDAM AI는 안전하고 효율적인 IT 환경을 제공하는 기술 기업입니다.',
  adminEmail: 'support@ondam.ai',
  adminPhone: '02-1234-5678',
};

function resolveLogoSrc(logoPath) {
  if (!logoPath) return defaultCompanyTemplate.logoSrc;
  if (/^(https?:|data:|blob:)/.test(logoPath)) return logoPath;

  const assetPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;

  return assetPath;
}

export function normalizeTemplateSettings(settings = {}) {
  const logoPath = settings.logo_path ?? '';

  return {
    logoPath,
    logoSrc: resolveLogoSrc(logoPath),
    logoFile: null,
    companyName: settings.company_name ?? defaultCompanyTemplate.companyName,
    companyDescription: settings.company_description ?? defaultCompanyTemplate.companyDescription,
    adminEmail: settings.support_email ?? defaultCompanyTemplate.adminEmail,
    adminPhone: settings.support_phone ?? defaultCompanyTemplate.adminPhone,
  };
}

export function createTemplateSettingsPayload(template) {
  return {
    company_name: template.companyName,
    company_description: template.companyDescription,
    support_email: template.adminEmail,
    support_phone: template.adminPhone,
    logo_file: template.logoFile,
  };
}
