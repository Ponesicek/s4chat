"use client";

import { codeToHtml } from "shiki";
import React, { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface CodeBlockProps {
  code: string;
  language: string;
}

const highlightCache = new Map<string, string>();

const getShikiTheme = (colorScheme: string, isDark: boolean) => {
  const themeMap = {
    default: isDark ? "github-dark" : "github-light",
    gruvbox: isDark ? "gruvbox-dark-medium" : "gruvbox-light-medium",
    solarized: isDark ? "solarized-dark" : "solarized-light",
    catpuccin: isDark ? "catppuccin-mocha" : "catppuccin-latte",
    nord: isDark ? "nord" : "catppuccin-latte",
  };

  return (
    themeMap[colorScheme as keyof typeof themeMap] ||
    (isDark ? "github-dark" : "github-light")
  );
};

const CodeBlock = React.memo(function CodeBlock({
  code,
  language,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const { colorScheme, mounted } = useColorScheme();

  const cacheKey = useMemo(() => {
    // Always generate consistent cache keys, using fallback values when not mounted
    const effectiveColorScheme = mounted ? colorScheme : "default";
    const isDark = resolvedTheme === "dark";
    const shikiTheme = getShikiTheme(effectiveColorScheme, isDark);
    return `${language || "text"}:${shikiTheme}:${code}`;
  }, [code, language, resolvedTheme, colorScheme, mounted]);

  const cachedResult = highlightCache.get(cacheKey);

  const [highlightedHtml, setHighlightedHtml] = useState<string>(
    cachedResult || "",
  );
  const [isHighlighting, setIsHighlighting] = useState(false);

  useEffect(() => {
    if (cachedResult) {
      setHighlightedHtml(cachedResult);
      setIsHighlighting(false);
      return;
    }

    if (!mounted) {
      setIsHighlighting(false);
      return;
    }

    setIsHighlighting(true);

    const highlightCode = async () => {
      try {
        const isDark = resolvedTheme === "dark";
        const shikiTheme = getShikiTheme(colorScheme, isDark);

        const html = await codeToHtml(code, {
          lang: language || "text",
          theme: shikiTheme,
          transformers: [
            {
              pre(node) {
                this.addClassToHast(node, "shiki-code-block");
              },
            },
          ],
        });

        highlightCache.set(cacheKey, html);
        setHighlightedHtml(html);
        setIsHighlighting(false);
      } catch (error) {
        console.warn(
          `Failed to highlight code with theme '${getShikiTheme(colorScheme, resolvedTheme === "dark")}' for language '${language}':`,
          error,
        );

        try {
          const fallbackTheme =
            resolvedTheme === "dark" ? "github-dark" : "github-light";

          const html = await codeToHtml(code, {
            lang: language || "text",
            theme: fallbackTheme,
            transformers: [
              {
                pre(node) {
                  this.addClassToHast(node, "shiki-code-block");
                },
              },
            ],
          });

          highlightCache.set(cacheKey, html);
          setHighlightedHtml(html);
        } catch (fallbackError) {
          console.error("Fallback highlighting also failed:", fallbackError);
          const fallbackHtml = `<pre class="shiki-code-block"><code>${code}</code></pre>`;
          highlightCache.set(cacheKey, fallbackHtml);
          setHighlightedHtml(fallbackHtml);
        }
        setIsHighlighting(false);
      }
    };

    highlightCode();
  }, [
    code,
    language,
    cacheKey,
    cachedResult,
    resolvedTheme,
    colorScheme,
    mounted,
  ]);

  if (highlightedHtml && mounted) {
    return (
      <div className="not-prose my-4">
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {language || "text"}
            </span>
            <div className="flex items-center space-x-2">
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => navigator.clipboard.writeText(code)}
                title="Copy code"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div
            className="[&_pre]:m-0 [&_pre]:p-4 [&_pre]:bg-muted/30 [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:overflow-x-auto [&_code]:bg-transparent"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="not-prose my-4">
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {language || "text"}
          </span>
          <div className="flex items-center space-x-2">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="bg-muted/30 p-4">
          {isHighlighting ? (
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">
                Highlighting code...
              </span>
            </div>
          ) : null}
          <code className="text-sm font-mono text-foreground/80 block whitespace-pre-wrap">
            {code}
          </code>
        </div>
      </div>
    </div>
  );
});

export default CodeBlock;
