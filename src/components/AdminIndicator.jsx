import useAdmin from '../hooks/useAdmin';

export default function AdminIndicator() {
  const { isAdmin, logout } = useAdmin();

  if (!isAdmin) return null;

  return (
    <button
      onClick={logout}
      title="Exit edit mode (Ctrl+Shift+E)"
      className="fixed bottom-4 right-4 z-50 w-3 h-3 rounded-full bg-emerald-400 hover:bg-red-400 transition-colors cursor-pointer shadow-sm"
      style={{ opacity: 0.6 }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
    />
  );
}
