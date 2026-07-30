import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminContext = createContext(null);

const ADMIN_KEY = 'surya-admin';

const CHALLENGES = [
  { q: "If Mammootty had 10 sons, what would you call them?", a: "10dq" },
];

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem(ADMIN_KEY) === 'true'
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [challenge, setChallenge] = useState(null);

  const pickChallenge = useCallback(() => {
    const c = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    setChallenge(c);
  }, []);

  const requestLogin = useCallback(() => {
    if (isAdmin) return;
    pickChallenge();
    setShowLoginModal(true);
  }, [isAdmin, pickChallenge]);

  const submitAnswer = useCallback((answer) => {
    if (challenge && answer.trim().toLowerCase() === challenge.a.toLowerCase()) {
      localStorage.setItem(ADMIN_KEY, 'true');
      setIsAdmin(true);
      setShowLoginModal(false);
      return true;
    }
    setShowLoginModal(false);
    return false;
  }, [challenge]);

  const cancelLogin = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
  }, []);

  // Keyboard shortcut: Ctrl+Shift+E
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        if (isAdmin) {
          logout();
        } else {
          requestLogin();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAdmin, logout, requestLogin]);

  // URL param: ?edit on any page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('edit') && !isAdmin) {
      const url = new URL(window.location.href);
      url.searchParams.delete('edit');
      window.history.replaceState({}, '', url.toString());
      requestLogin();
    }
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, showLoginModal, challenge, requestLogin, submitAnswer, cancelLogin, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
