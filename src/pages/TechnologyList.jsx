import { Link, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useTechnologies } from '../hooks/useTechnologies';
import { useNotifier } from '../context/NotificationContext.jsx';
import BulkStatusEditor from '../components/BulkStatusEditor.jsx';
import Modal from '../components/Modal.jsx';
import ProgressHeader from '../components/ProgressHeader.jsx';
import QuickActions from '../components/QuickActions.jsx';
import './TechnologyList.css';

function TechnologyList() {
    const { technologies, updateTechnologyStatus, updateAllStatuses, updateStatusesByIds, exportData } =
        useTechnologies();
    const { notify } = useNotifier();
    const navigate = useNavigate();
    const [isBulkEditorOpen, setIsBulkEditorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'completed', 'in-progress', 'not-started'

    const handleBulkStatusChange = (ids, status) => {
        updateStatusesByIds(ids, status);
        if (ids.length) {
            notify({
                message: `Статус обновлён для ${ids.length} технологий`,
                severity: 'success'
            });
            setIsBulkEditorOpen(false);
        }
    };

    const handleSingleStatusChange = (id, currentStatus) => {
        const order = ['not-started', 'in-progress', 'completed'];
        const currentIndex = order.indexOf(currentStatus);
        const nextStatus = order[(currentIndex + 1) % order.length];

        updateTechnologyStatus(id, nextStatus);
        notify({
            message: `Статус технологии обновлён на "${getStatusText(nextStatus)}"`,
            severity: 'info'
        });
    };

    const handleUpdateAll = (status) => {
        if (!technologies.length) return;
        updateAllStatuses(status);
        notify({
            message: `Все технологии помечены как "${getStatusText(status)}"`,
            severity: 'warning'
        });
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

    // 🔥 Фильтрация технологий по поисковому запросу и статусу
    const filteredTechnologies = useMemo(() => {
        let filtered = technologies;

        // Фильтр по поисковому запросу
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(tech =>
                tech.title.toLowerCase().includes(query) ||
                (tech.description && tech.description.toLowerCase().includes(query))
            );
        }

        // Фильтр по статусу
        if (statusFilter !== 'all') {
            filtered = filtered.filter(tech => tech.status === statusFilter);
        }

        return filtered;
    }, [technologies, searchQuery, statusFilter]);

    const handleRandomSelect = (techId) => {
        // Переходим на страницу деталей выбранной технологии
        navigate(`/technology/${techId}`);
        notify({
            message: 'Технология выбрана для изучения',
            severity: 'info'
        });
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

            {/* 🔥 ProgressHeader - статистика по дорожной карте */}
            <ProgressHeader technologies={technologies} />

            {/* 🔥 QuickActions - быстрые действия */}
            <QuickActions
                technologies={technologies}
                onUpdateAllStatuses={updateAllStatuses}
                onRandomSelect={handleRandomSelect}
            />

            {/* 🔥 Поиск и фильтры */}
            <div className="filters-section">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="🔍 Поиск по названию технологий..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="clear-search-btn"
                            onClick={() => setSearchQuery('')}
                            aria-label="Очистить поиск"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="status-filters">
                    <button
                        className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        Все
                    </button>
                    <button
                        className={`status-filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('completed')}
                    >
                        ✅ Завершено
                    </button>
                    <button
                        className={`status-filter-btn ${statusFilter === 'in-progress' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('in-progress')}
                    >
                        🔄 В процессе
                    </button>
                    <button
                        className={`status-filter-btn ${statusFilter === 'not-started' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('not-started')}
                    >
                        ⏳ Не начато
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setIsBulkEditorOpen(true)}
                    className="btn btn-primary"
                    style={{ marginBottom: '20px' }}
                >
                    📝 Массовое изменение статусов
                </button>
            </div>

            <Modal
                isOpen={isBulkEditorOpen}
                onClose={() => setIsBulkEditorOpen(false)}
                title="Массовое изменение статусов"
                size="large"
            >
                <BulkStatusEditor technologies={technologies} onApply={handleBulkStatusChange} />
            </Modal>

            <div className="status-controls" aria-label="Быстрое изменение статусов">
                <button
                    type="button"
                    className="status-toggle-btn-all"
                    onClick={() => handleUpdateAll('not-started')}
                >
                    ⏳ Все «Не начато»
                </button>
                <button
                    type="button"
                    className="status-toggle-btn-all"
                    onClick={() => handleUpdateAll('in-progress')}
                >
                    🔄 Все «В процессе»
                </button>
                <button
                    type="button"
                    className="status-toggle-btn-all"
                    onClick={() => handleUpdateAll('completed')}
                >
                    ✅ Все «Завершено»
                </button>
            </div>

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
                {filteredTechnologies.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>Ничего не найдено</h3>
                        <p>
                            {searchQuery || statusFilter !== 'all'
                                ? 'Попробуйте изменить параметры поиска или фильтры'
                                : 'Технологий пока нет'}
                        </p>
                        {(searchQuery || statusFilter !== 'all') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                }}
                            >
                                Сбросить фильтры
                            </button>
                        )}
                    </div>
                ) : (
                    filteredTechnologies.map(tech => (
                    <div key={tech.id} className="technology-card">
                        <div className="card-header">
                            <h3>{tech.title}</h3>
                            <button
                                type="button"
                                className={`status ${getStatusClass(tech.status)}`}
                                onClick={() => handleSingleStatusChange(tech.id, tech.status)}
                                aria-label={`Текущий статус: ${getStatusText(tech.status)}. Нажмите, чтобы изменить.`}
                            >
                                {getStatusText(tech.status)}
                            </button>
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
                    ))
                )}
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