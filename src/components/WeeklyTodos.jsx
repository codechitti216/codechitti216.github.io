import { Link } from 'react-router-dom';
import { loadGardenPosts } from '../lib/loadGarden';

export function WeeklyTodos() {
  const allPosts = loadGardenPosts();
  
  // Filter for private posts that need attention
  const privatePosts = allPosts.filter(post => !post.published);
  
  // Categorize todos
  const todos = {
    needsExperiment: privatePosts.filter(post => 
      post.hypothesis && !post.experiment.defined
    ),
    needsResults: privatePosts.filter(post => 
      post.experiment.defined && !post.results.executed
    ),
    needsNextAction: privatePosts.filter(post => 
      post.results.executed && !post.next_action
    ),
    staleExperiments: privatePosts.filter(post => 
      post.isStale
    ),
  };

  const totalTodos = Object.values(todos).reduce((sum, items) => sum + items.length, 0);

  if (totalTodos === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly TODOs</h2>
        <div className="text-center text-gray-500 py-8">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm">No pending tasks in your private research queue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly TODOs</h2>
      
      <div className="space-y-6">
        {/* Needs Experiment */}
        {todos.needsExperiment.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-blue-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Define Experiments ({todos.needsExperiment.length})
            </h3>
            <div className="space-y-2">
              {todos.needsExperiment.map(post => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <div className="flex-1">
                    <Link to={`/garden/${post.id}`} className="font-medium text-blue-900 hover:underline">
                      {post.title}
                    </Link>
                    <p className="text-sm text-blue-700 mt-1">{post.hypothesis}</p>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Hypothesis</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Needs Results */}
        {todos.needsResults.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-yellow-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Log Results ({todos.needsResults.length})
            </h3>
            <div className="space-y-2">
              {todos.needsResults.map(post => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                  <div className="flex-1">
                    <Link to={`/garden/${post.id}`} className="font-medium text-yellow-900 hover:underline">
                      {post.title}
                    </Link>
                    <p className="text-sm text-yellow-700 mt-1">{post.experiment.description}</p>
                  </div>
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Experiment</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stale Experiments */}
        {todos.staleExperiments.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-red-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Stale Experiments ({todos.staleExperiments.length})
            </h3>
            <div className="space-y-2">
              {todos.staleExperiments.map(post => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-red-50 rounded-md">
                  <div className="flex-1">
                    <Link to={`/garden/${post.id}`} className="font-medium text-red-900 hover:underline">
                      {post.title}
                    </Link>
                    <p className="text-sm text-red-700 mt-1">
                      Defined {post.daysSinceUpdate} days ago - needs results
                    </p>
                  </div>
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">Stale</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Needs Next Action */}
        {todos.needsNextAction.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-green-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              Plan Next Steps ({todos.needsNextAction.length})
            </h3>
            <div className="space-y-2">
              {todos.needsNextAction.map(post => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <div className="flex-1">
                    <Link to={`/garden/${post.id}`} className="font-medium text-green-900 hover:underline">
                      {post.title}
                    </Link>
                    <p className="text-sm text-green-700 mt-1">Results logged - define next action</p>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Complete</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total tasks: {totalTodos}</span>
          <span>Private posts: {privatePosts.length}</span>
        </div>
      </div>
    </div>
  );
} 