import { DropdownSettingsContent } from '../../control/external/components/settings/SettingsContent.jsx';
import '../../control/external/garim.css';

export default function DepartmentsPage() {
  return (
    <div className="garim-external-root w-full !bg-transparent" style={{ fontSize: '16px' }}>
      <div className="flex flex-col gap-5">
        <DropdownSettingsContent />
      </div>
    </div>
  );
}
