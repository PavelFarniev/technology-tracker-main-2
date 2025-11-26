import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle.jsx';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="main-navigation">
      <div className="nav-brand">
        <Link to="/">
          <h2>🚀 Трекер технологий</h2>
        </Link>
      </div>
      
      <ul className="nav-menu">
        <li>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            🏠 Главная
          </Link>
        </li>
        <li>
          <Link 
            to="/technologies" 
            className={location.pathname === '/technologies' ? 'active' : ''}
          >
            📚 Все технологии
          </Link>
        </li>
        <li>
          <Link
            to="/study-plan"
            className={location.pathname === '/study-plan' ? 'active' : ''}
          >
            🗓️ План обучения
          </Link>
        </li>
        <li>
          <Link 
            to="/roadmap-import" 
            className={location.pathname === '/roadmap-import' ? 'active' : ''}
          >
            🗺️ Импорт
          </Link>
        </li>
        <li>
          <Link 
            to="/add-technology" 
            className={location.pathname === '/add-technology' ? 'active' : ''}
          >
            ➕ Добавить технологию
          </Link>
        </li>
        <li>
          <Link 
            to="/statistics" 
            className={location.pathname === '/statistics' ? 'active' : ''}
          >
            📈 Статистика
          </Link>
        </li>
        <li>
          <Link 
            to="/settings" 
            className={location.pathname === '/settings' ? 'active' : ''}
          >
            ⚙️ Настройки
          </Link>
        </li>
        <li className="auth-link">
          {isAuthenticated ? (
            <button type="button" onClick={logout}>
              🚪 Выйти
            </button>
          ) : (
            <Link 
              to="/login" 
              className={location.pathname === '/login' ? 'active' : ''}
            >
              🔐 Войти
            </Link>
          )}
        </li>
        <li className="theme-toggle">
          <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;