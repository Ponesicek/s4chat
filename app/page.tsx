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
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to s4chat</CardTitle>
          <CardDescription>
            To start a conversation, please sign in or sign up.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SignInButton mode="modal">
            <Button size="lg" className="w-full">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="lg" variant="outline" className="w-full">
              Sign up
            </Button>
          </SignUpButton>
        </CardContent>
      </Card>
    </div>
  );
}

function Content() {
  const [images, setImages] = useState<string[]>([]);
  const models = useQuery(api.generate.GetModels, {});
  const defaultModel = models?.[0]?._id;
  const model = Cookies.get("model");
  if (!model) {
    Cookies.set("model", defaultModel ?? "");
  }
  const [message, setMessage] = useState("");
  const router = useRouter();
  const sendMutation = useMutation(api.generate.generateMessage);
  const sendImageMutation = useMutation(api.generate.saveImage);
  const createConversationMutation = useMutation(
    api.conversations.CreateConversation,
  );
  const { user } = useUser();

  const sendMessage = useCallback(async () => {
    const conversationId = await createConversationMutation({
      user: user?.id ?? "",
    });
    Cookies.set("conversation", conversationId);

    let model = Cookies.get("model");
    if (!model) {
      model = "google/gemini-2.0-flash-001";
      Cookies.set("model", model);
    }

    for (const image of images) {
      await sendImageMutation({
        user: user?.id ?? "",
        conversation: conversationId,
        model: model as Id<"models">,
        storageId: image as Id<"_storage">,
      });
    }

    const openrouterKey = localStorage.getItem("openrouter-key");

    await sendMutation({
      user: user?.id ?? "",
      conversation: conversationId,
      content: message.trim(),
      model: model as Id<"models">,
      apiKey: openrouterKey || "",
      useMCP: Cookies.get("mcp") === "true",
    });
    setMessage("");
    router.push(`/conversation/${conversationId}`);
  }, [
    message,
    user?.id,
    sendMutation,
    sendImageMutation,
    images,
    router,
    createConversationMutation,
  ]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-4 items-center justify-center">
        <h2 className="text-3xl font-bold text-center">Start a Conversation</h2>
        <div className="w-full">
          <InputArea
            message={message}
            setMessage={setMessage}
            user={user}
            generateMessage={sendMessage}
            images={images}
            setImages={setImages}
            conversationId={"" as Id<"conversations">}
            isGenerating={false}
          />
        </div>
      </div>
    </div>
  );
}
