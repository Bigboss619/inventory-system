import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE = 5 * 60 * 1000; // Show warning 5 minutes before logout

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownRef = useRef(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  const authToken = localStorage.getItem('authToken');

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('lastActivity');
    setShowTimeoutWarning(false);
    clearTimeout(timeoutRef.current);
    clearTimeout(warningTimeoutRef.current);
    clearInterval(countdownRef.current);
    navigate('/login', { state: { reason: 'session_expired' } });
  }, [navigate]);

  const resetActivityTimer = useCallback(() => {
    if (!authToken) return;

    const now = Date.now();
    localStorage.setItem('lastActivity', now.toString());

    setShowTimeoutWarning(false);
    clearTimeout(timeoutRef.current);
    clearTimeout(warningTimeoutRef.current);
    clearInterval(countdownRef.current);

    // Set warning timeout (25 minutes from now)
    warningTimeoutRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      setCountdown(300);

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

    // Set logout timeout (30 minutes from now)
    timeoutRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [authToken, logout]);

  const extendSession = useCallback(() => {
    resetActivityTimer();
  }, [resetActivityTimer]);

  const stayLoggedIn = useCallback(() => {
    extendSession();
  }, [extendSession]);

  // Initialize timer on mount and handle user activity
  useEffect(() => {
    if (!authToken) return;

    // Check if session already expired
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed >= INACTIVITY_TIMEOUT) {
        logout();
        return;
      } else {
        // Resume timer from where we left off
        const remainingTime = INACTIVITY_TIMEOUT - elapsed;
        const warningTime = remainingTime - WARNING_BEFORE;

        if (warningTime > 0) {
          warningTimeoutRef.current = setTimeout(() => {
            setShowTimeoutWarning(true);
            setCountdown(300);
            countdownRef.current = setInterval(() => {
              setCountdown(prev => {
                if (prev <= 1) {
                  clearInterval(countdownRef.current);
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }, warningTime);
        } else {
          // Already in warning period
          setShowTimeoutWarning(true);
          const remainingWarningTime = remainingTime;
          setCountdown(Math.floor(remainingWarningTime / 1000));
          countdownRef.current = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownRef.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }

        timeoutRef.current = setTimeout(() => {
          logout();
        }, remainingTime);
      }
    } else {
      resetActivityTimer();
    }

    // Activity event listeners
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetActivityTimer();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(warningTimeoutRef.current);
      clearInterval(countdownRef.current);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [authToken, logout, resetActivityTimer]);

  return (
    <AuthContext.Provider value={{ logout, extendSession, stayLoggedIn, showTimeoutWarning, countdown }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;