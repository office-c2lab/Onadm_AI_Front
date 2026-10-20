
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// 캐릭터
import GamgikModalDemo from '../components/character/GamgikModalDemo.jsx';

// 레이아웃
import AiStoreLayout from '../layouts/AiStoreLayout.jsx';
import LibraryLayout from '../layouts/LibraryLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';

// ================================
// 사용자 AI Store
// ================================
import StorePage from '../pages/user/aistore/store/StorePage.jsx';
import MyToolsPage from '../pages/user/aistore/mytools/MyToolsPage.jsx';
import RegisterPage from '../pages/user/aistore/register/RegisterPage.jsx';
import GuidePage from '../pages/user/aistore/guide/GuidePage.jsx';
import FavoritesPage from '../pages/user/aistore/library/favorites/FavoritesPage.jsx';
import DownloadsPage from '../pages/user/aistore/library/downloads/DownloadsPage.jsx';

// ================================
// 관리자 - Dashboard
// ================================
import DashboardPage from '../pages/admin/dashboard/DashboardPage.jsx';

// ================================
// 관리자 - Discover
// ================================
import SearchPage from '../pages/admin/discover/search/SearchPage.jsx';
import UrlAnalysisPage from '../pages/admin/discover/url-analysis/UrlAnalysisPage.jsx';
import IntelligencePage from '../pages/admin/discover/intelligence/IntelligencePage.jsx';

// ================================
// 관리자 - Control
// ================================
import UsagePage from '../pages/admin/control/usage/UsagePage.jsx';
import ModelsPage from '../pages/admin/control/models/ModelsPage.jsx';
import ClassificationPage from '../pages/admin/control/classification/ClassificationPage.jsx';
import ControlPoliciesPage from '../pages/admin/control/policies/PoliciesPage.jsx';
import LimitsPage from '../pages/admin/control/limits/LimitsPage.jsx';
import HistoryPage from '../pages/admin/control/history/HistoryPage.jsx';
import ExternalPage from '../pages/admin/control/external/ExternalPage.jsx';

// ================================
// 관리자 - Manage
// ================================
import AppsPage from '../pages/admin/manage/apps/AppsPage.jsx';
import SecurityPage from '../pages/admin/manage/security/SecurityPage.jsx';
import ApprovalsPage from '../pages/admin/manage/approvals/ApprovalsPage.jsx';
import CatalogPage from '../pages/admin/manage/catalog/CatalogPage.jsx';
import ManagePoliciesPage from '../pages/admin/manage/policies/PoliciesPage.jsx';

// ================================
// 관리자 - 사용자 및 권한
// ================================
import UsersPage from '../pages/admin/users/users/UsersPage.jsx';
import DepartmentsPage from '../pages/admin/users/departments/DepartmentsPage.jsx';
import RolesPage from '../pages/admin/users/roles/RolesPage.jsx';

// ================================
// 관리자 - 시스템 운영
// ================================
import ModulesPage from '../pages/admin/system/modules/ModulesPage.jsx';
import JobsPage from '../pages/admin/system/jobs/JobsPage.jsx';
import AuditPage from '../pages/admin/system/audit/AuditPage.jsx';
import SettingsPage from '../pages/admin/system/settings/SettingsPage.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 경로 */}
        <Route
          path="/"
          element={<Navigate to="/user/aistore/store" replace />}
        />

        {/* 캐릭터 */}
        <Route path="/character" element={<GamgikModalDemo />} />

        {/* ===================================== */}
        {/* 사용자 AI Store */}
        {/* ===================================== */}
        <Route path="/user/aistore" element={<AiStoreLayout />}>
          <Route
            index
            element={<Navigate to="/user/aistore/store" replace />}
          />

          <Route path="store" element={<StorePage />} />
          <Route path="mytools" element={<MyToolsPage />} />

          {/* 라이브러리 */}
          <Route path="library" element={<LibraryLayout />}>
            <Route
              index
              element={<Navigate to="downloads" replace />}
            />
            <Route path="downloads" element={<DownloadsPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
          </Route>

          {/* 이전 경로 호환 */}
          <Route
            path="downloads"
            element={
              <Navigate
                to="/user/aistore/library/downloads"
                replace
              />
            }
          />

          <Route
            path="favorites"
            element={
              <Navigate
                to="/user/aistore/library/favorites"
                replace
              />
            }
          />

          <Route path="register" element={<RegisterPage />} />
          <Route path="guide" element={<GuidePage />} />
        </Route>

        {/* ===================================== */}
        {/* 관리자 */}
        {/* ===================================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<DashboardPage />}
          />

          {/* Discover */}
          <Route path="discover">
            <Route
              index
              element={<Navigate to="search" replace />}
            />
            <Route
              path="search"
              element={<SearchPage />}
            />
            <Route
              path="url-analysis"
              element={<UrlAnalysisPage />}
            />
            <Route
              path="intelligence"
              element={<IntelligencePage />}
            />
          </Route>

          {/* Control */}
          <Route path="control">
            <Route
              index
              element={<Navigate to="usage" replace />}
            />
            <Route
              path="usage"
              element={<UsagePage />}
            />
            <Route
              path="models"
              element={<ModelsPage />}
            />
            <Route
              path="classification"
              element={<ClassificationPage />}
            />
            <Route
              path="policies"
              element={<ControlPoliciesPage />}
            />
            <Route
              path="limits"
              element={<LimitsPage />}
            />
            <Route
              path="history"
              element={<HistoryPage />}
            />
            <Route
              path="external"
              element={<ExternalPage />}
            />
          </Route>

          {/* Manage */}
          <Route path="manage">
            <Route
              index
              element={<Navigate to="apps" replace />}
            />
            <Route
              path="apps"
              element={<AppsPage />}
            />
            <Route
              path="security"
              element={<SecurityPage />}
            />
            <Route
              path="approvals"
              element={<ApprovalsPage />}
            />
            <Route
              path="catalog"
              element={<CatalogPage />}
            />
            <Route
              path="policies"
              element={<ManagePoliciesPage />}
            />
          </Route>

          {/* 사용자 및 권한 */}
          <Route
            path="users"
            element={<UsersPage />}
          />
          <Route
            path="departments"
            element={<DepartmentsPage />}
          />
          <Route
            path="roles"
            element={<RolesPage />}
          />

          {/* 시스템 운영 */}
          <Route path="system">
            <Route
              index
              element={<Navigate to="modules" replace />}
            />
            <Route
              path="modules"
              element={<ModulesPage />}
            />
            <Route
              path="jobs"
              element={<JobsPage />}
            />
            <Route
              path="audit"
              element={<AuditPage />}
            />
            <Route
              path="settings"
              element={<SettingsPage />}
            />
          </Route>

          {/* 존재하지 않는 관리자 경로 */}
          <Route
            path="*"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
