import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";
import { ModelBrowser } from "@/components/ModelBrowser";
import { useUser } from "@clerk/nextjs";
import { Paperclip, Send } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Cookies from "js-cookie";
import Image from "next/image";

export function InputArea({
  message,
  setMessage,
  generateMessage,
  setImages,
}: {
  message: string;
  setMessage: (message: string) => void;
  user: ReturnType<typeof useUser>["user"];
  generateMessage: () => void;
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
}) {
  // Keep a reference to the underlying textarea so we can focus it when the component mounts.
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // State management
  const [isFocused, setIsFocused] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Get models and current model for icon display
  const models = useQuery(api.generate.GetModels, {});
  const currentModelID = Cookies.get("model");
  const currentModel = models?.find((model) => model._id === currentModelID);

  // Mutation for generating upload URLs
  const generateUploadUrl = useMutation(api.generate.generateUploadUrl);

  const placeholder = "Type a message...";
  const canSend = message.trim().length > 0 && !disabled;

  // Focus the textarea once the component is mounted.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const onDeleteImage = useCallback(
    (index: number) => {
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      setImages((prev) => prev.filter((_, i) => i !== index));
    },
    [setImages, setUploadedImages],
  );

  const onAttachFile = useCallback(async () => {
    // Create a file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      setDisabled(true);
      const posturl = await generateUploadUrl();

      const result = await fetch(posturl, {
        method: "POST",
        headers: {
          "Content-Type": files[0].type,
        },
        body: files[0],
      });
      const { storageId } = await result.json();

      setImages((prev) => {
        const newImages = [...prev, storageId];
        return newImages;
      });

      // Create FileReader and set up onload callback
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setUploadedImages((prev) => [...prev, reader.result as string]);
        }
        setDisabled(false);
      };
      reader.readAsDataURL(files[0]);
    };

    input.click();
  }, [generateUploadUrl, setImages]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        generateMessage();
        setUploadedImages([]); // Clear images after sending
        setImages([]); // Clear image storage IDs after sending
      }
    },
    [generateMessage, setUploadedImages, setImages],
  );

  const handleSend = useCallback(() => {
    if (canSend) {
      generateMessage();
      setUploadedImages([]); // Clear images after sending
      setImages([]); // Clear image storage IDs after sending
    }
  }, [canSend, generateMessage, setUploadedImages, setImages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px"; // max-h-32 = 128px
    }
  }, [message]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 ">
          {uploadedImages.map((image, index) => (
            <div
              key={index}
              className="relative w-16 h-16 rounded-lg border overflow-hidden bg-muted"
            >
              {image ? (
                <Image
                  src={image}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  width={64}
                  height={64}
                />
              ) : (
                // Blank effect placeholder
                <div className="w-full h-full bg-muted animate-pulse" />
              )}
              <button
                onClick={() => onDeleteImage(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs hover:bg-destructive/80"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Container */}
      <div
        className={`
        relative border rounded-2xl bg-card transition-all duration-200
        ${isFocused ? "border-primary shadow-md" : "border-border"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      >
        {/* Input Area */}
        <div className="flex items-start p-4 space-x-3">
          {/* Left Actions */}
          <div className="flex items-start space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAttachFile}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center h-9 w-9">
              {currentModel ? (
                <ModelBrowser />
              ) : (
                <div className="w-4 h-4 bg-muted rounded-full animate-pulse" />
              )}
            </div>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
              onKeyDown={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[40px] pt-1 max-h-32 w-full resize-none border-0 p-0 bg-transparent focus:outline-none focus:ring-0"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSend}
              disabled={!canSend}
              className={`h-9 w-9 p-0 transition-all duration-200 ${
                canSend
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
