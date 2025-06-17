"use client";

import { ReactNode, useCallback, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Cookies from "js-cookie";
import { Toaster } from "@/components/ui/sonner"
import { InputArea } from "@/components/InputArea";

export default function ConversationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { id } = useParams(); // updates when you switch convo
  const conversationId = id as Id<"conversations">;
  const { user } = useUser();
  const router = useRouter();

  const [draft, setDraft] = useState(""); // stays mounted → preserved
  const sendMutation = useMutation(api.generate.generateMessage);
  const sendImageMutation = useMutation(api.generate.saveImage);
  const [images, setImages] = useState<string[]>([]);

  // Check if there are any pending messages to determine if generation is happening
  const messages = useQuery(
    api.conversations.GetMessages,
    user?.id ? { user: user.id, conversation: conversationId } : ("skip" as const)
  );
  
  const isGenerating = messages ? messages.some(msg => 
    msg.role === "assistant" && msg.status?.type === "pending"
  ) : false;

  // Keyboard shortcut: Ctrl+Shift+O to redirect to home
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'O') {
        event.preventDefault();
        router.push('/');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);
  const sendMessage = useCallback(async () => {
    if (!draft.trim() || !user?.id) return;

    let model = Cookies.get("model");
    if (!model) {
      model = "google/gemini-2.0-flash-001";
      Cookies.set("model", model);
    }

    for (const image of images) {
      await sendImageMutation({
        user: user.id,
        conversation: conversationId,
        model: model as Id<"models">,
        storageId: image as Id<"_storage">,
      });
    }

    const openrouterKey = localStorage.getItem("openrouter-key");


    await sendMutation({
      user: user.id,
      conversation: conversationId,
      content: draft.trim(),
      model: model as Id<"models">,
      apiKey: openrouterKey || "",
      useMCP: Cookies.get("mcp") === "true",
    });
    setDraft("");
  }, [
    draft,
    user?.id,
    conversationId,
    sendMutation,
    sendImageMutation,
    images,
  ]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-2rem)]">
      {/* part that swaps when you change conversations */}
      <div className="flex-1 overflow-y-auto">{children}</div>

      {/* part that now persists across conversations */}
      <InputArea
        message={draft}
        setMessage={setDraft}
        generateMessage={sendMessage}
        user={user}
        images={images}
        setImages={setImages}
        conversationId={conversationId}
        isGenerating={isGenerating}
      />
      <Toaster className="primary" />

    </div>
  );
}
