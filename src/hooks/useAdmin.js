import { useState, useEffect, useCallback } from 'react';

const ADMIN_KEY = 'surya-admin';
const ADMIN_PASSWORD = 'surya2025';

export default function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem(ADMIN_KEY) === 'true'
  );
  const [showLoginModal, setShowLoginModal] = useState(false);

  const requestLogin = useCallback(() => {
    if (isAdmin) return;
    setShowLoginModal(true);
  }, [isAdmin]);

  const submitPassword = useCallback((pwd) => {
    if (pwd === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, 'true');
      setIsAdmin(true);
      setShowLoginModal(false);
      return true;
    }
    setShowLoginModal(false);
    return false;
  }, []);

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

  return { isAdmin, showLoginModal, requestLogin, submitPassword, cancelLogin, logout };
}
