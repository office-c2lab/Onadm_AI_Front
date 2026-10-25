export const primaryButtonClassName =
  'app-solid-button inline-flex items-center justify-center gap-[var(--app-gap-xs)] rounded-[var(--app-radius-lg)] border border-[#075DF6] bg-[#075DF6] px-[var(--app-pad-md)] text-[clamp(0.82rem,0.95vw,0.9rem)] font-bold whitespace-nowrap text-white shadow-[0_0.625rem_1.5rem_rgba(7, 93, 246,0.24)] transition hover:bg-[#063CC8] active:bg-[#063CC8] disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryButtonClassName =
  'inline-flex items-center justify-center rounded-[var(--app-radius-lg)] border border-[#D8DEEA] bg-white px-[var(--app-pad-md)] text-[clamp(0.82rem,0.95vw,0.9rem)] font-semibold whitespace-nowrap text-[#526078] transition hover:bg-[#F7F9FC]';

export const dangerButtonClassName =
  'app-solid-button inline-flex items-center justify-center rounded-[var(--app-radius-md)] border border-[#F43F5E] bg-[#F43F5E] px-[var(--app-pad-md)] text-[clamp(0.82rem,0.95vw,0.9rem)] font-bold whitespace-nowrap text-white shadow-[0_0.625rem_1.375rem_rgba(244,63,94,0.26)] transition hover:bg-[#E11D48] active:bg-[#BE123C] disabled:cursor-not-allowed disabled:opacity-60';

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
