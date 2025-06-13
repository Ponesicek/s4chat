"use client";

import { codeToHtml } from 'shiki'
import React, { useEffect, useState, useMemo } from "react";

interface CodeBlockProps {
  code: string;
  language: string;
}

// Global cache for highlighted code
const highlightCache = new Map<string, string>();

const CodeBlock = React.memo(function CodeBlock({ code, language }: CodeBlockProps) {
  // Create a unique cache key based on code content and language
  const cacheKey = useMemo(() => {
    return `${language || 'text'}:${code}`;
  }, [code, language]);

  // Check cache synchronously during initialization to prevent flicker
  const cachedResult = highlightCache.get(cacheKey);
  
  const [highlightedHtml, setHighlightedHtml] = useState<string>(cachedResult || '');

  useEffect(() => {
    // If we already have cached content, no need to process
    if (cachedResult) {
      return;
    }

    const highlightCode = async () => {
      try {
        const html = await codeToHtml(code, {
          lang: language || 'text',
          theme: 'github-light',
          transformers: [
            {
              pre(node) {
                // Remove default styles and add our classes
                this.addClassToHast(node, 'shiki-code-block');
              }
            }
          ]
        });
        
        // Cache the result
        highlightCache.set(cacheKey, html);
        setHighlightedHtml(html);
      } catch (error) {
        console.warn(`Failed to highlight code with language '${language}':`, error);
        // Fallback to plain text if highlighting fails
        const fallbackHtml = `<pre class="shiki-code-block"><code>${code}</code></pre>`;
        highlightCache.set(cacheKey, fallbackHtml);
        setHighlightedHtml(fallbackHtml);
      }
    };

    highlightCode();
  }, [code, language, cacheKey, cachedResult]);

  // If we have highlighted content (either cached or newly processed), show it
  if (highlightedHtml) {
    return (
      <div className="not-prose my-4">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header with language name */}
          <div className="bg-purple-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700">
              {language || 'text'}
            </span>
            <div className="flex items-center space-x-2">
              <button 
                className="text-purple-600 hover:text-purple-800 transition-colors"
                onClick={() => navigator.clipboard.writeText(code)}
                title="Copy code"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          {/* Code content with proper styling */}
          <div 
            className="[&_pre]:m-0 [&_pre]:p-4 [&_pre]:bg-gray-50 [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:overflow-x-auto [&_code]:bg-transparent"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
          />
        </div>
      </div>
    );
  }

  // Show loading state only for non-cached content
  return (
    <div className="not-prose my-4">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header with language name */}
        <div className="bg-purple-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-purple-700">
            {language || 'text'}
          </span>
          <div className="flex items-center space-x-2">
            <button className="text-purple-600 hover:text-purple-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        {/* Loading content */}
        <div className="bg-gray-50 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Highlighting code...</span>
          </div>
          <code className="text-sm font-mono text-gray-600 block whitespace-pre-wrap">{code}</code>
        </div>
      </div>
    </div>
  );
});

export default CodeBlock; 

