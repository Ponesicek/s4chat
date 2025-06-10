"use client";

import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Cookies from "js-cookie";

export default function ConversationPage() {
  const { user } = useUser();
  const { id } = useParams();
  const messages = useQuery(api.conversations.GetMessages, { user: user?.id ?? "", conversation: id as Id<"conversations"> });
  const [message, setMessage] = useState("");
  const generateMessageMutation = useMutation(api.generate.generateMessage);

  const generateMessage = () => {
    setMessage("");
    var model = Cookies.get("model");
    if (!model) {
      Cookies.set("model", "jd73qh6xkwcvvmtr5qtc64pv497hke03"); //Deepseek R1 Free
      model = "jd73qh6xkwcvvmtr5qtc64pv497hke03";
    }
    generateMessageMutation({
      user: user?.id ?? "",
      content: message,
      model: model as Id<"models">,
      conversation: id as Id<"conversations">,
    });
  };
  return <div className="flex flex-col h-full">
    <div className="flex flex-col gap-2 overflow-y-auto h-full">
    {messages?.map((message) => (
      <div key={message._id}>{message.role === "user" ? "User: " : "Assistant: "}{message.content}</div>
    ))}
    </div>
    <div className="flex flex-row gap-2 overflow-x-auto p-2">
        <Input type="text" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button onClick={generateMessage}>Send</Button>
    </div>
  </div>;
}