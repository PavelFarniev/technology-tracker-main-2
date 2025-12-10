import { useNotifier } from '../context/NotificationContext.jsx';
import './QuickActions.css';

function QuickActions({
                          technologies,
                          onUpdateAllStatuses,
                          onRandomSelect
                      }) {
    const { notify } = useNotifier();

    const resetAll = () => {
        if (window.confirm('⚠️ Вы уверены, что хотите сбросить все статусы на "Не начато"? Это действие нельзя отменить.')) {
            onUpdateAllStatuses('not-started');
            notify({
                message: 'Все статусы сброшены на "Не начато"',
                severity: 'info',
                autoHideDuration: 4000
            });
        }
    };

    const getRandomTechnology = () => {
        // Выбираем только технологии со статусом "not-started"
        const notStarted = technologies.filter(tech => tech.status === 'not-started');
        
        if (notStarted.length > 0) {
            const randomTech = notStarted[Math.floor(Math.random() * notStarted.length)];
            if (onRandomSelect) {
                onRandomSelect(randomTech.id);
            }
            notify({
                message: `🎲 Выбрана технология: "${randomTech.title}"`,
                severity: 'success',
                autoHideDuration: 3000
            });
        } else {
            // Проверяем, все ли технологии в процессе или завершены
            const allInProgressOrCompleted = technologies.every(
                tech => tech.status === 'in-progress' || tech.status === 'completed'
            );
            
            if (allInProgressOrCompleted && technologies.length > 0) {
                notify({
                    message: '⚠️ Невозможно выбрать новую технологию для изучения. Все технологии уже имеют статус "В процессе" или "Завершено".',
                    severity: 'warning',
                    autoHideDuration: 5000
                });
            } else if (technologies.length === 0) {
                notify({
                    message: '⚠️ Нет доступных технологий для выбора.',
                    severity: 'warning',
                    autoHideDuration: 4000
                });
            } else {
                notify({
                    message: '⚠️ Нет технологий со статусом "Не начато" для случайного выбора.',
                    severity: 'warning',
                    autoHideDuration: 4000
                });
            }
        }
    };

    const notStartedCount = technologies.filter(tech => tech.status === 'not-started').length;

    return (
        <div className="quick-actions">
            <h3>⚡ Быстрые действия</h3>

            <div className="action-buttons">
                <button onClick={resetAll} className="action-btn reset">
                    🔄 Сбросить все статусы
                </button>

                <button 
                    onClick={getRandomTechnology} 
                    className="action-btn random"
                    disabled={notStartedCount === 0 && technologies.length > 0}
                >
                    🎲 Случайный выбор следующей технологии
                </button>
            </div>
        </div>
    );
}

export default QuickActions;