import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// 캐릭터
import GamgikModalDemo from '../components/character/GamgikModalDemo.jsx';

// 레이아웃
import AiStoreLayout from '../layouts/AiStoreLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import AdminDetailLayout from '../layouts/admin/AdminDetailLayout.jsx';
import UserDetailLayout from '../layouts/user/UserDetailLayout.jsx';

// ================================
// 사용자 AI Store
// ================================
import StorePage from '../pages/user/aistore/store/StorePage.jsx';
import StoreDetailPage from '../pages/user/aistore/store/StoreDetailPage.jsx';
import MyToolsPage from '../pages/user/aistore/mytools/MyToolsPage.jsx';
import MyToolDetailPage from '../pages/user/aistore/mytools/MyToolDetailPage.jsx';
import MyToolUpdatePage from '../pages/user/aistore/mytools/MyToolUpdatePage.jsx';
import RegisterPage from '../pages/user/aistore/register/RegisterPage.jsx';
import NewToolRegistrationPage from '../pages/user/aistore/register/NewToolRegistrationPage.jsx';
import GuidePage from '../pages/user/aistore/guide/GuidePage.jsx';
import UserNoticesPage from '../pages/user/aistore/notices/NoticesPage.jsx';
import DownloadsPage from '../pages/user/aistore/library/downloads/DownloadsPage.jsx';
import OndamPage from '../pages/user/ondam/OndamPage.jsx';

// ================================
// 관리자 - Dashboard
// ================================
import DashboardPage from '../pages/admin/dashboard/DashboardPage.jsx';

// ================================
// 관리자 - Discover
// ================================
import UrlAnalysisPage from '../pages/admin/discover/url-analysis/UrlAnalysisPage.jsx';
import IntelligencePage from '../pages/admin/discover/intelligence/IntelligencePage.jsx';

// ================================
// 관리자 - Control
// ================================
import UsagePage from '../pages/admin/control/internal/usage/UsagePage.jsx';
import ModelsPage from '../pages/admin/control/internal/models/ModelsPage.jsx';
import ClassificationPage from '../pages/admin/control/internal/classification/ClassificationPage.jsx';
import ControlPoliciesPage from '../pages/admin/control/internal/policies/PoliciesPage.jsx';
import LimitsPage, {
  CreditHistoryPage,
} from '../pages/admin/control/internal/limits/LimitsPage.jsx';
import HistoryPage from '../pages/admin/control/internal/history/HistoryPage.jsx';
import InternalControlLayout from '../pages/admin/control/layout/InternalControlLayout.jsx';
import ExternalControlLayout from '../pages/admin/control/external/layout/ExternalControlLayout.jsx';
import DownloadRoute from '../pages/admin/control/external/download/DownloadRoute.jsx';
import ExternalDashboardPage from '../pages/admin/control/external/dashboard/DashboardPage.jsx';
import ExternalMonitoringPage from '../pages/admin/control/external/monitoring/MonitoringPage.jsx';
import ExternalUsersPage from '../pages/admin/control/external/users/UsersPage.jsx';
import ExternalPoliciesPage from '../pages/admin/control/external/policies/PoliciesPage.jsx';
import ExternalDomainsPage from '../pages/admin/control/external/domains/DomainsPage.jsx';
import ExternalSupportPage from '../pages/admin/control/external/support/SupportPage.jsx';

// ================================
// 관리자 - Manage
// ================================
import AppsPage from '../pages/admin/manage/apps/AppsPage.jsx';
import AppsDetailPage from '../pages/admin/manage/apps/AppsDetailPage.jsx';
import SecurityPage from '../pages/admin/manage/security/SecurityPage.jsx';
import SecurityDetailPage from '../pages/admin/manage/security/SecurityDetailPage.jsx';
import ApprovalsPage from '../pages/admin/manage/approvals/ApprovalsPage.jsx';
import CatalogPage from '../pages/admin/manage/catalog/CatalogPage.jsx';
import CatalogDetailPage from '../pages/admin/manage/catalog/CatalogDetailPage.jsx';
import BannerDetailPage from '../pages/admin/manage/catalog/BannerDetailPage.jsx';
import CategoryDetailPage from '../pages/admin/manage/catalog/CategoryDetailPage.jsx';
import ManagePoliciesPage from '../pages/admin/manage/policies/PoliciesPage.jsx';

// ================================
// 관리자 - 사용자 및 권한
// ================================
import UsersPage from '../pages/admin/users/users/UsersPage.jsx';
import DepartmentsPage from '../pages/admin/users/departments/DepartmentsPage.jsx';

