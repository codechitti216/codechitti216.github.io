import { useState, useEffect } from 'react';

const INNER_CIRCLE_PASSWORD = 'research2025'; // In production, this would be an environment variable

export function useInnerCircleAccess() {
  console.log('🔍 DEBUG: useInnerCircleAccess hook called');
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('🔍 DEBUG: useInnerCircleAccess useEffect running');
    const access = localStorage.getItem('inner_circle') === 'true';
    console.log('🔍 DEBUG: localStorage inner_circle value:', localStorage.getItem('inner_circle'));
    console.log('🔍 DEBUG: Access granted:', access);
    setHasAccess(access);
    setIsChecking(false);
  }, []);

  const grantAccess = (password) => {
    if (password === INNER_CIRCLE_PASSWORD) {
      localStorage.setItem('inner_circle', 'true');
      setHasAccess(true);
      setIsChecking(false);
      return true;
    }
    return false;
  };

  const revokeAccess = () => {
    localStorage.removeItem('inner_circle');
    setHasAccess(false);
  };

  return { hasAccess, isChecking, grantAccess, revokeAccess };
}

export function AccessGate({ grantAccess, onAccessGranted }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (grantAccess(password)) {
      onAccessGranted();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Research Workspace</h1>
          <p className="text-gray-600">Enter access code to view private research content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Access Code
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Access Workspace
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This area contains private research notes, internal TODOs, and unpublished experiments.
          </p>
        </div>
      </div>
    </div>
  );
} 