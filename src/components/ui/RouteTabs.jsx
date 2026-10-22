import { NavLink } from 'react-router-dom';

export default function RouteTabs({ tabs, ariaLabel, className = '', end = false }) {
  return (
    <nav className={className} aria-label={ariaLabel}>
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={end}
          className={({ isActive }) =>
            `shrink-0 rounded-full px-4 py-1 text-sm transition-colors ${isActive ? 'bg-tab-active font-medium text-palette-neutral-27' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
