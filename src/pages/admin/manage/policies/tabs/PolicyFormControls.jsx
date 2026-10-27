import { Check } from 'lucide-react';
import CustomDropdown from '../../../../../components/dropdown/CustomDropdown.jsx';
import { AdminDetailSection } from '../../../../../layouts/admin/AdminDetailLayout.jsx';
import AppToggle from '../../../control/external/components/AppToggle.jsx';

export const panelClass = 'w-full [&>section:first-child]:border-t-0 [&>section:first-child]:pt-7';

export function Card({ title, description, action, children }) {
  return (
    <AdminDetailSection
      title={title}
      description={description}
      action={action}
      contentClassName="mt-6 max-w-3xl"
    >
      {children}
    </AdminDetailSection>
  );
}

export function CircleControl({ checked, onChange, ariaLabel }) {
  return <AppToggle checked={checked} onChange={onChange} ariaLabel={ariaLabel} />;
}

export function ToggleRow({ title, helper, checked, onChange, suffix }) {
  return (
    <div className="flex items-center justify-between gap-6 py-5">
      <div>
        <p className="text-base font-semibold leading-6 text-slate-900">{title}</p>
        {helper ? <p className="mt-1 text-sm leading-6 text-slate-500">{helper}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <CircleControl checked={checked} onChange={onChange} ariaLabel={title} />
        {suffix ? <span className="text-sm font-medium text-slate-700">{suffix}</span> : null}
      </div>
    </div>
  );
}

export function RadioChoice({ name, value, checked, onChange, children }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-[15px] font-medium text-slate-800">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="size-4 accent-blue-600"
      />
      {children}
    </label>
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block max-w-2xl">
      {label ? (
        <span className="mb-2 block text-base font-semibold text-slate-700">{label}</span>
      ) : null}
      <CustomDropdown
        value={value}
        options={options}
        onChange={onChange}
        ariaLabel={label || '옵션 선택'}
        className="[&>button]:h-11 [&>button]:min-h-0 [&>button]:rounded-lg"
      />
    </label>
  );
}

export function ChecklistBox({ items }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
      {items.map(item => (
        <p key={item} className="flex gap-2.5 py-1.5 text-[15px] text-slate-800">
          <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-emerald-600" />
          {item}
        </p>
      ))}
    </div>
  );
}
