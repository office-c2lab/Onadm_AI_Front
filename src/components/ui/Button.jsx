export const primaryButtonClassName =
  'app-solid-button inline-flex items-center justify-center gap-[var(--app-gap-xs)] rounded-[var(--app-radius-lg)] border border-brand bg-brand px-[var(--app-pad-md)] text-control font-bold whitespace-nowrap text-white shadow-button-primary transition hover:bg-brand-hover active:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryButtonClassName =
  'inline-flex items-center justify-center rounded-[var(--app-radius-lg)] border border-palette-blue-42 bg-white px-[var(--app-pad-md)] text-control font-semibold whitespace-nowrap text-text-action transition hover:bg-palette-blue-07';

export const dangerButtonClassName =
  'app-solid-button inline-flex items-center justify-center rounded-[var(--app-radius-md)] border border-rose-500 bg-rose-500 px-[var(--app-pad-md)] text-control font-bold whitespace-nowrap text-white shadow-button-danger transition hover:bg-rose-600 active:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60';

const buttonClassNames = {
  primary: primaryButtonClassName,
  secondary: secondaryButtonClassName,
  danger: dangerButtonClassName,
};

export default function AppButton({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const variantClassName = buttonClassNames[variant] ?? primaryButtonClassName;

  return (
    <button type={type} className={`${variantClassName} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
