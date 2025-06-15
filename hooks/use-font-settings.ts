"use client";

import { useEffect, useState } from "react";

type FontFamily = "inter" | "roboto" | "system" | "mono";
type FontSize = "small" | "medium" | "large";

interface FontSettings {
  fontFamily: FontFamily;
  fontSize: FontSize;
}

const fontFamilyMap = {
  inter:
    "var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  roboto:
    "var(--font-roboto), Roboto, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  system:
    "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
};

const fontSizeMap = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

export function useFontSettings() {
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    fontFamily: "inter",
    fontSize: "medium",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load font settings from localStorage on mount
    const savedFontFamily = localStorage.getItem("font-family") as FontFamily;
    const savedFontSize = localStorage.getItem("font-size") as FontSize;

    const settings: FontSettings = {
      fontFamily: savedFontFamily || "inter",
      fontSize: savedFontSize || "medium",
    };

    // If no saved settings, save the defaults
    if (!savedFontFamily) {
      localStorage.setItem("font-family", "inter");
    }
    if (!savedFontSize) {
      localStorage.setItem("font-size", "medium");
    }

    setFontSettings(settings);

    // Only apply font settings if they're different from the defaults
    if (
      (savedFontFamily && savedFontFamily !== "inter") ||
      (savedFontSize && savedFontSize !== "medium")
    ) {
      applyFontSettings(settings);
    }
    // Otherwise, defaults are already applied in the HTML/CSS
  }, []);

  const applyFontSettings = (settings: FontSettings) => {
    const body = document.body;
    const html = document.documentElement;

    // Remove any existing font styles first
    body.style.removeProperty("font-family");
    body.style.removeProperty("font-size");

    // Apply font family to both html and body to ensure it takes effect
    html.style.setProperty(
      "font-family",
      fontFamilyMap[settings.fontFamily],
      "important",
    );
    body.style.setProperty(
      "font-family",
      fontFamilyMap[settings.fontFamily],
      "important",
    );

    // Apply font size
    html.style.setProperty(
      "font-size",
      fontSizeMap[settings.fontSize],
      "important",
    );
    body.style.setProperty(
      "font-size",
      fontSizeMap[settings.fontSize],
      "important",
    );

    // Also set CSS custom properties for other components that might use them
    html.style.setProperty(
      "--font-family-custom",
      fontFamilyMap[settings.fontFamily],
    );
    html.style.setProperty(
      "--font-size-custom",
      fontSizeMap[settings.fontSize],
    );

    // Add a class to body for CSS targeting
    body.className = body.className.replace(/font-\w+/g, "");
    body.classList.add(
      `font-${settings.fontFamily}`,
      `size-${settings.fontSize}`,
    );
  };

  const updateFontFamily = (fontFamily: FontFamily) => {
    const newSettings = { ...fontSettings, fontFamily };
    setFontSettings(newSettings);
    localStorage.setItem("font-family", fontFamily);
    applyFontSettings(newSettings);
  };

  const updateFontSize = (fontSize: FontSize) => {
    const newSettings = { ...fontSettings, fontSize };
    setFontSettings(newSettings);
    localStorage.setItem("font-size", fontSize);
    applyFontSettings(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings: FontSettings = {
      fontFamily: "inter",
      fontSize: "medium",
    };
    setFontSettings(defaultSettings);
    localStorage.setItem("font-family", "inter");
    localStorage.setItem("font-size", "medium");
    applyFontSettings(defaultSettings);
  };

  return {
    fontFamily: fontSettings.fontFamily,
    fontSize: fontSettings.fontSize,
    setFontFamily: updateFontFamily,
    setFontSize: updateFontSize,
    resetToDefaults,
    mounted,
  };
}
