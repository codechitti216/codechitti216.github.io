import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { getContentBySlug } from '../lib/content';
import 'katex/dist/katex.min.css';

export default function NoteDetail() {
  const { id } = useParams();
  const content = useMemo(() => getContentBySlug(id), [id]);

  if (!content) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Not found.</p>
        <Link to="/notes" className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-900">
          &larr; Back
        </Link>
      </div>
    );
  }

  // Fix image paths: replace relative paths like ../../public/assets/ with /assets/
  const processedBody = content.body
    .replace(/\(\.\.\/\.\.\/public\//g, '(/')
    .replace(/src="\.\.\/\.\.\/public\//g, 'src="/');

  return (
    <div className="py-8">
      {/* Back link */}
      <Link to="/notes" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
        &larr; back to work
      </Link>

      {/* Header */}
      <div className="mt-6 mb-8 space-y-3">

        <h1 className="font-serif text-2xl font-semibold text-gray-900 leading-tight">
          {content.title}
        </h1>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {content.date && (
            <time>{new Date(content.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
          )}
        </div>
      </div>

      {/* Markdown body */}
      <article className="prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
          components={{
            img: ({ src, alt, ...props }) => (
              <figure className="my-6">
                <img
                  src={src}
                  alt={alt}
                  className="rounded-lg border border-gray-100 w-full"
                  loading="lazy"
                  {...props}
                />
                {alt && (
                  <figcaption className="mt-2 text-xs text-gray-500 text-center italic">
                    {alt}
                  </figcaption>
                )}
              </figure>
            ),
            a: ({ href, children, ...props }) => (
              <a
                href={href}
                className="text-gray-700 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-700 transition-colors"
                target={href && href.startsWith('http') ? '_blank' : undefined}
                rel={href && href.startsWith('http') ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            ),
            h1: ({ children }) => (
              <h1 className="font-serif text-2xl font-semibold text-gray-900 mt-10 mb-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-serif text-xl font-semibold text-gray-900 mt-8 mb-3">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-serif text-lg font-medium text-gray-800 mt-6 mb-2">{children}</h3>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="w-full text-sm border-collapse">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="text-left px-3 py-2 border-b-2 border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{children}</td>
            ),
          }}
        >
          {processedBody}
        </ReactMarkdown>
      </article>
    </div>
  );
}
