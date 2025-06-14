"use client";

import { useEffect, useState } from "react";

type EmailSettings = {
  showEmail: boolean;
};

const defaultSettings: EmailSettings = {
  showEmail: true,
};

const EMAIL_SETTINGS_STORAGE_KEY = "email-settings";
const EMAIL_SETTINGS_EVENT = "email-settings-change";

export function useEmailSettings() {
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const stored = localStorage.getItem(EMAIL_SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Failed to parse email settings:", error);
      }
    }

    // Listen for updates from other components or tabs
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<EmailSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === EMAIL_SETTINGS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as EmailSettings;
          setSettings(parsed);
        } catch (error) {
          console.error("Failed to parse email settings from storage event:", error);
        }
      }
    };

    window.addEventListener(EMAIL_SETTINGS_EVENT, handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener(EMAIL_SETTINGS_EVENT, handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const updateSettings = (updates: Partial<EmailSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem(
      EMAIL_SETTINGS_STORAGE_KEY,
      JSON.stringify(newSettings),
    );
    // Broadcast change to other hook instances in the same window
    window.dispatchEvent(
      new CustomEvent<EmailSettings>(EMAIL_SETTINGS_EVENT, { detail: newSettings }),
    );
  };

  const setShowEmail = (showEmail: boolean) => {
    updateSettings({ showEmail });
  };

  return {
    showEmail: settings.showEmail,
    setShowEmail,
    mounted,
  };
} 