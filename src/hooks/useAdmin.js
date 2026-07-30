import { useState, useEffect, useCallback } from 'react';

const ADMIN_KEY = 'surya-admin';
const ADMIN_PASSWORD = 'surya2025';

export default function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem(ADMIN_KEY) === 'true'
  );

  const login = useCallback(() => {
    const pwd = window.prompt('Password:');
    if (pwd === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
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
          login();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAdmin, login, logout]);

  // URL param: ?edit on any page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('edit') && !isAdmin) {
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('edit');
      window.history.replaceState({}, '', url.toString());
      login();
    }
  }, []);

  return { isAdmin, login, logout };
}
