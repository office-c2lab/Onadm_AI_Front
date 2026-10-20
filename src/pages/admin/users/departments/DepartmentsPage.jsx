import { DropdownSettingsContent } from '../../../../features/garim/components/settings/SettingsContent.jsx';
import '../../../../features/garim/garim.css';

export default function DepartmentsPage() {
  return (
    <div className="garim-external-root w-full !bg-transparent" style={{ fontSize: '16px' }}>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">부서 관리</h1>
        <p className="mt-2 text-sm text-slate-500">
          사용자에게 적용할 부서와 직책 항목을 등록하고 관리합니다.
        </p>
      </header>
      <div className="flex flex-col gap-5">
        <DropdownSettingsContent />
      </div>
    </div>
  );
}
