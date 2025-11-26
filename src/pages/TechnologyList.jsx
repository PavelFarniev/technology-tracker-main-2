import { Link } from 'react-router-dom';
import { useTechnologies } from '../hooks/useTechnologies';
import BulkStatusEditor from '../components/BulkStatusEditor.jsx';
import './TechnologyList.css';

function TechnologyList() {
  const { technologies, updateStatusesByIds } = useTechnologies();

  const handleBulkStatusChange = (ids, status) => {
    updateStatusesByIds(ids, status);
  };

  // 🔥 Статусы на русском
  const getStatusText = (status) => {
    const statusMap = {
      'not-started': '⏳ Не начато',
      'in-progress': '🔄 В процессе',
      'completed': '✅ Завершено'
    };
    return statusMap[status] || status;
  };

  // 🔥 Цвета для статусов
  const getStatusClass = (status) => {
    const statusClassMap = {
      'not-started': 'status-not-started',
      'in-progress': 'status-in-progress',
      'completed': 'status-completed'
    };
    return statusClassMap[status] || '';
  };

  return (
    <div className="page technology-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📚 Все технологии</h1>
          <p>Управляйте вашим прогрессом изучения технологий</p>
        </div>
        <Link to="/add-technology" className="btn btn-primary">
          ➕ Добавить технологию
        </Link>
      </div>

      <BulkStatusEditor technologies={technologies} onApply={handleBulkStatusChange} />

      {/* 🔥 Статистика */}
      <div className="stats-overview">
        <div className="stat-item">
          <span className="stat-number">{technologies.length}</span>
          <span className="stat-label">Всего технологий</span>
        </div>
        <div className="stat-item">
          <span className="stat-number completed">
            {technologies.filter(t => t.status === 'completed').length}
          </span>
          <span className="stat-label">Завершено</span>
        </div>
        <div className="stat-item">
          <span className="stat-number in-progress">
            {technologies.filter(t => t.status === 'in-progress').length}
          </span>
          <span className="stat-label">В процессе</span>
        </div>
        <div className="stat-item">
          <span className="stat-number not-started">
            {technologies.filter(t => t.status === 'not-started').length}
          </span>
          <span className="stat-label">Не начато</span>
        </div>
      </div>

      {/* 🔥 Сетка технологий */}
      <div className="technologies-grid">
        {technologies.map(tech => (
          <div key={tech.id} className="technology-card">
            <div className="card-header">
              <h3>{tech.title}</h3>
              <span className={`status ${getStatusClass(tech.status)}`}>
                {getStatusText(tech.status)}
              </span>
            </div>
            
            <p className="tech-description">{tech.description}</p>
            
            {tech.notes && (
              <div className="tech-notes-preview">
                <strong>📝 Заметки:</strong>
                <p>{tech.notes.length > 100 ? tech.notes.substring(0, 100) + '...' : tech.notes}</p>
              </div>
            )}

            <div className="card-footer">
              <Link to={`/technology/${tech.id}`} className="btn-link">
                🔍 Подробнее →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 Состояние пустого списка */}
      {technologies.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>Технологий пока нет</h3>
          <p>Начните добавлять технологии для отслеживания вашего прогресса</p>
          <Link to="/add-technology" className="btn btn-primary">
            ➕ Добавить первую технологию
          </Link>
        </div>
      )}
    </div>
  );
}

export default TechnologyList;