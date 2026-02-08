import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { ImageDetail } from './pages/ImageDetail';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Upload } from './pages/Upload';
import { Auth } from './pages/Auth';
import { useAppStore } from './store';
import { useEffect } from 'react';

export function App() {
  const theme = useAppStore(state => state.theme);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#0f172a'; // slate-900
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#ffffff';
    }
  }, [theme]);

  return (
    <HashRouter>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/image/:id" element={<ImageDetail />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}