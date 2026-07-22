import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Work', href: '/notes' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 z-50 bg-white">
        <div className="w-full px-8 md:px-12 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
              surya chitti
            </Link>
            <div className="flex gap-4">
              {navigation.filter(n => n.name !== 'Home').map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm transition-colors ${
                    location.pathname.startsWith(item.href)
                      ? 'text-gray-900'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {item.name.toLowerCase()}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 md:px-12 py-10">
        {children}
      </main>

      <footer className="border-t border-gray-50 mt-20">
        <div className="w-full px-8 md:px-12 py-6">
          <p className="text-xs text-gray-300 text-center">
            suryachitti216@gmail.com
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
