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
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

interface ChatMessageProps {
  content: string;
}

const ChatMessage = ({ content }: ChatMessageProps) => {
  return (
    <article className="prose sm:prose-sm md:prose-md lg:prose flex flex-col gap-2 m-0 p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ className, children, ...props }: React.HTMLProps<HTMLElement>) {
            const match = /language-(\w+)/.exec(className || "");
            
            const codeString = String(children).replace(/\n$/, "");

            return match ? (
              <SyntaxHighlighter
                style={oneLight}
                language={match[1]}
                PreTag="div"
              >
                {codeString}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
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
    api.conversations.GetMessagesPaginated,
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
        // Reset only after we've actually added new content.
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
      // Capture height only once per pagination request so we can restore view after load.
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

  // NEW EFFECT: ensure initial render fills the viewport by loading more messages if needed
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // If the content height is not enough to allow scrolling and we can load more, fetch more messages
    if (
      container.scrollHeight <= container.clientHeight &&
      status === "CanLoadMore"
    ) {
      autoFillTriggeredRef.current = true; // remember that we triggered auto-fill
      loadMore(5);
    }
  }, [messages, status, loadMore]);

  // Once the additional messages have been loaded, jump the user to the bottom of the chat
  useEffect(() => {
    if (!autoFillTriggeredRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    // When we have enough messages to scroll, teleport to bottom and reset the flag
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {!messages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading conversation...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                Start a conversation
              </h2>
              <p className="text-gray-600">
                Send your first message to begin chatting with the AI.
              </p>
            </div>
          </div>
        ) : (
          messages.slice().reverse().map((msg) => (
            <div
              key={msg._id}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-100 ml-auto text-right"
                  : "bg-gray-100 mr-auto"
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">
                {msg.role === "user" ? "You" : "Assistant"}
              </div>
              <ChatMessage content={msg.content} />
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}


