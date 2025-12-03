import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './BulkStatusEditor.css';
import { useNotifier } from '../context/NotificationContext.jsx';

const STATUS_OPTIONS = [
    { value: 'not-started', label: '⏳ Не начато' },
    { value: 'in-progress', label: '🔄 В процессе' },
    { value: 'completed', label: '✅ Завершено' }
];

function BulkStatusEditor({ technologies, onApply }) {
    const [search, setSearch] = useState('');
    const [targetStatus, setTargetStatus] = useState('in-progress');
    const [selectedIds, setSelectedIds] = useState([]);
    const [error, setError] = useState('');
    const { notify } = useNotifier();

    const filteredTechnologies = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return technologies;

        return technologies.filter((tech) => {
            const haystack = `${tech.title} ${tech.description ?? ''} ${tech.status}`.toLowerCase();
            return haystack.includes(term);
        });
    }, [technologies, search]);

    const allVisibleSelected =
        filteredTechnologies.length > 0 &&
        filteredTechnologies.every((tech) => selectedIds.includes(tech.id));

    const toggleSelection = (techId) => {
        setSelectedIds((prev) =>
            prev.includes(techId) ? prev.filter((id) => id !== techId) : [...prev, techId]
        );
    };

    const toggleAllVisible = () => {
        if (allVisibleSelected) {
            const visibleIds = filteredTechnologies.map((tech) => tech.id);
            setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => {
            const newIds = filteredTechnologies
                .map((tech) => tech.id)
                .filter((id) => !prev.includes(id));
            return [...prev, ...newIds];
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!selectedIds.length) {
            setError('Выберите хотя бы одну технологию');
            return;
        }

        onApply(selectedIds, targetStatus);
        setError('');
        notify({
            message: `Обновлено ${selectedIds.length} технологий`,
            severity: 'success'
        });
        setSelectedIds([]);
    };

    return (
        <section className="bulk-status-card" aria-labelledby="bulk-status-title">
            <form className="bulk-form" onSubmit={handleSubmit}>
                <header className="bulk-status-header">
                    <div>
                        <p className="bulk-eyebrow">Доступно {technologies.length} технологий</p>
                        <h2 id="bulk-status-title">Массовое изменение статусов</h2>
                    </div>
                    <div className="bulk-header-actions">
                        <label className="visually-hidden" htmlFor="bulk-search">
                            Поиск по технологиям
                        </label>
                        <input
                            id="bulk-search"
                            type="search"
                            className="bulk-search"
                            placeholder="Фильтр по названию, описанию или статусу"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="bulk-select"
                            aria-label="Новый статус"
                            value={targetStatus}
                            onChange={(e) => setTargetStatus(e.target.value)}
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            aria-live="off"
                        >
                            Применить
                        </button>
                    </div>
                </header>

                <div className="bulk-table-wrapper" role="region" aria-label="Список технологий для массового обновления">
                    <table className="bulk-table">
                        <thead>
                        <tr>
                            <th>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        onChange={toggleAllVisible}
                                        aria-label="Выбрать все на странице"
                                    />
                                    <span>Все</span>
                                </label>
                            </th>
                            <th>Название</th>
                            <th>Текущий статус</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredTechnologies.length === 0 && (
                            <tr>
                                <td colSpan={3} className="bulk-empty">
                                    Совпадений не найдено
                                </td>
                            </tr>
                        )}
                        {filteredTechnologies.map((tech) => (
                            <tr key={tech.id}>
                                <td>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(tech.id)}
                                            onChange={() => toggleSelection(tech.id)}
                                            aria-label={`Выбрать технологию ${tech.title}`}
                                        />
                                        <span className="visually-hidden">{tech.title}</span>
                                    </label>
                                </td>
                                <td>
                                    <div className="bulk-tech-title">{tech.title}</div>
                                    <p className="bulk-tech-description">{tech.description}</p>
                                </td>
                                <td>
                  <span className={`status-pill status-${tech.status}`}>
                    {
                        STATUS_OPTIONS.find((option) => option.value === tech.status)?.label ||
                        tech.status
                    }
                  </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div
                    className="bulk-status-footer"
                    role="status"
                    aria-live="polite"
                >
                    {error ? (
                        <span className="error-message">{error}</span>
                    ) : (
                        <span>
            Выбрано {selectedIds.length} / {technologies.length} технолог{selectedIds.length === 1 ? 'ия' : 'ий'}
          </span>
                    )}
                </div>
            </form>
        </section>
    );
}

BulkStatusEditor.propTypes = {
    technologies: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired
        })
    ).isRequired,
    onApply: PropTypes.func.isRequired
};

export default BulkStatusEditor;


