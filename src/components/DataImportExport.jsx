import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './DataImportExport.css';
import { useNotifier } from '../context/NotificationContext.jsx';

const STORAGE_KEY = 'techTrackerData';
const ALLOWED_STATUSES = new Set(['not-started', 'in-progress', 'completed']);

const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const buildValidationReport = (items) => {
    const report = {
        valid: [],
        invalid: []
    };

    items.forEach((item, index) => {
        const errors = [];
        const candidate = typeof item === 'object' && item !== null ? item : {};

        const title = sanitizeString(candidate.title);
        const description = sanitizeString(candidate.description);
        const status = sanitizeString(candidate.status) || 'not-started';
        const notes = typeof candidate.notes === 'string' ? candidate.notes : '';

        if (!title || title.length < 2) {
            errors.push('Название отсутствует или слишком короткое');
        }

        if (!description || description.length < 10) {
            errors.push('Описание отсутствует или слишком короткое');
        }

        if (!ALLOWED_STATUSES.has(status)) {
            errors.push(`Статус "${candidate.status}" не поддерживается`);
        }

        if (errors.length) {
            report.invalid.push({
                index: index + 1,
                preview: title || candidate.id || `Запись ${index + 1}`,
                errors
            });
            return;
        }

        report.valid.push({
            id: candidate.id ?? `${Date.now()}-${index}`,
            title,
            description,
            status,
            notes
        });
    });

    return report;
};

function DataImportExport({ technologies, setTechnologies }) {
    const fileInputRef = useRef(null);
    const [status, setStatus] = useState({ message: '', tone: 'info' });
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState([]);
    const [importReport, setImportReport] = useState(null);
    const { notify } = useNotifier();

    const updateStatus = (message, tone = 'info') => {
        setStatus({ message, tone });
    };

    const normalizePayload = (payload) => {
        if (Array.isArray(payload)) {
            return payload;
        }

        if (Array.isArray(payload?.technologies)) {
            return payload.technologies;
        }

        throw new Error('Ожидается массив технологий или объект с ключом "technologies"');
    };

    const applyValidatedData = (report) => {
        if (!report.valid.length) {
            throw new Error('Не найдено валидных технологий для импорта');
        }

        setTechnologies(report.valid);
        setPreview(report.valid.slice(0, 5));
        setImportReport({
            validCount: report.valid.length,
            invalidCount: report.invalid.length,
            invalidSamples: report.invalid.slice(0, 5)
        });

        if (report.invalid.length) {
            notify({
                message: `Часть записей пропущена (${report.invalid.length})`,
                severity: 'warning'
            });
        }
    };

    const exportToJSON = () => {
        if (!technologies.length) {
            updateStatus('Нет данных для экспорта', 'warning');
            return;
        }

        const payload = {
            technologies,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `technologies_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        updateStatus('Данные экспортированы в JSON', 'success');
        notify({ message: 'Экспорт завершён', severity: 'success' });
    };

    const parseAndApplyImport = async (file) => {
        const text = await file.text();
        const json = JSON.parse(text);
        const normalized = normalizePayload(json);
        const report = buildValidationReport(normalized);
        applyValidatedData(report);
        updateStatus(`Импортировано ${report.valid.length} технологий`, 'success');
        notify({ message: 'Импорт выполнен успешно', severity: 'success' });
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setImportReport(null);
            await parseAndApplyImport(file);
        } catch (error) {
            console.error('Ошибка импорта', error);
            updateStatus(error.message || 'Ошибка импорта: неверный формат файла', 'error');
            notify({ message: 'Импорт не выполнен', severity: 'error' });
        } finally {
            event.target.value = '';
        }
    };

    const saveToLocalStorage = () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(technologies));
            updateStatus('Данные сохранены в localStorage', 'success');
            notify({ message: 'Данные сохранены локально', severity: 'success' });
        } catch (error) {
            console.error('Ошибка сохранения в localStorage', error);
            updateStatus('Не удалось сохранить в localStorage', 'error');
        }
    };

    const loadFromLocalStorage = () => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                updateStatus('В localStorage нет данных', 'warning');
                return;
            }
            const parsed = JSON.parse(stored);
            const normalized = normalizePayload(parsed);
            const report = buildValidationReport(normalized);
            applyValidatedData(report);
            updateStatus(`Загружено ${report.valid.length} технологий из localStorage`, 'success');
            notify({ message: 'Данные загружены из localStorage', severity: 'info' });
        } catch (error) {
            console.error('Ошибка чтения из localStorage', error);
            updateStatus('Не удалось загрузить данные из localStorage', 'error');
        }
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (!file || file.type !== 'application/json') {
            updateStatus('Поддерживаются только JSON-файлы', 'warning');
            return;
        }

        try {
            setImportReport(null);
            await parseAndApplyImport(file);
        } catch (error) {
            updateStatus(error.message || 'Ошибка импорта файла', 'error');
        }
    };

    return (
        <section className="data-transfer-card" aria-labelledby="data-transfer-title">
            <div className="data-card-header">
                <div>
                    <p className="eyebrow">Импорт и экспорт</p>
                    <h2 id="data-transfer-title">Резервное копирование данных</h2>
                </div>
                <div className="data-actions">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={exportToJSON}
                        disabled={technologies.length === 0}
                    >
                        Экспорт в JSON
                    </button>
                    <button type="button" className="btn btn-outline" onClick={saveToLocalStorage}>
                        Сохранить в localStorage
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={loadFromLocalStorage}>
                        Загрузить из localStorage
                    </button>
                </div>
            </div>

            <div className="import-controls">
                <label className="file-input-label" htmlFor="data-import-input">
                    <span>Импорт из файла (.json)</span>
                    <input
                        id="data-import-input"
                        ref={fileInputRef}
                        type="file"
                        accept="application/json"
                        onChange={handleImport}
                    />
                </label>

                <div
                    className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                    role="button"
                    tabIndex={0}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            fileInputRef.current?.click();
                        }
                    }}
                >
                    Перетащите JSON-файл сюда или нажмите, чтобы выбрать
                </div>
            </div>

            <div className="status-banner" role="status" aria-live="polite" data-tone={status.tone}>
                {status.message || 'Действия для импорта/экспорта появятся здесь'}
            </div>

            {preview.length > 0 && (
                <div className="preview-list" aria-live="polite">
                    <p>Последние импортированные технологии:</p>
                    <ul>
                        {preview.map((tech) => (
                            <li key={tech.id}>
                                <strong>{tech.title}</strong> — {tech.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {importReport && (
                <div className="import-report" role="status" aria-live="polite">
                    <p>
                        Успешно загружено {importReport.validCount} записей.
                        {importReport.invalidCount > 0
                            ? ` Пропущено ${importReport.invalidCount} некорректных элементов.`
                            : ' Ошибок не обнаружено.'}
                    </p>
                    {importReport.invalidCount > 0 && (
                        <details>
                            <summary>Показать ошибки валидации ({importReport.invalidCount})</summary>
                            <ul>
                                {importReport.invalidSamples.map((sample) => (
                                    <li key={sample.index}>
                                        <strong>{sample.preview}:</strong> {sample.errors.join('; ')}
                                    </li>
                                ))}
                                {importReport.invalidCount > importReport.invalidSamples.length && (
                                    <li>И ещё {importReport.invalidCount - importReport.invalidSamples.length} записей</li>
                                )}
                            </ul>
                        </details>
                    )}
                </div>
            )}
        </section>
    );
}

DataImportExport.propTypes = {
    technologies: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            notes: PropTypes.string
        })
    ).isRequired,
    setTechnologies: PropTypes.func.isRequired
};

export default DataImportExport;


