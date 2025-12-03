import { IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeMode } from '../context/ThemeContext.jsx';
import './ThemeToggle.css';

function ThemeToggle() {
    const { mode, toggleTheme } = useThemeMode();
    const isLight = mode === 'light';

    return (
        <Tooltip title={isLight ? 'Включить тёмную тему' : 'Включить светлую тему'}>
            <IconButton
                color="primary"
                size="large"
                onClick={toggleTheme}
                aria-label={isLight ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
                aria-pressed={!isLight}
                data-mode={mode}
                className="theme-toggle-btn"
            >
                {isLight ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
        </Tooltip>
    );
}

export default ThemeToggle;


