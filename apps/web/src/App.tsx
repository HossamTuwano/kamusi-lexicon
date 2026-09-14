import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { SearchProvider } from './lib/search';
import { Shell } from './components/Shell';
import { HomePage } from './pages/HomePage';
import { EntryPage } from './pages/EntryPage';
import { AuthPage } from './pages/AuthPage';
import { ContributePage } from './pages/ContributePage';
import { MyContributionsPage } from './pages/MyContributionsPage';
import { AboutPage } from './pages/AboutPage';

export function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<HomePage />} />
              <Route path="entries/:id" element={<EntryPage />} />
              <Route path="auth" element={<AuthPage />} />
              <Route path="contribute" element={<ContributePage />} />
              <Route path="my-contributions" element={<MyContributionsPage />} />
              <Route path="kuhusu" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </AuthProvider>
  );
}
