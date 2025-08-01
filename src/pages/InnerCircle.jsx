import { useState } from 'react';
import { useInnerCircleAccess, AccessGate } from '../components/AccessControl';
import { WeeklyTodos } from '../components/WeeklyTodos';
import { loadGardenPosts } from '../lib/loadGarden';
import { Link } from 'react-router-dom';

export default function InnerCircle() {
  const { hasAccess, isChecking, grantAccess } = useInnerCircleAccess();
  const [showAccessGate, setShowAccessGate] = useState(false);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (showAccessGate) {
      return <AccessGate 
        grantAccess={grantAccess}
        onAccessGranted={() => {
          // The AccessGate component will call grantAccess internally
          // and update the hasAccess state, so we just hide the gate
          setShowAccessGate(false);
        }} 
      />;
    }
    
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
            <p className="text-gray-600">Access required to view private research content</p>
          </div>

          <button
            onClick={() => setShowAccessGate(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Enter Access Code
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This area contains private research notes, internal TODOs, and unpublished experiments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Inner Circle Dashboard
  const allPosts = loadGardenPosts();
  const privatePosts = allPosts.filter(post => !post.published);
  const publicPosts = allPosts.filter(post => post.published);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Workspace</h1>
            <p className="text-gray-600">Private research management and internal tools</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-blue-100 px-3 py-1 rounded-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-medium text-blue-600">Inner Circle Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{privatePosts.length}</div>
          <div className="text-sm text-gray-600">Private Posts</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{publicPosts.length}</div>
          <div className="text-sm text-gray-600">Public Posts</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {privatePosts.filter(p => p.experiment.defined && !p.results.executed).length}
          </div>
          <div className="text-sm text-gray-600">Pending Experiments</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {privatePosts.filter(p => p.isStale).length}
          </div>
          <div className="text-sm text-gray-600">Stale Experiments</div>
        </div>
      </div>

      {/* Weekly TODOs */}
      <WeeklyTodos />

      {/* Private Posts Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Private Research Queue</h2>
        
        {privatePosts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No private posts found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {privatePosts.map(post => (
              <div key={post.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div className="flex-1">
                  <Link to={`/garden/${post.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {post.title}
                  </Link>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                    {post.isStale && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Stale
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {post.date}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Link
            to="/garden"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">View All Posts</div>
                <div className="text-sm text-gray-600">Browse public and private content</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'hypothesis':
      return 'bg-blue-100 text-blue-800';
    case 'experiment':
      return 'bg-yellow-100 text-yellow-800';
    case 'validated':
      return 'bg-green-100 text-green-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
} 