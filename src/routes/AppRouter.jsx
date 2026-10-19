import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import GamgikModalDemo from '../components/character/GamgikModalDemo.jsx';
import AiStoreLayout from '../layouts/AiStoreLayout.jsx';
import LibraryLayout from '../layouts/LibraryLayout.jsx';

import StorePage from '../pages/user/aistore/store/StorePage.jsx';
import MyToolsPage from '../pages/user/aistore/mytools/MyToolsPage.jsx';
import RegisterPage from '../pages/user/aistore/register/RegisterPage.jsx';
import GuidePage from '../pages/user/aistore/guide/GuidePage.jsx';
import FavoritesPage from '../pages/user/aistore/library/favorites/FavoritesPage.jsx';
import DownloadsPage from '../pages/user/aistore/library/downloads/DownloadsPage.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 경로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/user/aistore/store" replace />} />

        {/* 캐릭터 */}
        <Route path="/character" element={<GamgikModalDemo />} />

        {/* 사용자 AI-STORE */}
        <Route path="/user/aistore" element={<AiStoreLayout />}>
          <Route index element={<Navigate to="/user/aistore/store" replace />} />
          <Route path="store" element={<StorePage />} />
          <Route path="mytools" element={<MyToolsPage />} />
          <Route path="library" element={<LibraryLayout />}>
            <Route index element={<Navigate to="downloads" replace />} />
            <Route path="downloads" element={<DownloadsPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
          </Route>
          <Route
            path="downloads"
            element={<Navigate to="/user/aistore/library/downloads" replace />}
          />
          <Route
            path="favorites"
            element={<Navigate to="/user/aistore/library/favorites" replace />}
          />
          <Route path="register" element={<RegisterPage />} />
          <Route path="guide" element={<GuidePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
