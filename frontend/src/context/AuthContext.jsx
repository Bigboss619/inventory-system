import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { login as apiLogin, getCurrentUser } from '../services/api';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE = 5 * 60 * 1000; // Show warning 5 minutes before logout

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(300);

  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownRef = useRef(null);

  const logout = useCallback(() => {
    setUser(null);
    setShowTimeoutWarning(false);
    clearTimeout(timeoutRef.current);
    clearTimeout(warningTimeoutRef.current);
    clearInterval(countdownRef.current);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('lastActivity');
    // Redirect to home - will be handled by ProtectedRoute
    window.location.href = '/';
  }, []);

  const resetActivityTimer = useCallback(() => {
    const now = Date.now();
    localStorage.setItem('lastActivity', now.toString());

    setShowTimeoutWarning(false);
    clearTimeout(timeoutRef.current);
    clearTimeout(warningTimeoutRef.current);
    clearInterval(countdownRef.current);

    // Set warning timeout
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
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

  const stayLoggedIn = useCallback(() => {
    resetActivityTimer();
  }, [resetActivityTimer]);

  // Initialize timer on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      localStorage.setItem('authToken', 'true');

      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity, 10);
        if (elapsed >= INACTIVITY_TIMEOUT) {
          logout();
          return;
        } else {
          const remainingTime = INACTIVITY_TIMEOUT - elapsed;
          const warningTime = remainingTime - WARNING_BEFORE;

          if (warningTime > 0) {
            warningTimeoutRef.current = setTimeout(() => {
              setShowTimeoutWarning(true);
              setCountdown(Math.floor(remainingTime / 1000));
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
            setShowTimeoutWarning(true);
            setCountdown(Math.floor(remainingTime / 1000));
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
    }
    setLoading(false);

    // Activity event listeners
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      if (localStorage.getItem('user')) {
        resetActivityTimer();
      }
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
  }, []);

  const login = async (email, password) => {
    const response = await apiLogin(email, password);
    if (response.user) {
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('authToken', 'true');
      localStorage.setItem('lastActivity', Date.now().toString());
      resetActivityTimer();
      return { success: true };
    }
    return { success: false, message: response.message };
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout: handleLogout, loading, showTimeoutWarning, countdown, stayLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};