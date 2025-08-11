import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

const MarkdownRenderer = ({ content }) => {
  // Custom components to handle images with proper error handling
  const components = {
    img: ({ src, alt, ...props }) => {
      // Ensure images use absolute paths from /assets/
      const imageSrc = src?.startsWith('/assets/') ? src : 
                      src?.startsWith('assets/') ? `/${src}` :
                      src?.includes('public/assets/') ? src.replace(/.*public\/assets\//, '/assets/') :
                      src;
      
      return (
        <img 
          src={imageSrc} 
          alt={alt} 
          {...props}
          onError={(e) => {
            console.warn(`Failed to load image: ${imageSrc}`);
            e.target.style.border = '2px dashed #ccc';
            e.target.style.backgroundColor = '#f9f9f9';
          }}
        />
      );
    },
    video: ({ src, ...props }) => {
      // Handle video sources similarly
      const videoSrc = src?.startsWith('/assets/') ? src : 
                      src?.startsWith('assets/') ? `/${src}` :
                      src?.includes('public/assets/') ? src.replace(/.*public\/assets\//, '/assets/') :
                      src;
      
      return (
        <video {...props}>
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
  };

  return (
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={components}
    />
  );
};

export default MarkdownRenderer; 