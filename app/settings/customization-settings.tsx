"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFontSettings } from "@/hooks/use-font-settings";

export function CustomizationSettings() {
  const { theme, setTheme } = useTheme();
  const {
    colorScheme,
    setColorScheme,
    mounted: colorSchemeMounted,
  } = useColorScheme();
  const {
    fontFamily,
    fontSize,
    setFontFamily,
    setFontSize,
    mounted: fontSettingsMounted,
  } = useFontSettings();

  // Map of background colors for the theme preview buttons based on the chosen color scheme
  const previewColors: Record<
    "default" | "gruvbox" | "catpuccin" | "nord" | "t3",
    { lightBg: string; darkBg: string }
  > = {
    default: {
      lightBg: "#ffffff",
      darkBg: "#0d1117", // slate-900 equivalent
    },
    gruvbox: {
      lightBg: "#fbf1c7",
      darkBg: "#1d2021",
    },
    catpuccin: {
      lightBg: "#eff1f5", // Catpuccin latte surface0
      darkBg: "#1e1e2e", // Catpuccin mocha base
    },
    nord: {
      lightBg: "#eceff4",
      darkBg: "#2e3440",
    },
    t3: {
      lightBg: "#f9eff9",
      darkBg: "#211c26",
    },
  };
  // Map of background colors for the theme preview buttons based on the chosen color scheme
  const previewColorsAccent: Record<
    "default" | "gruvbox" | "catpuccin" | "nord" | "t3",
    { lightBg: string; darkBg: string }
  > = {
    default: {
      lightBg: "#0969da", // GitHub Light primary
      darkBg: "#4493f8", // GitHub Dark primary
    },
    gruvbox: {
      lightBg: "#d65d0e", // Gruvbox orange (light)
      darkBg: "#fe8019", // Gruvbox orange (bright) for dark
    },
    catpuccin: {
      lightBg: "#8839ef", // Catppuccin Latte mauve
      darkBg: "#cba6f7", // Catppuccin Mocha mauve
    },
    nord: {
      lightBg: "#5e81ac", // Nord frost blue (light)
      darkBg: "#81a1c1", // Nord frost blue (lighter) for dark
    },
    t3: {
      lightBg: "#a43e6a", // T3 primary purple (light)
      darkBg: "#70284d", // T3 darker purple for dark
    },
  };

  const { lightBg, darkBg } = previewColors[colorScheme];

  // Text colors for the light preview (when overall theme is dark)
  const lightFgColors: Record<
    "default" | "gruvbox" | "catpuccin" | "nord" | "t3",
    string
  > = {
    default: "#1f2328", // GitHub Light foreground
    gruvbox: "#3c3836",
    catpuccin: "#4c4f69",
    nord: "#2e3440",
    t3: "#2d1b2e",
  };

  // Foreground colours for the colour-scheme buttons so text stays readable
  const schemeFgColors: Record<
    "default" | "gruvbox" | "catpuccin" | "nord" | "t3",
    { light: string; dark: string }
  > = {
    default: { light: "#e6edf3", dark: "#1f2328" },
    gruvbox: { light: "#ebdbb2", dark: "#3c3836" },
    catpuccin: { light: "#ccd6f6", dark: "#4c4f69" },
    nord: { light: "#eceff4", dark: "#2e3440" },
    t3: { light: "#ffffff", dark: "#2d1b2e" },
  };

  const isDark = theme === "dark";

  const getBgForScheme = (
    scheme: "default" | "gruvbox" | "catpuccin" | "nord" | "t3",
  ) =>
    isDark
      ? previewColorsAccent[scheme].darkBg
      : previewColorsAccent[scheme].lightBg;
  const getFgForScheme = (
    scheme: "default" | "gruvbox" | "catpuccin" | "nord" | "t3",
  ) => (isDark ? schemeFgColors[scheme].dark : schemeFgColors[scheme].light);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !colorSchemeMounted || !fontSettingsMounted) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Theme</h3>
            <p className="text-sm text-muted-foreground">
              Choose your preferred color mode.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="justify-start px-3 h-auto py-8 border overflow-hidden relative"
                disabled
              >
                <div className="absolute inset-0 bg-white"></div>
                <div className="relative w-full space-y-2 text-left z-10">
                  <div className="space-y-1">
                    <div className="w-10 h-2 rounded-full bg-slate-900" />
                    <div className="w-16 h-2 rounded-full bg-slate-300" />
                  </div>
                  <span className="block text-xs text-slate-900">Light</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start px-3 h-auto py-8 border overflow-hidden relative"
                disabled
              >
                <div className="absolute inset-0 bg-slate-900"></div>
                <div className="relative w-full space-y-2 text-left z-10">
                  <div className="space-y-1">
                    <div className="w-10 h-2 rounded-full bg-slate-100" />
                    <div className="w-16 h-2 rounded-full bg-slate-600" />
                  </div>
                  <span className="block text-xs text-slate-100">Dark</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start px-3 h-auto py-8 border overflow-hidden relative"
                disabled
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-slate-900"></div>
                <div className="relative w-full space-y-2 text-left z-10">
                  <div className="space-y-1">
                    <div className="w-10 h-2 rounded-full bg-slate-900" />
                    <div className="w-16 h-2 rounded-full bg-slate-300" />
                  </div>
                  <span className="block text-xs text-slate-900">System</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
        {/* Loading placeholders for other sections */}
        <Separator />
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
        <Separator />
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
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
        <div className="flex justify-end">
          <Button disabled>Save Changes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Theme</h3>
          <p className="text-sm text-muted-foreground">
            Choose your preferred color mode.
          </p>
        </div>
        <div className="grid gap-2">
          <div className="grid grid-cols-3 gap-3">            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="justify-start px-3 h-auto py-8 border overflow-hidden relative"
              onClick={() => setTheme("light")}
            >
              {/* Light theme preview background */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: lightBg }}
              ></div>
              <div className="relative w-full space-y-2 text-left z-10">
                <span
                  className="block text-xs"
                  style={{ color: lightFgColors[colorScheme] }}
                >
                  Light
                </span>
              </div>
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="justify-start px-3 h-auto py-8 border overflow-hidden relative"
              onClick={() => setTheme("dark")}
            >
              {/* Dark theme preview background - simulate dark mode */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: darkBg }}
              ></div>
              <div className="relative w-full space-y-2 text-left z-10">
                <span className="block text-xs text-slate-100">Dark</span>
              </div>
            </Button>            <Button
              variant={theme === "system" ? "default" : "outline"}
              className="justify-start px-3 h-auto py-8 border overflow-hidden relative"
              onClick={() => setTheme("system")}
            >
              {/* System theme preview - gradient from light to dark */}
              <div
                className="absolute inset-0 bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(to right, ${lightBg}, ${darkBg})`,
                }}
              ></div>
              <div className="relative w-full space-y-2 text-left z-10">
                <span
                  className="block text-xs"
                  style={{ color: lightFgColors[colorScheme] }}
                >
                  System
                </span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Color Scheme</h3>
          <p className="text-sm text-muted-foreground">
            Select your preferred accent color.
          </p>
        </div>
        <RadioGroup
          value={colorScheme}
          onValueChange={(value) =>
            setColorScheme(
              value as "default" | "gruvbox" | "catpuccin" | "nord" | "t3",
            )
          }
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2"
        >
          <div>
            <RadioGroupItem
              value="default"
              id="default"
              className="sr-only peer"
            />
            <Label
              htmlFor="default"
              className="flex items-center justify-center rounded-md border-2 border-muted p-4 peer-data-[state=checked]:border-primary"
              style={{
                backgroundColor: getBgForScheme("default"),
                color: getFgForScheme("default"),
              }}
            >
              <span className="text-sm font-medium">Default</span>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="gruvbox"
              id="gruvbox"
              className="sr-only peer"
            />
            <Label
              htmlFor="gruvbox"
              className="flex items-center justify-center rounded-md border-2 border-muted p-4 peer-data-[state=checked]:border-primary"
              style={{
                backgroundColor: getBgForScheme("gruvbox"),
                color: getFgForScheme("gruvbox"),
              }}
            >
              <span className="text-sm font-medium">Gruvbox</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="catpuccin"
              id="catpuccin"
              className="sr-only peer"
            />
            <Label
              htmlFor="catpuccin"
              className="flex items-center justify-center rounded-md border-2 border-muted p-4 peer-data-[state=checked]:border-primary"
              style={{
                backgroundColor: getBgForScheme("catpuccin"),
                color: getFgForScheme("catpuccin"),
              }}
            >
              <span className="text-sm font-medium">Catpuccin</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="nord" id="nord" className="sr-only peer" />
            <Label
              htmlFor="nord"
              className="flex items-center justify-center rounded-md border-2 border-muted p-4 peer-data-[state=checked]:border-primary"
              style={{
                backgroundColor: getBgForScheme("nord"),
                color: getFgForScheme("nord"),
              }}
            >
              <span className="text-sm font-medium">Nord</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="t3" id="t3" className="sr-only peer" />
            <Label
              htmlFor="t3"
              className="flex items-center justify-center rounded-md border-2 border-muted p-4 peer-data-[state=checked]:border-primary"
              style={{
                backgroundColor: getBgForScheme("t3"),
                color: getFgForScheme("t3"),
              }}
            >
              <span className="text-sm font-medium">T3</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Typography</h3>
          <p className="text-sm text-muted-foreground">
            Customize the font settings.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger id="font-family">
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="roboto">Roboto</SelectItem>
                <SelectItem value="system">System UI</SelectItem>
                <SelectItem value="mono">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size</Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger id="font-size">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
