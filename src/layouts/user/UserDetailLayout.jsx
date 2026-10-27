import { Outlet } from 'react-router-dom';
import DetailSection from '../shared/DetailSection.jsx';

export default function UserDetailLayout() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-14 pt-6 text-slate-900">
      <Outlet />
    </div>
  );
}

export const UserDetailSection = DetailSection;
