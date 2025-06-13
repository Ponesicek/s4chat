"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import Cookies from "js-cookie";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import CodeBlock from "@/components/CodeBlock";
import "katex/dist/katex.min.css";
import Image from "next/image";

interface ChatMessageProps {
  content: string;
}

const UserChatMessage = ({ content }: ChatMessageProps) => {
  return (
  <div className="prose prose-gray dark:prose-invert max-w-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  </div>
  );
}

const AssistantChatMessage = ({ content }: ChatMessageProps) => {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          pre({ children }: React.HTMLProps<HTMLPreElement>) {
            return (
              <div className="not-prose">
                {children}
              </div>
            );
          },
          code({ className, children, ...props }: React.HTMLProps<HTMLElement>) {
            const match = /language-(\w+)/.exec(className || "");
            
            const codeString = String(children).replace(/\n$/, "");

            return match ? (
                <CodeBlock language={match[1]} code={codeString} />
            ) : (
              <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const getModelIcon = (provider: string, author: string) => {
  // Check for OpenAI models
  if (provider === "openrouter" && (author.toLowerCase().includes("openai") || author === "OpenAI")) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center">
        <Image src="/openAI.svg" alt="OpenAI" width={32} height={32} />
      </div>
    );
  }
  
  // Check for Google/Gemini models
  if (provider === "google" || author === "Google") {
    return (
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
        </svg>
      </div>
    );
  }
  
  // Check for Anthropic/Claude models
  if (provider === "anthropic" || author === "Anthropic") {
    return (
      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.307 2.5l4.685 19h1.965L18.642 2.5h-2.275l-3.367 14.5L9.633 2.5H7.307z"/>
        </svg>
      </div>
    );
  }
  
  // Default AI icon
  return (
    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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
  
  const {results: messages, status, loadMore} = usePaginatedQuery(
    api.conversations.GetMessagesPaginatedWithModels,
    {
      user: user?.id || "",
      conversation: conversationId,
    },
      {
        initialNumItems: 5,
      }
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

    if (container.scrollTop <= 0 && status === "CanLoadMore" && prevScrollHeightRef.current === 0) {
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
  }, [initialMessage, user?.id, generateMessage, conversationId, router, message]);

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

  if (!(user?.id && conversationId)) {
    return <div>Invalid conversation</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-gray-600">
            You need to be signed in to view this conversation.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] bg-white">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {!messages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">Loading conversation...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Start a conversation
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Send your first message to begin chatting with the AI assistant. 
                Ask questions, get help with coding, or have a conversation about anything.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.slice().reverse().map((msg) => (
              <div
                key={msg._id}
                className={`border-b border-gray-100 ${
                  msg.role === "user" 
                    ? "bg-gray-50" 
                    : "bg-white"
                }`}
              >
                <div className="px-6 py-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {msg.role === "user" ? (
                        user?.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt="User avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || "U"}
                            </span>
                          </div>
                        )
                      ) : (
                        getModelIcon(msg.model.provider, msg.model.author)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {msg.role === "user" ? "You" : msg.model.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg._creationTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-800 leading-relaxed">
                        {msg.role === "user" ? (
                          <UserChatMessage content={msg.content} />
                        ) : (
                          <AssistantChatMessage content={msg.content} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}


