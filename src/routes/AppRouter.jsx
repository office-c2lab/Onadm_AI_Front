import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import GamgikModalDemo from '../components/character/GamgikModalDemo.jsx';
import AiStoreLayout from '../layouts/AiStoreLayout.jsx';
import StorePage from '../pages/user/aistore/store/StorePage.jsx';
import MyToolsPage from '../pages/user/aistore/mytools/MyToolsPage.jsx';
import RegisterPage from '../pages/user/aistore/register/RegisterPage.jsx';
import GuidePage from '../pages/user/aistore/guide/GuidePage.jsx';
import SettingsPage from '../pages/user/aistore/settings/settings.jsx';
import FavoritesPage from '../pages/user/aistore/favorites/FavoritesPage.jsx';


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/character" element={<GamgikModalDemo />} />

        {/* 사용자 AI-STORE */}
        <Route path="/" element={<AiStoreLayout />}>
          <Route index element={<Navigate to="store" replace />} />
          <Route path="store" element={<StorePage />} />
          <Route path="mytools" element={<MyToolsPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        
      </Routes>
    </BrowserRouter>
  );
}
