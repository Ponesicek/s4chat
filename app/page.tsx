"use client";

import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { InputArea } from "@/components/InputArea";
import { useCallback, useState } from "react";
import { api } from "@/convex/_generated/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-8">
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </div>
  );
}

function SignInForm() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-lg mx-auto p-8">
      <p>To start a conversation, please sign in or sign up.</p>
      <SignInButton mode="modal">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">
          Sign up
        </button>
      </SignUpButton>
    </div>
  );
}

function Content() {
  const models = useQuery(api.generate.GetModels, {});
  const defaultModel = models?.[0]?._id;
  const model = Cookies.get("model");
  if (!model) {
    Cookies.set("model", defaultModel ?? "");
  }
  const [message, setMessage] = useState("");
  const router = useRouter();
  const createConversationMutation = useMutation(
    api.conversations.CreateConversation,
  );
  const { user } = useUser();
  const generateMessage = useCallback(async () => {
    const conversationId = await createConversationMutation({
      user: user?.id ?? "",
    });
    Cookies.set("conversation", conversationId);
    router.push(`/conversation/${conversationId}?message=${message}`);
  }, [router, createConversationMutation, user, message]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        generateMessage();
      }
    },
    [generateMessage],
  );

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-4 items-center justify-center">
        <h2 className="text-3xl font-bold text-center">Start a Conversation</h2>
        <div className="w-full">
          <InputArea
            message={message}
            setMessage={setMessage}
            handleKeyPress={handleKeyPress}
            user={user}
            generateMessage={generateMessage}
          />
        </div>
      </div>
    </div>
  );
}
