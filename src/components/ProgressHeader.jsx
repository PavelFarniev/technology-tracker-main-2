import ProgressBar from './ProgressBar';
import './ProgressHeader.css';

function ProgressHeader({ technologies }) {
    const total = technologies.length;
    const completed = technologies.filter(tech => tech.status === 'completed').length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 🔥 Определяем цвет прогресс-бара в зависимости от прогресса
    const getProgressColor = () => {
        if (completionPercentage === 100) return 'success';
        if (completionPercentage >= 70) return 'primary';
        if (completionPercentage >= 30) return 'warning';
        return 'danger';
    };

    return (
        <div className="progress-header">
            <h2>📊 Статистика дорожной карты</h2>

            <div className="progress-main">
                <div className="progress-visual">
                    <ProgressBar
                        percentage={completionPercentage}
                        size="large"
                        color={getProgressColor()}
                        showLabel={true}
                        labelPosition="outside"
                        animated={true}
                        striped={completionPercentage > 0 && completionPercentage < 100}
                    />
                </div>

                <div className="progress-stats-grid">
                    <div className="stat-card">
                        <div className="stat-number total">{total}</div>
                        <div className="stat-label">Общее количество технологий</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number completed">{completed}</div>
                        <div className="stat-label">Количество изученных технологий</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number percentage">{completionPercentage}%</div>
                        <div className="stat-label">Процент выполнения</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProgressHeader;