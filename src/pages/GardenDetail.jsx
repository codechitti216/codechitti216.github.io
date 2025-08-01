import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { loadGardenPosts } from '../lib/loadGarden';

import MarkdownRenderer from '../components/MarkdownRenderer';
import { useInnerCircleAccess } from '../components/AccessControl';
import { LogResultForm } from '../components/LogResultForm';
import { WeeklyTodos } from '../components/WeeklyTodos';

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



function ResearchProgress({ post }) {
  // For learning posts, show a different UI
  if (post.kind === 'learning') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Learning Journal</h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            Learning
          </span>
        </div>
        
        <div className="flex items-start">
          <svg className="w-5 h-5 text-purple-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="text-purple-800 font-medium text-sm mb-1">Exploratory Notes</div>
            <div className="text-purple-700 text-sm">
              This is a learning journal entry. I use it to explore ideas and insights without any pressure of formal research validation.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For research posts, show the full checklist
  const checklist = [
    { 
      label: 'Hypothesis', 
      done: !!post.hypothesis,
      description: post.hypothesis || 'No hypothesis defined'
    },
    { 
      label: 'Experiment defined', 
      done: post.experiment.defined,
      description: post.experiment.description || 'No experiment description'
    },
    { 
      label: 'Results executed', 
      done: post.results.executed,
      description: post.results.summary || 'No results logged'
    },
    { 
      label: 'Outcome documented', 
      done: !!post.results.outcome,
      description: post.results.outcome || 'No outcome recorded'
    }
  ];

  const completedCount = checklist.filter(item => item.done).length;
  const progressPercentage = (completedCount / checklist.length) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Research Progress</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(post.status)}`}>
          {post.status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{completedCount}/{checklist.length} complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {checklist.map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
              item.done 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300'
            }`}>
              {item.done && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className={`font-medium ${item.done ? 'text-gray-900' : 'text-gray-700'}`}>
                {item.label}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staleness warning - Only show in private view */}
      {post.isStale && !post.published && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-800 font-medium">
              Experiment defined {post.daysSinceUpdate} days ago but no results logged
            </span>
          </div>
        </div>
      )}

      {/* Next action - Only show in private view */}
      {post.next_action && !post.published && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-4-4a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-blue-800 font-medium mb-1">Next Action</div>
              <div className="text-blue-700 text-sm">{post.next_action}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GardenDetail() {
  const { id } = useParams();
  const posts = loadGardenPosts();
  const post = posts.find((p) => p.id === id);
  const { hasAccess: isInnerCircle } = useInnerCircleAccess();

  if (!post) {
    return (
      <div className="container">
        <h1 className="text-2xl font-bold text-red-600">Post not found</h1>
        <p className="text-gray-600">No garden entry found for "{id}".</p>
      </div>
    );
  }

  return (
    <article className="container prose max-w-none">
      <h1>{post.title}</h1>
      <p className="text-sm text-gray-500">{post.date}</p>
      <div className="mb-4">
        {post.tags.map((tag) => (
          <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
            {tag}
          </span>
        ))}
      </div>

      {/* Research Progress Component */}
      <ResearchProgress post={post} />

      {/* Promotion Controls (Inner Circle Only) - Only show for private posts */}
      {!post.published && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Publication Status</h2>
              <p className="text-sm text-gray-600">
                This post is private (inner circle only)
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Private
              </span>
              <button
                onClick={() => {
                  // TODO: Implement actual promotion logic
                  alert('Promotion functionality will be implemented in Phase 3 with inner circle access');
                }}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                Promote to Public
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inner Circle Components */}
      {isInnerCircle && !post.published && (
        <>
          {/* Log Result Form */}
          <LogResultForm post={post} />
          
          {/* Weekly TODOs */}
          <WeeklyTodos />
        </>
      )}



      {/* Evolution Timeline */}
      {post.evolution && post.evolution.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Idea Evolution</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <ul className="space-y-3">
              {post.evolution.map(({ date, note }, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{date}</div>
                    <div className="text-gray-700">{note}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Archived Reason */}
      {post.status === 'archived' && post.archived_reason && (
        <section className="mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-gray-800 font-medium mb-1">Archived</div>
                <div className="text-gray-600 text-sm">{post.archived_reason}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <MarkdownRenderer content={post.content} />
    </article>
  );
}

