import { Link } from 'react-router-dom';
import { useTechnologies } from '../hooks/useTechnologies';
import { useAuth } from '../context/AuthContext';
import DataImportExport from '../components/DataImportExport.jsx';
import './Settings.css';

function Settings() {
  const { technologies, setTechnologies, resetToInitial } = useTechnologies();
  const { user, logout } = useAuth();

  return (
    <div className="page settings-page">
      <nav className="breadcrumbs">
        <Link to="/">Главная</Link>
        <span> / </span>
        <span>Настройки</span>
      </nav>

      <div className="page-header">
        <div className="header-content">
          <h1>⚙️ Настройки приложения</h1>
          <p>Управляйте предпочтениями и данными трекера</p>
        </div>
        <Link to="/statistics" className="btn btn-secondary">
          ← К статистике
        </Link>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <header>
            <h2>Пользователь</h2>
            <span className="badge badge-success">Авторизован</span>
          </header>
          <p>Вы вошли как <strong>{user?.name || 'Администратор'}</strong>.</p>
          <button className="btn btn-outline" onClick={logout}>
            🚪 Выйти
          </button>
        </section>

        <section className="settings-card">
          <header>
            <h2>Сброс и отладка</h2>
          </header>
          <p>Можно быстро вернуть данные к начальному состоянию для тестирования.</p>
          <div className="settings-actions">
            <button className="btn btn-danger" onClick={resetToInitial}>
              ♻️ Сбросить к начальным данным
            </button>
          </div>
        </section>
      </div>

      <DataImportExport technologies={technologies} setTechnologies={setTechnologies} />
    </div>
  );
}

export default Settings;

