import ExternalUsersPage from '../../control/external/users/UsersPage.jsx';
import '../../control/external/garim.css';

export default function UsersPage() {
  return (
    <div className="garim-external-root flex h-dvh min-h-0 flex-col overflow-hidden text-[#111827]">
      <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <ExternalUsersPage />
      </section>
    </div>
  );
}
