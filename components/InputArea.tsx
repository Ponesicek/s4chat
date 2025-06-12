import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModelBrowser } from "@/components/ModelBrowser";
import { useUser } from "@clerk/nextjs";

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
  // Keep a reference to the underlying input so we can focus it when the component mounts.
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input once the component is mounted.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
            ref={inputRef}
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