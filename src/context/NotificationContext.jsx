import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, IconButton, Slide, Snackbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';

const NotificationContext = createContext({
    notify: () => {}
});

const defaultNotification = {
    id: null,
    message: '',
    severity: 'info',
    autoHideDuration: 4000
};

function SlideTransition(props) {
    return <Slide {...props} direction="up" />;
}

export function NotificationProvider({ children }) {
    const [queue, setQueue] = useState([]);
    const [current, setCurrent] = useState(defaultNotification);
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const isCompact = useMediaQuery(theme.breakpoints.down('sm'));

    const anchorOrigin = useMemo(
        () => ({
            vertical: isCompact ? 'top' : 'bottom',
            horizontal: 'center'
        }),
        [isCompact]
    );

    const alertIconMapping = useMemo(
        () => ({
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />,
            warning: <WarningAmberIcon fontSize="inherit" />,
            info: <InfoIcon fontSize="inherit" />
        }),
        []
    );

    useEffect(() => {
        if (open || !queue.length) {
            return;
        }

        setCurrent(queue[0]);
        setQueue((prev) => prev.slice(1));
        setOpen(true);
    }, [queue, open]);

    const notify = useCallback((config) => {
        setQueue((prev) => [
            ...prev,
            {
                ...defaultNotification,
                ...config,
                id: crypto.randomUUID?.() ?? String(Date.now())
            }
        ]);
    }, []);

    const handleClose = (_, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleExited = () => {
        setCurrent(defaultNotification);
    };

    const contextValue = useMemo(() => ({ notify }), [notify]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}

            <Snackbar
                key={current.id}
                open={open}
                onClose={handleClose}
                TransitionComponent={SlideTransition}
                autoHideDuration={current.autoHideDuration}
                anchorOrigin={anchorOrigin}
                onExited={handleExited}
                sx={{
                    maxWidth: 480,
                    width: 'calc(100% - 32px)',
                    ...(isCompact ? { top: theme.spacing(2) } : { bottom: theme.spacing(3) })
                }}
            >
                <Alert
                    elevation={6}
                    variant="filled"
                    severity={current.severity}
                    iconMapping={alertIconMapping}
                    action={
                        <IconButton
                            aria-label="Закрыть уведомление"
                            color="inherit"
                            size="small"
                            onClick={handleClose}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                    sx={{ alignItems: 'center', gap: 1 }}
                >
                    {current.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
}

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export function useNotifier() {
    return useContext(NotificationContext);
}


