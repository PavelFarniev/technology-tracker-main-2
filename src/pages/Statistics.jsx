import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useTechnologies } from '../hooks/useTechnologies';
import './Statistics.css';

function Statistics() {
    const { technologies, getStatistics } = useTechnologies();
    const stats = getStatistics();

    const progressData = useMemo(() => ([
        {
            key: 'completed',
            label: '✅ Завершено',
            value: stats.completed,
            color: '#51cf66'
        },
        {
            key: 'in-progress',
            label: '🔄 В процессе',
            value: stats.inProgress,
            color: '#4ecdc4'
        },
        {
            key: 'not-started',
            label: '⏳ Не начато',
            value: stats.notStarted,
            color: '#ff6b6b'
        }
    ]), [stats.completed, stats.inProgress, stats.notStarted]);

    const maxValue = Math.max(...progressData.map(item => item.value), 1);
    const totalValue = progressData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="page statistics-page">
            <nav className="breadcrumbs">
                <Link to="/">Главная</Link>
                <span> / </span>
                <span>Статистика</span>
            </nav>

            <div className="page-header">
                <div className="header-content">
                    <h1>📈 Статистика обучения</h1>
                    <p>Анализируйте прогресс и планируйте дальнейшее изучение технологий</p>
                </div>
                <Link to="/technologies" className="btn btn-primary">
                    ← Назад к технологиям
                </Link>
            </div>

            <div className="statistics-grid">
                <div className="stat-card">
                    <span className="stat-label">Всего технологий</span>
                    <span className="stat-value">{stats.total}</span>
                    <p>Все технологии в вашем трекере</p>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Завершено</span>
                    <span className="stat-value success">{stats.completed}</span>
                    <p>Полностью изученные технологии</p>
                </div>
                <div className="stat-card">
                    <span className="stat-label">В процессе</span>
                    <span className="stat-value info">{stats.inProgress}</span>
                    <p>Активно изучаемые сейчас</p>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Не начато</span>
                    <span className="stat-value warning">{stats.notStarted}</span>
                    <p>Ещё ждут своего часа</p>
                </div>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <div>
                        <h2>График прогресса</h2>
                        <p>Соотношение технологий по статусам</p>
                    </div>
                    <div className="chart-score">
                        <span>Общий прогресс</span>
                        <strong>{stats.completionPercentage}%</strong>
                    </div>
                </div>

                <div className="progress-chart">
                    {totalValue === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            width: '100%', 
                            padding: '40px',
                            color: 'var(--text-muted)'
                        }}>
                            <p>Нет данных для отображения графика</p>
                        </div>
                    ) : (
                        progressData.map(item => {
                            const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                            return (
                                <div key={item.key} className="chart-bar">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            height: `${Math.max(heightPercent, 2)}%`,
                                            backgroundColor: item.color
                                        }}
                                    >
                                        {item.value > 0 && (
                                            <span className="bar-value">{item.value}</span>
                                        )}
                                    </div>
                                    <span className="bar-label">{item.label}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="insights-card">
                <h2>Аналитика</h2>
                <ul>
                    <li>Заметок добавлено: <strong>{stats.withNotes}</strong></li>
                    <li>Средняя скорость завершения: <strong>{technologies.length ? `${stats.completionPercentage}%` : '—'}</strong></li>
                    <li>Следующий фокус: <strong>{stats.notStarted > 0 ? 'Начните новую технологию' : 'Поддерживайте текущий прогресс'}</strong></li>
                </ul>
            </div>
        </div>
    );
}

export default Statistics;

