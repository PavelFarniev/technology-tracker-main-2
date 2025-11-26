import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home.jsx';
import TechnologyListPage from './pages/TechnologyList.jsx';
import TechnologyDetail from './pages/TechnologyDetail.jsx';
import AddTechnology from './pages/AddTechnology.jsx';
import Statistics from './pages/Statistics.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import RoadmapImport from './pages/RoadmapImport.jsx';
import StudyPlan from './pages/StudyPlan.jsx';

function App() {
  const location = useLocation();
  const [reloadNoticePath, setReloadNoticePath] = useState(null);

  useEffect(() => {
    const navEntries = performance.getEntriesByType?.('navigation') || [];
    const navigationEntry = navEntries[0];
    const isReload = navigationEntry
      ? navigationEntry.type === 'reload'
      : performance?.navigation?.type === performance?.navigation?.TYPE_RELOAD;

    if (isReload && window.location.pathname !== '/') {
      setReloadNoticePath(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      setReloadNoticePath(null);
    }
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="App">
        <Navigation />

        {reloadNoticePath && (
          <div className="reload-notice">
            <p>
              Страница <strong>{reloadNoticePath}</strong> обновлена напрямую. Для корректной работы SPA
              перейдите на главную и используйте встроенную навигацию.
            </p>
            <Link to="/" className="btn btn-primary">
              ← На главную
            </Link>
          </div>
        )}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/technologies" element={<TechnologyListPage />} />
            <Route path="/roadmap-import" element={<RoadmapImport />} />
            <Route path="/study-plan" element={<StudyPlan />} />
            <Route path="/technology/:id" element={<TechnologyDetail />} />
            <Route path="/add-technology" element={<AddTechnology />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;