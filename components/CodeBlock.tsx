"use client";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState, useMemo } from "react";
import React from "react";

const registeredLanguages = new Set<string>();

const highlightedCache = new Map<string, React.ReactElement>();

type LanguageDefinition = {
  default: (prism: unknown) => void;
};

const languageLoaders: Record<string, () => Promise<LanguageDefinition>> = {
  javascript: () => import("react-syntax-highlighter/dist/esm/languages/prism/javascript"),
  js: () => import("react-syntax-highlighter/dist/esm/languages/prism/javascript"),
  typescript: () => import("react-syntax-highlighter/dist/esm/languages/prism/typescript"),
  ts: () => import("react-syntax-highlighter/dist/esm/languages/prism/typescript"),
  jsx: () => import("react-syntax-highlighter/dist/esm/languages/prism/jsx"),
  tsx: () => import("react-syntax-highlighter/dist/esm/languages/prism/tsx"),
  
  // Python
  python: () => import("react-syntax-highlighter/dist/esm/languages/prism/python"),
  py: () => import("react-syntax-highlighter/dist/esm/languages/prism/python"),
  
  // Shell/Bash
  bash: () => import("react-syntax-highlighter/dist/esm/languages/prism/bash"),
  sh: () => import("react-syntax-highlighter/dist/esm/languages/prism/bash"),
  shell: () => import("react-syntax-highlighter/dist/esm/languages/prism/bash"),
  
  // Rust
  rust: () => import("react-syntax-highlighter/dist/esm/languages/prism/rust"),
  rs: () => import("react-syntax-highlighter/dist/esm/languages/prism/rust"),
  
  // Go
  go: () => import("react-syntax-highlighter/dist/esm/languages/prism/go"),
  golang: () => import("react-syntax-highlighter/dist/esm/languages/prism/go"),
  
  // Java family
  java: () => import("react-syntax-highlighter/dist/esm/languages/prism/java"),
  kotlin: () => import("react-syntax-highlighter/dist/esm/languages/prism/kotlin"),
  kt: () => import("react-syntax-highlighter/dist/esm/languages/prism/kotlin"),
  scala: () => import("react-syntax-highlighter/dist/esm/languages/prism/scala"),
  
  // C family
  c: () => import("react-syntax-highlighter/dist/esm/languages/prism/c"),
  cpp: () => import("react-syntax-highlighter/dist/esm/languages/prism/cpp"),
  "c++": () => import("react-syntax-highlighter/dist/esm/languages/prism/cpp"),
  csharp: () => import("react-syntax-highlighter/dist/esm/languages/prism/csharp"),
  cs: () => import("react-syntax-highlighter/dist/esm/languages/prism/csharp"),
  "c#": () => import("react-syntax-highlighter/dist/esm/languages/prism/csharp"),
  
  // Web languages
  html: () => import("react-syntax-highlighter/dist/esm/languages/prism/markup"),
  xml: () => import("react-syntax-highlighter/dist/esm/languages/prism/markup"),
  markup: () => import("react-syntax-highlighter/dist/esm/languages/prism/markup"),
  css: () => import("react-syntax-highlighter/dist/esm/languages/prism/css"),
  scss: () => import("react-syntax-highlighter/dist/esm/languages/prism/scss"),
  sass: () => import("react-syntax-highlighter/dist/esm/languages/prism/sass"),
  
  // Other popular languages
  php: () => import("react-syntax-highlighter/dist/esm/languages/prism/php"),
  ruby: () => import("react-syntax-highlighter/dist/esm/languages/prism/ruby"),
  rb: () => import("react-syntax-highlighter/dist/esm/languages/prism/ruby"),
  swift: () => import("react-syntax-highlighter/dist/esm/languages/prism/swift"),
  
  // Data formats
  json: () => import("react-syntax-highlighter/dist/esm/languages/prism/json"),
  yaml: () => import("react-syntax-highlighter/dist/esm/languages/prism/yaml"),
  yml: () => import("react-syntax-highlighter/dist/esm/languages/prism/yaml"),
  toml: () => import("react-syntax-highlighter/dist/esm/languages/prism/toml"),
  
  // Database
  sql: () => import("react-syntax-highlighter/dist/esm/languages/prism/sql"),
  
  // Documentation
  markdown: () => import("react-syntax-highlighter/dist/esm/languages/prism/markdown"),
  md: () => import("react-syntax-highlighter/dist/esm/languages/prism/markdown"),
  
  // DevOps
  dockerfile: () => import("react-syntax-highlighter/dist/esm/languages/prism/docker"),
  docker: () => import("react-syntax-highlighter/dist/esm/languages/prism/docker"),
  
  // Other
  r: () => import("react-syntax-highlighter/dist/esm/languages/prism/r"),
  matlab: () => import("react-syntax-highlighter/dist/esm/languages/prism/matlab"),
  lua: () => import("react-syntax-highlighter/dist/esm/languages/prism/lua"),
  perl: () => import("react-syntax-highlighter/dist/esm/languages/prism/perl"),
  vim: () => import("react-syntax-highlighter/dist/esm/languages/prism/vim"),
};

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

const CodeBlock = React.memo(function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [ready, setReady] = useState<boolean>(false);
  
  const cacheKey = useMemo(() => `${language}:${code}:${className || ''}`, [language, code, className]);

  useEffect(() => {
    if (registeredLanguages.has(language)) {
      setReady(true);
      return;
    }

    if (!language || !languageLoaders[language]) {
      setReady(true);
      return;
    }

    languageLoaders[language]().then((mod) => {
      if (!registeredLanguages.has(language) && mod.default) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        (SyntaxHighlighter as any).registerLanguage(language, mod.default);
        registeredLanguages.add(language);
      }
      setReady(true);
    }).catch((error) => {
      console.warn(`Failed to load language '${language}':`, error);
      setReady(true);
    });
  }, [language]);

  const content = useMemo(() => {
    const cachedVersion = highlightedCache.get(cacheKey);
    if (cachedVersion) {
      return cachedVersion;
    }

    if (!ready) {
      return (
        <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className ?? ""}`}>
          <code className="text-sm">{code}</code>
        </div>
      );
    }

    const highlightedElement = (
      <SyntaxHighlighter
        style={oneLight}
        language={registeredLanguages.has(language) ? language : undefined}
        PreTag="div"
        className={className}
        showLineNumbers={false}
        wrapLines={true}
        customStyle={{
          margin: 0,
          padding: '1rem',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    );

    highlightedCache.set(cacheKey, highlightedElement);
    
    return highlightedElement;
  }, [ready, language, code, className, cacheKey]);

  return content;
});

export default CodeBlock; 