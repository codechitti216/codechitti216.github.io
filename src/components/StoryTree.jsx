import { useState, useCallback } from 'react';

function youtubeTimestampUrl(videoId, timestamp) {
  if (!videoId || !timestamp) return null;
  const parts = timestamp.split(':').map(Number);
  let seconds = 0;
  if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
  else seconds = parts[0];
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}`;
}

function TreeNode({ node, nodes, depth = 0, isLast = true, parentLines = [] }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const children = (node.children || []).map(id => nodes.find(n => n.id === id)).filter(Boolean);
  const hasChildren = children.length > 0;
  const refUrl = node.ref ? youtubeTimestampUrl(node.ref.video, node.ref.t) : null;

  return (
    <div className="select-none">
      {/* Node */}
      <div
        className="group flex items-start gap-2 cursor-pointer py-1.5"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Tree lines */}
        <div className="flex items-center shrink-0 mt-1">
          {depth > 0 && (
            <span className="text-gray-200 text-xs font-mono w-4 text-center">
              {isLast ? '└' : '├'}
            </span>
          )}
          {hasChildren && (
            <span className="text-gray-300 text-xs font-mono w-4 text-center">
              {expanded ? '▾' : '▸'}
            </span>
          )}
          {!hasChildren && depth > 0 && (
            <span className="w-4" />
          )}
        </div>

        {/* Label */}
        <div className="min-w-0">
          <span className={`text-sm font-medium ${hasChildren ? 'text-gray-900 group-hover:text-gray-600' : 'text-gray-700'} transition-colors`}>
            {node.label}
          </span>
        </div>
      </div>

      {/* Content (always visible if node is expanded or has no children) */}
      {(expanded || !hasChildren) && node.content && (
        <div className={`ml-${depth > 0 ? '8' : '4'} mb-2`} style={{ marginLeft: depth > 0 ? '2rem' : '1rem' }}>
          <p className="text-sm text-gray-600 leading-relaxed">
            {node.content}
          </p>
          {refUrl && (
            <a
              href={refUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-gray-300 hover:text-gray-600 transition-colors mt-1 inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              ▶ {node.ref.t}
            </a>
          )}
        </div>
      )}

      {/* Children */}
      {expanded && hasChildren && (
        <div style={{ marginLeft: depth > 0 ? '1.25rem' : '0.5rem' }}>
          {children.map((child, i) => (
            <TreeNode
              key={child.id}
              node={child}
              nodes={nodes}
              depth={depth + 1}
              isLast={i === children.length - 1}
              parentLines={[...parentLines, !isLast]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StoryTree({ story }) {
  if (!story || !story.nodes || story.nodes.length === 0) return null;

  // Find root nodes (nodes that aren't children of any other node)
  const allChildIds = new Set(story.nodes.flatMap(n => n.children || []));
  const roots = story.nodes.filter(n => !allChildIds.has(n.id));

  return (
    <div className="py-4">
      <div className="space-y-1">
        {roots.map((root, i) => (
          <TreeNode
            key={root.id}
            node={root}
            nodes={story.nodes}
            depth={0}
            isLast={i === roots.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
