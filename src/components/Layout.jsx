import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Layout = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'Garden', href: '/garden' },
    { name: 'CV', href: '/cv' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-xl font-serif font-semibold text-gray-900">
              Surya G S Chitti
            </Link>
            <div className="flex space-x-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={location.pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to={item.href}>{item.name}</Link>
                </Button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 Surya G S Chitti. Built with React and deployed via Vercel.</p>
            <p className="mt-2">
              <span className="italic">A researcher's lab notebook in digital form.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

