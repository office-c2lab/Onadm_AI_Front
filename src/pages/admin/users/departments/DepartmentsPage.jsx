import { DropdownSettingsContent } from '../../control/external/components/settings/SettingsContent.jsx';

export default function DepartmentsPage() {
  return (
    <div
      className="app-control-scope w-full !bg-transparent"
      style={{ fontSize: 'var(--text-body-md)' }}
    >
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
