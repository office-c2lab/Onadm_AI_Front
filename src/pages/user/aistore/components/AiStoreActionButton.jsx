import { Link } from 'react-router-dom';

const variantClasses = {
  primary:
    'bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-500',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400',
  info: 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400',
  muted: 'bg-slate-100 text-slate-500 disabled:bg-slate-100 disabled:text-slate-500',
};

const sizeClasses = {
  small: 'h-9 gap-1.5 px-3.5',
  medium: 'h-10 gap-2 px-4',
  large: 'h-11 gap-2 px-5',
  compact: 'h-8 gap-1.5 px-3',
};

const iconSizes = { compact: 15, small: 15, medium: 17, large: 17 };

export default function AiStoreActionButton({
  to,
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = `inline-flex shrink-0 appearance-none items-center justify-center rounded-lg transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  const content = (
    <>
      {Icon && <Icon size={iconSizes[size]} aria-hidden="true" />}
      <span className={`${size === 'compact' ? 'text-xs' : 'text-sm'} font-semibold`}>
        {children}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  );
}
