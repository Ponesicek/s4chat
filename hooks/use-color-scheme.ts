"use client";

import { useEffect, useState } from "react";

type ColorScheme =
  | "default"
  | "gruvbox"
  | "solarized"
  | "catpuccin"
  | "nord"
  | "t3";

export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load color scheme from localStorage on mount
    const saved = localStorage.getItem("color-scheme") as ColorScheme;
    if (saved && saved !== "default") {
      setColorScheme(saved);
      applyColorScheme(saved);
      // Persist to cookie so SSR picks it up
      document.cookie = `color-scheme=${saved}; path=/; max-age=31536000`;
    } else {
      // Default is already applied in HTML, just ensure localStorage is set
      setColorScheme("default");
      localStorage.setItem("color-scheme", "default");
      document.cookie = "color-scheme=default; path=/; max-age=31536000";
      // Don't need to apply "default" since it's already in the HTML className
    }
  }, []);

  const applyColorScheme = (scheme: ColorScheme) => {
    // Remove existing color scheme classes
    document.documentElement.classList.remove(
      "default",
      "gruvbox",
      "solarized",
      "catpuccin",
      "nord",
      "t3",
    );

    // Add new color scheme class
    document.documentElement.classList.add(scheme);
  };

  const updateColorScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    localStorage.setItem("color-scheme", scheme);
    document.cookie = `color-scheme=${scheme}; path=/; max-age=31536000`;
    applyColorScheme(scheme);
  };

  const resetToDefault = () => {
    setColorScheme("default");
    localStorage.setItem("color-scheme", "default");
    document.cookie = "color-scheme=default; path=/; max-age=31536000";
    applyColorScheme("default");
  };

  return {
    colorScheme,
    setColorScheme: updateColorScheme,
    resetToDefault,
    mounted,
  };
}
