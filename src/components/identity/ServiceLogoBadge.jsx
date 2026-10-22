import { getServiceLogo } from './serviceLogos.js';

export default function ServiceLogoBadge({
  name,
  className = '',
  iconClassName = '',
  iconStyle = undefined,
  variant = 'card',
}) {
  const serviceLogo = getServiceLogo(name);
  const label = name.trim().charAt(0).toUpperCase() || '?';
  const isCompact = variant === 'compact';

  if (!serviceLogo) {
    return (
      <div
        className={`flex items-center justify-center ${
          isCompact
            ? 'h-[var(--app-control-xs)] w-[var(--app-control-xs)] rounded-[var(--app-radius-md)] border border-palette-blue-41 bg-[linear-gradient(135deg,var(--color-palette-blue-17),var(--color-palette-blue-36))] text-fluid-31 font-black text-palette-blue-100 shadow-service-logo'
            : 'h-[var(--app-control-md)] w-[var(--app-control-md)] rounded-[var(--app-radius-lg)] border border-palette-blue-41 bg-[linear-gradient(135deg,var(--color-palette-blue-17),var(--color-palette-blue-36))] text-control font-black text-palette-blue-100 shadow-service-logo'
        } ${className}`.trim()}
      >
        {label}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${
        isCompact
          ? 'h-[var(--app-control-xs)] w-[var(--app-control-xs)] rounded-[var(--app-radius-md)] border border-palette-blue-41 bg-white shadow-service-logo'
          : 'h-[var(--app-control-md)] w-[var(--app-control-md)] rounded-[var(--app-radius-lg)] border border-palette-blue-41 bg-white shadow-service-logo'
      } ${className}`.trim()}
    >
      <img
        src={serviceLogo}
        alt={`${name} logo`}
        className={`${isCompact ? 'h-[var(--app-icon-md)] w-[var(--app-icon-md)]' : 'h-[var(--app-icon-lg)] w-[var(--app-icon-lg)]'} object-contain ${iconClassName}`.trim()}
        style={iconStyle}
        loading="lazy"
      />
    </div>
  );
}
