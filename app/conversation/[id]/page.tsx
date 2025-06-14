"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import Cookies from "js-cookie";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import CodeBlock from "@/components/CodeBlock";
import "katex/dist/katex.min.css";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ChatMessageProps {
  content: string;
}

const UserChatMessage = ({ content }: ChatMessageProps) => {
  return (
    <div className="prose max-w-none prose-headings:text-primary-foreground prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-code:bg-primary-foreground/10 prose-code:text-primary-foreground prose-pre:bg-primary-foreground/10 prose-pre:border prose-pre:border-primary-foreground/20 prose-blockquote:text-primary-foreground/80 prose-blockquote:border-l-primary-foreground/30 prose-hr:border-primary-foreground/30 prose-lead:text-primary-foreground/80 prose-a:text-primary-foreground prose-a:underline hover:prose-a:text-primary-foreground/80 prose-th:text-primary-foreground prose-td:text-primary-foreground prose-li:text-primary-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

const AssistantChatMessage = React.memo(({ content }: ChatMessageProps) => {
  // Memoize the components object to prevent ReactMarkdown from re-rendering
  const markdownComponents = React.useMemo(
    () => ({
      pre({ children }: React.HTMLProps<HTMLPreElement>) {
        return <div className="not-prose">{children}</div>;
      },
      code({ className, children, ...props }: React.HTMLProps<HTMLElement>) {
        const match = /language-(\w+)/.exec(className || "");
        const codeString = String(children).replace(/\n$/, "");

        return match ? (
          <CodeBlock language={match[1]} code={codeString} />
        ) : (
          <code
            className="bg-muted text-foreground px-1.5 py-0.5 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      },
    }),
    [],
  );

  return (
    <div className="prose dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:text-muted-foreground prose-blockquote:border-l-border prose-hr:border-border prose-lead:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-th:text-foreground prose-td:text-foreground prose-li:text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

AssistantChatMessage.displayName = "AssistantChatMessage";

const getModelIcon = (provider: string, author: string) => {
  if (
    provider === "openrouter" &&
    (author.toLowerCase().includes("openai") || author === "OpenAI")
  ) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center">
        <svg
          className="w-7 h-7 text-foreground"
          fill="currentColor"
          viewBox="0 0 721 721"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M304.246 294.611V249.028C304.246 245.189 305.687 242.309 309.044 240.392L400.692 187.612C413.167 180.415 428.042 177.058 443.394 177.058C500.971 177.058 537.44 221.682 537.44 269.182C537.44 272.54 537.44 276.379 536.959 280.218L441.954 224.558C436.197 221.201 430.437 221.201 424.68 224.558L304.246 294.611ZM518.245 472.145V363.224C518.245 356.505 515.364 351.707 509.608 348.349L389.174 278.296L428.519 255.743C431.877 253.826 434.757 253.826 438.115 255.743L529.762 308.523C556.154 323.879 573.905 356.505 573.905 388.171C573.905 424.636 552.315 458.225 518.245 472.141V472.145ZM275.937 376.182L236.592 353.152C233.235 351.235 231.794 348.354 231.794 344.515V238.956C231.794 187.617 271.139 148.749 324.4 148.749C344.555 148.749 363.264 155.468 379.102 167.463L284.578 222.164C278.822 225.521 275.942 230.319 275.942 237.039V376.186L275.937 376.182ZM360.626 425.122L304.246 393.455V326.283L360.626 294.616L417.002 326.283V393.455L360.626 425.122ZM396.852 570.989C376.698 570.989 357.989 564.27 342.151 552.276L436.674 497.574C442.431 494.217 445.311 489.419 445.311 482.699V343.552L485.138 366.582C488.495 368.499 489.936 371.379 489.936 375.219V480.778C489.936 532.117 450.109 570.985 396.852 570.985V570.989ZM283.134 463.99L191.486 411.211C165.094 395.854 147.343 363.229 147.343 331.562C147.343 294.616 169.415 261.509 203.48 247.593V356.991C203.48 363.71 206.361 368.508 212.117 371.866L332.074 441.437L292.729 463.99C289.372 465.907 286.491 465.907 283.134 463.99ZM277.859 542.68C223.639 542.68 183.813 501.895 183.813 451.514C183.813 447.675 184.294 443.836 184.771 439.997L279.295 494.698C285.051 498.056 290.812 498.056 296.568 494.698L417.002 425.127V470.71C417.002 474.549 415.562 477.429 412.204 479.346L320.557 532.126C308.081 539.323 293.206 542.68 277.854 542.68H277.859ZM396.852 599.776C454.911 599.776 503.37 558.513 514.41 503.812C568.149 489.896 602.696 439.515 602.696 388.176C602.696 354.587 588.303 321.962 562.392 298.45C564.791 288.373 566.231 278.296 566.231 268.224C566.231 199.611 510.571 148.267 446.274 148.267C433.322 148.267 420.846 150.184 408.37 154.505C386.775 133.392 357.026 119.958 324.4 119.958C266.342 119.958 217.883 161.22 206.843 215.921C153.104 229.837 118.557 280.218 118.557 331.557C118.557 365.146 132.95 397.771 158.861 421.283C156.462 431.36 155.022 441.437 155.022 451.51C155.022 520.123 210.682 571.466 274.978 571.466C287.931 571.466 300.407 569.549 312.883 565.228C334.473 586.341 364.222 599.776 396.852 599.776Z" />
        </svg>
      </div>
    );
  }

  // Check for Google/Gemini models
  if (provider === "google" || author === "Google") {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center">
        <svg
          className="w-6 h-6 text-foreground"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" />
        </svg>
      </div>
    );
  }

  // Check for Anthropic/Claude models
  if (provider === "anthropic" || author === "Anthropic") {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center">
        <svg
          className="w-6 h-6 text-foreground"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
        </svg>
      </div>
    );
  }

  // Default AI icon
  return (
    <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center">
      <svg
        className="w-5 h-5 text-foreground"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    </div>
  );
};

export default function ConversationPage() {
  const { user } = useUser();
  const { id } = useParams();
  const conversationId = id as Id<"conversations">;
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get("message") ?? "";
  const router = useRouter();
  const [FirstLoad, setFirstLoad] = useState(true);
  const { mounted: colorSchemeMounted } = useColorScheme();

  const userId = user?.id;

  // Fetch user conversations to verify the requested conversation exists
  const conversations = useQuery(
    api.conversations.GetConversations,
    userId ? { user: userId } : ("skip" as const),
  );

  const conversationAccessible = Boolean(
    userId &&
      conversations &&
      conversations.find((c) => c._id === conversationId),
  );

  const {
    results: messages,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.conversations.GetMessagesPaginatedWithModels,
    conversationAccessible
      ? {
          user: userId as string,
          conversation: conversationId,
        }
      : ("skip" as const),
    {
      initialNumItems: 7,
    },
  );

  const [message, setMessage] = useState(initialMessage);
  const generateMessageMutation = useMutation(api.generate.generateMessage);
  const loading = status === "LoadingFirstPage";

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const autoFillTriggeredRef = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (
      prevScrollHeightRef.current &&
      container.scrollHeight > prevScrollHeightRef.current
    ) {
      const diff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop = diff;
      prevScrollHeightRef.current = 0;
    } else {
      if (bottomRef.current && messages.length > 0 && FirstLoad) {
        setFirstLoad(false);
        bottomRef.current.scrollIntoView({ behavior: "auto" });
      }
    }
  }, [messages, FirstLoad]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (
      container.scrollTop <= 0 &&
      status === "CanLoadMore" &&
      prevScrollHeightRef.current === 0
    ) {
      prevScrollHeightRef.current = container.scrollHeight;
      loadMore(5);
    }
  }, [status, loadMore]);

  const generateMessage = useCallback(async () => {
    if (!message.trim() || !user?.id) return;

    const model = Cookies.get("model") || "google/gemini-2.0-flash-001";
    if (!Cookies.get("model")) {
      Cookies.set("model", model);
    }

    await generateMessageMutation({
      user: user.id,
      content: message.trim(),
      model: model as Id<"models">,
      conversation: conversationId,
    });
    setMessage("");
  }, [message, user?.id, generateMessageMutation, conversationId]);

  const initialMessageSentRef = useRef(false);
  useEffect(() => {
    if (
      !initialMessageSentRef.current &&
      initialMessage &&
      user?.id &&
      message === initialMessage
    ) {
      initialMessageSentRef.current = true;
      generateMessage();
      router.replace(`/conversation/${conversationId}`);
    }
  }, [
    initialMessage,
    user?.id,
    generateMessage,
    conversationId,
    router,
    message,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (
      container.scrollHeight <= container.clientHeight &&
      status === "CanLoadMore"
    ) {
      autoFillTriggeredRef.current = true;
      loadMore(5);
    }
  }, [messages, status, loadMore]);

  useEffect(() => {
    if (!autoFillTriggeredRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    if (container.scrollHeight > container.clientHeight) {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "auto" });
      }
      autoFillTriggeredRef.current = false;
    }
  }, [messages]);

  // Redirect to home if conversation is not accessible when conversations loaded
  useEffect(() => {
    if (userId && conversations && !conversationAccessible) {
      router.replace("/");
    }
  }, [userId, conversations, conversationAccessible, router]);

  if (!(user?.id && conversationId)) {
    useEffect(() => {
      router.replace("/");
    }, [router]);
    return null;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-foreground">
            Please sign in
          </h2>
          <p className="text-muted-foreground">
            You need to be signed in to view this conversation.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !colorSchemeMounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {!messages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm">
                Loading conversation...
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Start a conversation
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Send your first message to begin chatting with the AI assistant.
                Ask questions, get help with coding, or have a conversation
                about anything.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages
              .slice()
              .reverse()
              .map((msg) => (
                <div
                  key={msg._id}
                  className={`${
                    msg.role === "user" ? "" : "bg-background"
                  }`}
                >
                  {msg.role === "user" ? (
                    // User message with bubble styling
                    <div className="px-6 py-8">
                      <div className="flex items-start justify-end space-x-4">
                        <div className="flex flex-col items-end max-w-[80%]">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg._creationTime).toLocaleTimeString()}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              You
                            </span>
                          </div>
                          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
                            <UserChatMessage content={msg.content} />
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {user?.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt="User avatar"
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-sm font-medium">
                                {user?.firstName?.charAt(0) ||
                                  user?.emailAddresses?.[0]?.emailAddress?.charAt(
                                    0,
                                  ) ||
                                  "U"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Assistant message with original styling
                    <div className="px-6 py-8">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getModelIcon(
                            msg.model.provider,
                            msg.model.author,
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-foreground">
                              {msg.model.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg._creationTime).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-foreground leading-relaxed">
                            <AssistantChatMessage content={msg.content} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
