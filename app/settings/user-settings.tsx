"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useEmailSettings } from "@/hooks/use-email-settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, LoaderIcon } from "lucide-react";

export function UserSettings() {
  const {
    showEmail,
    setShowEmail,
    mounted: emailSettingsMounted,
  } = useEmailSettings();
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [isCheckingKey, setIsCheckingKey] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openrouterKey, setOpenrouterKey] = useState("");

  useEffect(() => {
    setMounted(true);
    // Load OpenRouter key from localStorage
    const savedKey = localStorage.getItem("openrouter-key");
    if (savedKey) {
      setOpenrouterKey(savedKey);
    }
  }, []);

  const handleOpenrouterKeyChange = (value: string) => {
    setOpenrouterKey(value);
  };

  const checkKey = async (key: string) => {
    setIsCheckingKey(true);
    setIsKeyValid(null);

    try {
      const response = await fetch(`https://openrouter.ai/api/v1/key`, {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });

      // Add a small delay to show the loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (response.ok) {
        console.log("Key is valid");
        setIsKeyValid(true);
        localStorage.setItem("openrouter-key", key);
      } else {
        console.log("Key is invalid");
        setIsKeyValid(false);
        localStorage.removeItem("openrouter-key");
      }
    } catch (error) {
      console.log("Error checking key:", error);
      setIsKeyValid(false);
    } finally {
      setIsCheckingKey(false);
    }
  };

  if (!mounted || !emailSettingsMounted) {
    return (
      <div className="space-y-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
        <Separator />
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-3 bg-muted rounded w-48"></div>
            </div>
            <div className="h-6 w-12 bg-muted rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Configure your API keys for external services.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
          <div className="flex items-center justify-between">
            <Input
              id="openrouter-key"
              type="password"
              className="mr-2"
              placeholder="Enter your OpenRouter API key"
              value={openrouterKey}
              onChange={(e) => handleOpenrouterKeyChange(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => checkKey(openrouterKey)}
              disabled={isCheckingKey || !openrouterKey.trim()}
              className={`
                min-w-[120px] transition-all duration-300 ease-in-out
                ${isKeyValid === true ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : ""}
                ${isKeyValid === false ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" : ""}
                ${isCheckingKey ? "animate-pulse" : ""}
              `}
            >
              <div className="flex items-center gap-2 transition-all duration-200">
                {isCheckingKey ? (
                  <>
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : isKeyValid === null ? (
                  <span>Check and save</span>
                ) : isKeyValid ? (
                  <>
                    <CheckIcon className="w-4 h-4 animate-in zoom-in-75 duration-200" />
                    <span>Valid</span>
                  </>
                ) : (
                  <>
                    <XIcon className="w-4 h-4 animate-in zoom-in-75 duration-200" />
                    <span>Invalid</span>
                  </>
                )}
              </div>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally and never stored on our servers.
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Privacy</h3>
          <p className="text-sm text-muted-foreground">
            Control what information is displayed.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="show-email">Show Email in Sidebar</Label>
            <p className="text-sm text-muted-foreground">
              Display your email address in the sidebar footer.
            </p>
          </div>
          <Switch
            id="show-email"
            checked={showEmail}
            onCheckedChange={setShowEmail}
          />
        </div>
      </div>
    </div>
  );
}
