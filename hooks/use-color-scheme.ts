"use client";

import { useEffect, useState } from "react";

type ColorScheme = "default" | "gruvbox" | "solarized" | "catpuccin" | "nord" | "t3";

export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load color scheme from localStorage on mount
    const saved = localStorage.getItem("color-scheme") as ColorScheme;
    if (saved) {
      setColorScheme(saved);
      applyColorScheme(saved);
    } else {
      applyColorScheme("default");
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
    applyColorScheme(scheme);
  };

  return {
    colorScheme,
    setColorScheme: updateColorScheme,
    mounted,
  };
}