// ================================
// 관리자 - 시스템 운영
// ================================
import AuditPage from '../pages/admin/system/audit/AuditPage.jsx';
import SettingsPage from '../pages/admin/system/settings/SettingsPage.jsx';
import OperationsPage from '../pages/admin/system/operations/OperationsPage.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 경로 */}
        <Route path="/" element={<Navigate to="/user/aistore/store" replace />} />

        {/* 캐릭터 */}
        <Route path="/character" element={<GamgikModalDemo />} />

        {/* 외부 AI 보안 설정 패키지 다운로드 */}
        <Route path="/download" element={<DownloadRoute />} />

        {/* 사용자 AI 채팅 */}
        <Route path="/user/ondam" element={<OndamPage />} />

        {/* ===================================== */}
        {/* 사용자 AI Store */}
        {/* ===================================== */}
        <Route path="/user/aistore" element={<AiStoreLayout />}>
          <Route index element={<Navigate to="/user/aistore/store" replace />} />

          <Route path="store" element={<StorePage />} />
          <Route path="mytools" element={<MyToolsPage />} />

          <Route element={<UserDetailLayout />}>
            <Route path="store/:toolId" element={<StoreDetailPage />} />
            <Route path="mytools/:toolId" element={<MyToolDetailPage />} />
            <Route path="mytools/:toolId/edit" element={<MyToolUpdatePage />} />
            <Route path="register/new" element={<NewToolRegistrationPage />} />
          </Route>

          {/* 라이브러리 */}
          <Route path="library">
            <Route index element={<DownloadsPage />} />
            <Route path="downloads" element={<Navigate to="/user/aistore/library" replace />} />
            <Route path="favorites" element={<Navigate to="/user/aistore/library" replace />} />
          </Route>

          {/* 이전 경로 호환 */}
          <Route path="downloads" element={<Navigate to="/user/aistore/library" replace />} />

          <Route path="favorites" element={<Navigate to="/user/aistore/library" replace />} />

          <Route path="register" element={<RegisterPage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="notices" element={<UserNoticesPage />} />
        </Route>

        {/* ===================================== */}
        {/* 관리자 */}
        {/* ===================================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Discover */}
          <Route path="discover">
            <Route index element={<Navigate to="search" replace />} />
            <Route path="url-analysis" element={<UrlAnalysisPage />} />
            <Route path="intelligence" element={<IntelligencePage />} />
          </Route>

          {/* Control */}
          <Route path="control">
            <Route index element={<Navigate to="internal/usage" replace />} />
            <Route path="internal/classification" element={<ClassificationPage />} />
            <Route path="internal/policies" element={<ControlPoliciesPage />} />
            <Route path="internal" element={<InternalControlLayout />}>
              <Route index element={<Navigate to="usage" replace />} />
              <Route path="usage" element={<UsagePage />} />
              <Route path="models" element={<ModelsPage key="internal-models" />} />
              <Route
                path="prompts"
                element={<ModelsPage key="internal-prompts" initialTab="prompts" />}
              />
              <Route path="limits" element={<LimitsPage />} />
              <Route path="credit-history" element={<CreditHistoryPage />} />
              <Route path="history" element={<HistoryPage />} />
            </Route>

            {/* 이전 내부 AI 경로 호환 */}
            <Route path="usage" element={<Navigate to="/admin/control/internal/usage" replace />} />
            <Route
              path="models"
              element={<Navigate to="/admin/control/internal/models" replace />}
            />
            <Route
              path="classification"
              element={<Navigate to="/admin/control/internal/classification" replace />}
            />
            <Route
              path="policies"
              element={<Navigate to="/admin/control/internal/policies" replace />}
            />
            <Route
              path="limits"
              element={<Navigate to="/admin/control/internal/limits" replace />}
            />
            <Route
              path="history"
              element={<Navigate to="/admin/control/internal/history" replace />}
            />
            <Route path="external" element={<ExternalControlLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ExternalDashboardPage />} />
              <Route path="monitoring" element={<ExternalMonitoringPage />} />
              <Route path="users" element={<ExternalUsersPage />} />
              <Route path="policies" element={<ExternalPoliciesPage />} />
              <Route path="domains" element={<ExternalDomainsPage />} />
              <Route path="support" element={<ExternalSupportPage />} />
            </Route>
          </Route>

          {/* Manage */}
          <Route path="manage">
            <Route index element={<Navigate to="apps" replace />} />
            <Route path="overview" element={<Navigate to="/admin/manage/apps" replace />} />
            <Route path="apps" element={<AppsPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="catalog/category/:categoryId" element={<CategoryDetailPage />} />

            <Route element={<AdminDetailLayout />}>
              <Route path="apps/:appId" element={<AppsDetailPage />} />
              <Route path="security/:reviewId" element={<SecurityDetailPage />} />
              <Route path="catalog/banner/:bannerId" element={<BannerDetailPage />} />
              <Route path="catalog/:sectionId" element={<CatalogDetailPage />} />
              <Route path="policies" element={<ManagePoliciesPage />} />
            </Route>
          </Route>

          {/* 사용자 및 권한 */}
          <Route path="users" element={<UsersPage />} />
          <Route path="departments" element={<DepartmentsPage />} />

          {/* 시스템 운영 */}
          <Route path="system">
            <Route index element={<Navigate to="settings" replace />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="operations" element={<OperationsPage />} />
            <Route
              path="environment"
              element={<Navigate to="/admin/system/operations" replace />}
            />
            <Route path="audit" element={<AuditPage />} />
            <Route path="notices" element={<Navigate to="/admin/system/operations" replace />} />
            <Route path="modules" element={<Navigate to="/admin/system/settings" replace />} />
            <Route path="jobs" element={<Navigate to="/admin/system/settings" replace />} />
          </Route>

          {/* 존재하지 않는 관리자 경로 */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
