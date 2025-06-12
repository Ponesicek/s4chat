"use client";

import { ReactNode, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Cookies from "js-cookie";

import { InputArea } from "@/components/InputArea";

export default function ConversationLayout({ children }: { children: ReactNode }) {
  const { id } = useParams();                     // updates when you switch convo
  const conversationId = id as Id<"conversations">;
  const { user } = useUser();

  const [draft, setDraft] = useState("");         // stays mounted → preserved
  const sendMutation = useMutation(api.generate.generateMessage);

  const sendMessage = useCallback(async () => {
    if (!draft.trim() || !user?.id) return;

    let model = Cookies.get("model");
    if (!model) {
      model = "google/gemini-2.0-flash-001";
      Cookies.set("model", model);
    }

    await sendMutation({
      user: user.id,
      conversation: conversationId,
      content: draft.trim(),
      model: model as Id<"models">,
    });
    setDraft("");
  }, [draft, user?.id, conversationId, sendMutation]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      {/* part that swaps when you change conversations */}
      <div className="flex-1 overflow-y-auto">{children}</div>

      {/* part that now persists across conversations */}
      <InputArea
        message={draft}
        setMessage={setDraft}
        generateMessage={sendMessage}
        handleKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        user={user}
      />
    </div>
  );
}