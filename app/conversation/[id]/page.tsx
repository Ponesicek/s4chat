"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import { ModelBrowser } from "@/components/ModelBrowser";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
  content: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content }) => {
  return (
    <article className="
    prose sm:prose-sm md:prose-md lg:prose
    flex flex-col gap-2 m-0 p-0
  ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
        code({ className, children, ...props }: React.HTMLProps<HTMLElement>) {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <SyntaxHighlighter
              // @ts-ignore - vscDarkPlus style compatibility
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
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

  const messages = useQuery(
    api.conversations.GetMessages,
    user?.id && conversationId
      ? {
          user: user.id,
          conversation: conversationId,
        }
      : "skip",
  );

  const [message, setMessage] = useState(initialMessage);
  const generateMessageMutation = useMutation(api.generate.generateMessage);
  const [loading, setLoading] = useState(true);

  const messageList = useMemo(() => {
    if (!messages) return null;

    setLoading(false);
    return messages.map((message) => (
      <div
        key={message._id}
        className={`p-3 rounded-lg max-w-[80%] ${
          message.role === "user"
            ? "bg-blue-100 ml-auto text-right"
            : "bg-gray-100 mr-auto"
        }`}
      >
        <div className="text-xs text-gray-500 mb-1">
          {message.role === "user" ? "You" : "Assistant"}
        </div>
        <ChatMessage content={message.content} />
      </div>
    ));
  }, [messages]);

  const generateMessage = useCallback(async () => {
    if (!message.trim() || !user?.id) return;

    setMessage("");
    let model = Cookies.get("model");
    if (!model) {
      Cookies.set("model", "google/gemini-2.0-flash-001");
      model = "google/gemini-2.0-flash-001";
    }

    await generateMessageMutation({
      user: user.id,
      content: message.trim(),
      model: model as Id<"models">,
      conversation: conversationId,
    });
  }, [
    message,
    user?.id,
    generateMessageMutation,
    conversationId,
  ]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        generateMessage();
      }
    },
    [generateMessage],
  );

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages === undefined ? (
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
          messageList
        )}
      </div>
      <InputArea
        message={message}
        setMessage={setMessage}
        handleKeyPress={handleKeyPress}
        user={user}
        generateMessage={generateMessage}
      />
    </div>
  );
}

export function InputArea({
  message,
  setMessage,
  handleKeyPress,
  user,
  generateMessage,
}: {
  message: string;
  setMessage: (message: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  user: ReturnType<typeof useUser>["user"];
  generateMessage: () => void;
}) {
  return (
    <div className="border-t bg-white p-4">
      <div className="flex flex-row gap-2 items-end">
        <ModelBrowser />
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!user?.id}
            className="resize-none"
          />
        </div>
        <Button
          onClick={generateMessage}
          disabled={!message.trim() || !user?.id}
          className="px-6"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
