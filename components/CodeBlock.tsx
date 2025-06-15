"use client";

import { codeToHtml } from "shiki";
import React, { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CodeBlockProps {
  code: string;
  language: string;
}

const highlightCache = new Map<string, string>();

const getShikiTheme = (colorScheme: string, isDark: boolean) => {
  const themeMap = {
    default: isDark ? "github-dark" : "github-light",
    gruvbox: isDark ? "gruvbox-dark-medium" : "gruvbox-light-medium",
    catpuccin: isDark ? "catppuccin-mocha" : "catppuccin-latte",
    nord: isDark ? "nord" : "catppuccin-latte",
    t3: isDark ? "rose-pine" : "rose-pine-dawn", // Use GitHub theme for T3 (clean and modern)
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
  const [isHighlighting, setIsHighlighting] = useState<boolean>(false);

  useEffect(() => {
    if (cachedResult) {
      setHighlightedHtml(cachedResult);
      setIsHighlighting(false);
      return;
    }

    if (!mounted) {
      return;
    }

    // Only show loading state if we don't have any previous content
    if (!highlightedHtml) {
      setIsHighlighting(true);
    }

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

        // Post-process HTML for t3 theme to use sidebar background
        const processedHtml =
          colorScheme === "t3" && resolvedTheme !== "dark"
            ? html.replace(
                /background-color:[^;"]*/g,
                "background-color:rgb(245, 237, 250)",
              )
            : html;

        highlightCache.set(cacheKey, processedHtml);
        setHighlightedHtml(processedHtml);
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
          setIsHighlighting(false);
        } catch (fallbackError) {
          console.error("Fallback highlighting also failed:", fallbackError);
          const fallbackHtml = `<pre class="shiki-code-block"><code>${code}</code></pre>`;
          highlightCache.set(cacheKey, fallbackHtml);
          setHighlightedHtml(fallbackHtml);
          setIsHighlighting(false);
        }
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
    highlightedHtml,
  ]);

  // Always render the highlighted version if we have content, or show fallback only if we're not highlighting
  if (highlightedHtml || !isHighlighting) {
    return (
      <div className="not-prose my-4">
        <div className="rounded-lg overflow-hidden bg-card border border-border">
          <div className="bg-sidebar px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {language || "text"}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  toast.success("Copied to clipboard");
                }}
                title="Copy code"
              >
                <Copy />
              </Button>
            </div>
          </div>
          {highlightedHtml ? (
            <div
              className="[&_pre]:m-0 [&_pre]:p-4 [&_pre]:bg-muted/30 [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:overflow-x-auto [&_code]:bg-transparent"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <div className="[&_pre]:m-0 [&_pre]:p-4 [&_pre]:bg-muted/30 [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:overflow-x-auto [&_code]:bg-transparent">
              <pre className="shiki-code-block m-0 p-4 bg-muted/30 text-sm leading-relaxed overflow-x-auto">
                <code className="bg-transparent text-foreground/80 font-mono block whitespace-pre-wrap">
                  {code}
                </code>
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Return null if we're highlighting and don't have content yet (prevents flash)
  return null;
});

export default CodeBlock;
