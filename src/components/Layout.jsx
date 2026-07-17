import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Notes', href: '/notes' },
    { name: 'CV', href: '/cv' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-lg font-serif font-semibold text-gray-900 hover:text-gray-700 transition-colors">
              Surya Chitti
            </Link>
            <div className="flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                      ? 'text-gray-900 bg-gray-100 font-medium'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <p className="text-center text-xs text-gray-400">
            Surya Chitti &middot; suryachitti216@gmail.com
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
