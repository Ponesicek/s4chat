"use client";

import { useParams, useRouter } from "next/navigation";
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
import rehypeRaw from "rehype-raw";
import CodeBlock from "@/components/CodeBlock";
import "katex/dist/katex.min.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Image from "next/image";
import { getModelIcon } from "@/components/ModelIcon";
import { Button } from "@/components/ui/button";
import { ChevronDown, Copy, GitBranch, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface ChatMessageProps {
  content: string;
  isImage?: boolean;
  status?: {
    type: "pending" | "completed" | "error";
    message?: string;
  };
}

const ReasoningBox = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className="mb-3 bg-muted text-muted-foreground rounded-md p-2 prose prose-sm max-w-none prose-p:text-muted-foreground prose-p:my-1 hover:cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Reasoning</span>
        <ChevronDown className={`w-4 h-4 text-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>
      {isOpen && <div className="mt-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
      >
        {children as string}
      </ReactMarkdown>
        </div>}
    </div>
  );
};

const UserChatMessage = ({ content, isImage }: ChatMessageProps) => {
  const { user } = useUser();
  const userId = user?.id;
  // Fetch image data unconditionally to satisfy React hooks rules.
  const image = useQuery(
    api.conversations.GetImage,
    isImage ? { user: userId ?? "", image: content as Id<"_storage"> } : ("skip" as const),
  );

  if (isImage) {
    if (!image) {
      return null;
    }
    return (
      <Image
        src={image}
        alt="User image"
        width={500}
        height={500}
        className="max-w-50 max-h-50 object-contain"
      />
    );
  }
  return (
    <div className="prose max-w-none prose-headings:text-primary-foreground prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-code:bg-primary-foreground/10 prose-code:text-primary-foreground prose-pre:bg-primary-foreground/10 prose-pre:border prose-pre:border-primary-foreground/20 prose-blockquote:text-primary-foreground/80 prose-blockquote:border-l-primary-foreground/30 prose-hr:border-primary-foreground/30 prose-lead:text-primary-foreground/80 prose-a:text-primary-foreground prose-a:underline hover:prose-a:text-primary-foreground/80 prose-th:text-primary-foreground prose-td:text-primary-foreground prose-li:text-primary-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

const AssistantChatMessage = React.memo(({ content, status }: ChatMessageProps) => {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, [content]);

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
      reasoning() {
        return null;
      },
    }),
    [],
  );

  return (
    <div className="prose dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:text-muted-foreground prose-blockquote:border-l-border prose-hr:border-border prose-lead:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-th:text-foreground prose-td:text-foreground prose-li:text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={markdownComponents}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
      >
        {content}
      </ReactMarkdown>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="border-0 hover:bg-primary/10"
            onClick={handleCopy}
          >
              <Copy className="w-4 h-4 text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="border-0 hover:bg-primary/10"
          >
            <GitBranch className="w-4 h-4 text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="border-0 hover:bg-primary/10"
          >
            <RotateCcw className="w-4 h-4 text-foreground" />
          </Button>
        </div>
        {status && status.type !== "completed" && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            {status.type === "pending" && (
              <>
                <div className="w-3 h-3 animate-spin border border-current border-t-transparent rounded-full"></div>
                <span>{status.message || "Generating..."}</span>
              </>
            )}
            {status.type === "error" && (
              <>
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-red-500">{status.message || "Error occurred"}</span>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
});

AssistantChatMessage.displayName = "AssistantChatMessage";

export default function ConversationPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { id } = useParams();
  const conversationId = id as Id<"conversations">;
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

  const [message, setMessage] = useState("");
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

    const openrouterKey = localStorage.getItem("openrouter-key");


    await generateMessageMutation({
      user: user.id,
      content: message.trim(),
      model: model as Id<"models">,
      conversation: conversationId,
      apiKey: openrouterKey || "",
      useMCP: Cookies.get("mcp") === "true",
    });
    setMessage("");
  }, [message, user?.id, generateMessageMutation, conversationId]);

  useEffect(() => {
    if (user?.id && message) {
      generateMessage();
    }
  }, [user?.id, generateMessage, message]);

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

  useEffect(() => {
    if (userLoaded && !(user?.id && conversationId)) {
      router.replace("/");
    }
  }, [router, userLoaded, user?.id, conversationId]);

  if (userLoaded && !user) {
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
        className="flex-1 overflow-y-auto no-scrollbar"
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
                  className={`${msg.role === "user" ? "" : "bg-background"}`}
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
                            <UserChatMessage
                              content={msg.content}
                              isImage={msg.isImage}
                            />
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {user?.imageUrl ? (
                            <Image
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
                          {getModelIcon(msg.model.provider, msg.model.author)}
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
                            {msg.reasoning && (
                              <ReasoningBox>{msg.reasoning}</ReasoningBox>
                            )}
                            <AssistantChatMessage content={msg.content} status={msg.status} />
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
