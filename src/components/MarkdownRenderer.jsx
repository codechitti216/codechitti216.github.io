import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

const MarkdownRenderer = ({ content }) => {
  // Get the base URL for deployment (handles both local and production)
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // Pre-process content to handle image paths for deployment
  const processedContent = content;
  
  // Custom components to handle images with proper error handling
  const components = {
    img: ({ src, alt, ...props }) => {
      // Multiple fallback strategies for image paths
      let imageSrc = src;
      
      if (src?.startsWith('/assets/')) {
        // Already correct format - keep as is
        imageSrc = src;
      } else if (src?.startsWith('assets/')) {
        // Missing leading slash - add it
        imageSrc = `/${src}`;
      } else if (src?.includes('public/assets/')) {
        // Legacy path format - convert to /assets/
        imageSrc = src.replace(/.*public\/assets\//, '/assets/');
      } else if (src && !src.startsWith('http')) {
        // Relative path - assume it should be in assets
        imageSrc = `/assets/${src.replace(/^\.\//, '')}`;
      }
      
      // For debugging - log the image source resolution
      console.log(`Image path resolved: ${src} → ${imageSrc}`);
      
      return (
        <img 
          src={imageSrc} 
          alt={alt} 
          {...props}
          onError={(e) => {
            console.warn(`Failed to load image: ${imageSrc}`);
            console.log(`Original src: ${src}, Resolved src: ${imageSrc}`);
            e.target.style.border = '2px dashed #ccc';
            e.target.style.backgroundColor = '#f9f9f9';
            e.target.title = `Image failed to load: ${imageSrc}`;
          }}
        />
      );
    },
    video: ({ src, children, ...props }) => {
      // Handle video sources with same logic as images
      let videoSrc = src;
      
      if (src?.startsWith('/assets/')) {
        videoSrc = src;
      } else if (src?.startsWith('assets/')) {
        videoSrc = `/${src}`;
      } else if (src?.includes('public/assets/')) {
        videoSrc = src.replace(/.*public\/assets\//, '/assets/');
      } else if (src && !src.startsWith('http')) {
        videoSrc = `/assets/${src.replace(/^\.\//, '')}`;
      }
      
      console.log(`Video path resolved: ${src} → ${videoSrc}`);
      
      return (
        <video 
          {...props}
          onError={(e) => {
            console.warn(`Failed to load video: ${videoSrc}`);
            e.target.style.border = '2px dashed #ff6b6b';
            e.target.style.backgroundColor = '#ffe6e6';
          }}
          onLoadStart={() => {
            console.log(`Video loading started: ${videoSrc}`);
          }}
        >
          <source src={videoSrc} type="video/mp4" />
          {children || <p>Your browser does not support the video tag. <a href={videoSrc} target="_blank">Download the video</a></p>}
        </video>
      );
    },
    source: ({ src, ...props }) => {
      // Handle source elements within videos
      let sourceSrc = src;
      
      if (src?.startsWith('/assets/')) {
        sourceSrc = src;
      } else if (src?.startsWith('assets/')) {
        sourceSrc = `/${src}`;
      } else if (src?.includes('public/assets/')) {
        sourceSrc = src.replace(/.*public\/assets\//, '/assets/');
      } else if (src && !src.startsWith('http')) {
        sourceSrc = `/assets/${src.replace(/^\.\//, '')}`;
      }
      
      console.log(`Source path resolved: ${src} → ${sourceSrc}`);
      
      return <source src={sourceSrc} {...props} />;
    }
  };

  return (
    <ReactMarkdown
      children={processedContent}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={components}
    />
  );
};

export default MarkdownRenderer; 