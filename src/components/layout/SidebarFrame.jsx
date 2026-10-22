export default function SidebarFrame({ open, children, variant = 'default', className = '' }) {
  return (
    <div className={`ui-sidebar-frame ${className}`} data-open={open} data-variant={variant}>
      {children}
    </div>
  );
}
