import { useState } from 'react';
import './QuickActions.css';

function QuickActions({
                          technologies,
                          onUpdateAllStatuses,
                          onRandomSelect
                      }) {
    const [randomMessage, setRandomMessage] = useState('');

    const resetAll = () => {
        if (window.confirm('⚠️ Вы уверены, что хотите сбросить все статусы на "Не начато"? Это действие нельзя отменить.')) {
            onUpdateAllStatuses('not-started');
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
            setRandomMessage(`🎲 Выбрана технология: "${randomTech.title}"`);
            setTimeout(() => setRandomMessage(''), 3000);
        } else {
            // Проверяем, все ли технологии в процессе или завершены
            const allInProgressOrCompleted = technologies.every(
                tech => tech.status === 'in-progress' || tech.status === 'completed'
            );
            
            if (allInProgressOrCompleted && technologies.length > 0) {
                setRandomMessage('⚠️ Невозможно выбрать новую технологию для изучения. Все технологии уже имеют статус "В процессе" или "Завершено".');
            } else if (technologies.length === 0) {
                setRandomMessage('⚠️ Нет доступных технологий для выбора.');
            } else {
                setRandomMessage('⚠️ Нет технологий со статусом "Не начато" для случайного выбора.');
            }
            setTimeout(() => setRandomMessage(''), 5000);
        }
    };

    const notStartedCount = technologies.filter(tech => tech.status === 'not-started').length;

    return (
        <div className="quick-actions">
            <h3>⚡ Быстрые действия</h3>
            
            {randomMessage && (
                <div className={`random-message ${randomMessage.includes('⚠️') ? 'error' : 'success'}`}>
                    {randomMessage}
                </div>
            )}

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