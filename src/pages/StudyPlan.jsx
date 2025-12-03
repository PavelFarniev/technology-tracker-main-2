import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTechnologies } from '../hooks/useTechnologies';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotifier } from '../context/NotificationContext.jsx';
import './StudyPlan.css';

const defaultFormState = {
    technologyId: '',
    startDate: '',
    deadline: '',
    weeklyHours: '5',
    goal: ''
};

function StudyPlan() {
    const { technologies } = useTechnologies();
    const [plans, setPlans] = useLocalStorage('studyPlans', []);
    const [formData, setFormData] = useState(defaultFormState);
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const { notify } = useNotifier();
    const errorSummary = useMemo(
        () => Object.values(errors).filter(Boolean).join('; '),
        [errors]
    );

    const validateForm = () => {
        const newErrors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!formData.technologyId) {
            newErrors.technologyId = 'Выберите технологию';
        }

        const startDate = formData.startDate ? new Date(formData.startDate) : null;
        const deadline = formData.deadline ? new Date(formData.deadline) : null;

        if (!formData.startDate) {
            newErrors.startDate = 'Укажите дату начала';
        } else if (startDate < today) {
            newErrors.startDate = 'Дата начала не может быть в прошлом';
        }

        if (!formData.deadline) {
            newErrors.deadline = 'Укажите дедлайн';
        } else if (deadline < today) {
            newErrors.deadline = 'Дедлайн не может быть в прошлом';
        } else if (startDate && deadline < startDate) {
            newErrors.deadline = 'Дедлайн не может быть раньше даты начала';
        }

        const weeklyHours = Number(formData.weeklyHours);
        if (!formData.weeklyHours) {
            newErrors.weeklyHours = 'Укажите количество часов';
        } else if (!Number.isFinite(weeklyHours) || weeklyHours < 1 || weeklyHours > 60) {
            newErrors.weeklyHours = 'Используйте диапазон от 1 до 60 часов в неделю';
        }

        const goalText = formData.goal.trim();
        if (!goalText) {
            newErrors.goal = 'Опишите цель обучения';
        } else if (goalText.length < 10) {
            newErrors.goal = 'Минимум 10 символов для описания задачи';
        }

        const isValid = Object.keys(newErrors).length === 0;
        setErrors(newErrors);
        setIsFormValid(isValid);
        return isValid;
    };

    useEffect(() => {
        validateForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const getTechnologyTitle = (techId) => {
        const match = technologies.find((tech) => String(tech.id) === techId);
        return match?.title || 'Неизвестная технология';
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const validNow = validateForm();

        if (!validNow) {
            notify({ message: 'Проверьте форму — есть ошибки', severity: 'warning' });
            return;
        }

        const plan = {
            id: crypto.randomUUID?.() ?? String(Date.now()),
            technologyId: formData.technologyId,
            technologyTitle: getTechnologyTitle(formData.technologyId),
            startDate: formData.startDate,
            deadline: formData.deadline,
            weeklyHours: Number(formData.weeklyHours),
            goal: formData.goal.trim(),
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };

        setPlans((prev) => [...prev, plan]);
        setFormData(defaultFormState);
        notify({ message: 'План изучения сохранён', severity: 'success' });
    };

    const updatePlanStatus = (planId, status) => {
        setPlans((prev) => prev.map((plan) => (plan.id === planId ? { ...plan, status } : plan)));
    };

    const deletePlan = (planId) => {
        setPlans((prev) => prev.filter((plan) => plan.id !== planId));
        notify({ message: 'План удалён', severity: 'info' });
    };

    const sortedPlans = useMemo(
        () =>
            [...plans].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
        [plans]
    );

    return (
        <div className="page study-plan-page">
            <nav className="breadcrumbs">
                <Link to="/">Главная</Link>
                <span> / </span>
                <span>Планирование обучения</span>
            </nav>

            <header className="page-header study-plan-hero">
                <div>
                    <h1>🗓️ Планирование сроков изучения</h1>
                    <p>
                        Выбирайте технологию, задавайте дедлайны и отслеживайте прогресс с подсказками по
                        доступности
                    </p>
                </div>
                <Link to="/technologies" className="btn btn-secondary">
                    ← К списку технологий
                </Link>
            </header>

            <div className="study-plan-grid">
                <section className="study-card">
                    <header>
                        <p className="eyebrow">Форма с валидацией в реальном времени</p>
                        <h2>Новый план обучения</h2>
                    </header>

                    <form className="study-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-field">
                            <label htmlFor="technologyId">
                                Технология*
                                <span className="sr-only">обязательное поле</span>
                            </label>
                            <select
                                id="technologyId"
                                name="technologyId"
                                value={formData.technologyId}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.technologyId)}
                                aria-describedby="technologyId-error"
                            >
                                <option value="">Выберите технологию</option>
                                {technologies.map((tech) => (
                                    <option key={tech.id} value={tech.id}>
                                        {tech.title}
                                    </option>
                                ))}
                            </select>
                            {errors.technologyId && (
                                <span id="technologyId-error" className="error-message" role="alert">
                  {errors.technologyId}
                </span>
                            )}
                        </div>

                        <div className="form-field-group">
                            <div className="form-field">
                                <label htmlFor="startDate">Дата начала*</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(errors.startDate)}
                                    aria-describedby="startDate-error"
                                />
                                {errors.startDate && (
                                    <span id="startDate-error" className="error-message" role="alert">
                    {errors.startDate}
                  </span>
                                )}
                            </div>
                            <div className="form-field">
                                <label htmlFor="deadline">Дедлайн*</label>
                                <input
                                    type="date"
                                    id="deadline"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(errors.deadline)}
                                    aria-describedby="deadline-error"
                                />
                                {errors.deadline && (
                                    <span id="deadline-error" className="error-message" role="alert">
                    {errors.deadline}
                  </span>
                                )}
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="weeklyHours">Целевые часы в неделю*</label>
                            <input
                                type="number"
                                id="weeklyHours"
                                name="weeklyHours"
                                min="1"
                                max="60"
                                value={formData.weeklyHours}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.weeklyHours)}
                                aria-describedby="weeklyHours-error"
                            />
                            {errors.weeklyHours && (
                                <span id="weeklyHours-error" className="error-message" role="alert">
                  {errors.weeklyHours}
                </span>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="goal">Цель и ожидаемые результаты*</label>
                            <textarea
                                id="goal"
                                name="goal"
                                rows="4"
                                value={formData.goal}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.goal)}
                                aria-describedby="goal-error goal-hint"
                                placeholder="Например: подготовиться к собеседованию на middle-уровне"
                            />
                            <span id="goal-hint" className="field-hint">
                Подсказка: сформулируйте конкретный ожидаемый результат
              </span>
                            {errors.goal && (
                                <span id="goal-error" className="error-message" role="alert">
                  {errors.goal}
                </span>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="reset" className="btn btn-outline" onClick={() => setFormData(defaultFormState)}>
                                Очистить
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
                                Сохранить план
                            </button>
                        </div>

                        <div className="live-region" role="status" aria-live="polite" aria-atomic="true">
                            {isFormValid
                                ? 'Форма заполнена корректно'
                                : errorSummary || 'Исправьте ошибки перед сохранением'}
                        </div>
                    </form>
                </section>

                <section className="study-card plans-card">
                    <header>
                        <p className="eyebrow">Активные планы</p>
                        <h2>Мои сроки изучения</h2>
                    </header>

                    {sortedPlans.length === 0 ? (
                        <div className="empty-plans" role="status">
                            Пока нет запланированных дедлайнов. Добавьте первый план.
                        </div>
                    ) : (
                        <ul className="plans-list">
                            {sortedPlans.map((plan) => {
                                const daysLeft =
                                    Math.ceil(
                                        (new Date(plan.deadline).getTime() - new Date().setHours(0, 0, 0, 0)) /
                                        (1000 * 60 * 60 * 24)
                                    ) || 0;

                                return (
                                    <li key={plan.id} className="plan-item">
                                        <div className="plan-main">
                                            <div>
                                                <p className="plan-title">{plan.technologyTitle}</p>
                                                <p className="plan-goal">{plan.goal}</p>
                                                <p className="plan-meta">
                                                    {plan.startDate} → {plan.deadline} • {plan.weeklyHours} ч/нед
                                                </p>
                                            </div>
                                            <span className={`plan-status plan-status-${plan.status}`}>
                        {plan.status === 'completed'
                            ? '✅ Завершено'
                            : daysLeft >= 0
                                ? `⏳ Осталось ${daysLeft} дн.`
                                : '⚠️ Просрочено'}
                      </span>
                                        </div>
                                        <div className="plan-actions">
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={() =>
                                                    updatePlanStatus(plan.id, plan.status === 'completed' ? 'scheduled' : 'completed')
                                                }
                                            >
                                                {plan.status === 'completed' ? 'Вернуть в активные' : 'Отметить выполненным'}
                                            </button>
                                            <button type="button" className="btn btn-danger" onClick={() => deletePlan(plan.id)}>
                                                Удалить
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}

export default StudyPlan;


