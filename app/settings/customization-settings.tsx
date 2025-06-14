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
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFontSettings } from "@/hooks/use-font-settings";
import { useEmailSettings } from "@/hooks/use-email-settings";

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
  const {
    showEmail,
    setShowEmail,
    mounted: emailSettingsMounted,
  } = useEmailSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !colorSchemeMounted || !fontSettingsMounted || !emailSettingsMounted) {
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
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="justify-start px-3 h-auto py-8 border overflow-hidden relative"
              onClick={() => setTheme("light")}
            >
              {/* Light theme preview background */}
              <div className="absolute inset-0 bg-background"></div>
              <div className="relative w-full space-y-2 text-left z-10">
                <div className="space-y-1">
                  <div className="w-10 h-2 rounded-full bg-foreground" />
                  <div className="w-16 h-2 rounded-full bg-muted" />
                </div>
                <span className="block text-xs text-foreground">Light</span>
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
                style={{ backgroundColor: "var(--background)" }}
              ></div>
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
              variant={theme === "system" ? "default" : "outline"}
              className="justify-start px-3 h-auto py-8 border overflow-hidden relative"
              onClick={() => setTheme("system")}
            >
              {/* System theme preview - gradient from light to dark */}
              <div className="absolute inset-0 bg-gradient-to-r from-background to-slate-900"></div>
              <div className="relative w-full space-y-2 text-left z-10">
                <div className="space-y-1">
                  <div className="w-10 h-2 rounded-full bg-foreground" />
                  <div className="w-16 h-2 rounded-full bg-muted" />
                </div>
                <span className="block text-xs text-foreground">System</span>
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
              value as
                | "default"
                | "gruvbox"
                | "solarized"
                | "catpuccin"
                | "nord"
                | "t3",
            )
          }
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2"
        >
          <div>
            <RadioGroupItem
              value="default"
              id="default"
              className="sr-only peer"
            />
            <Label
              htmlFor="default"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="mb-2 h-5 w-5 rounded-full bg-gray-800" />
              <div className="text-sm font-medium">Default</div>
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
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="mb-2 h-5 w-5 rounded-full bg-orange-600" />
              <div className="text-sm font-medium">Gruvbox</div>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="solarized"
              id="solarized"
              className="sr-only peer"
            />
            <Label
              htmlFor="solarized"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="mb-2 h-5 w-5 rounded-full bg-blue-600" />
              <div className="text-sm font-medium">Solarized</div>
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
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="mb-2 h-5 w-5 rounded-full bg-purple-400" />
              <div className="text-sm font-medium">Catpuccin</div>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="nord" id="nord" className="sr-only peer" />
            <Label
              htmlFor="nord"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="mb-2 h-5 w-5 rounded-full bg-blue-500" />
              <div className="text-sm font-medium">Nord</div>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="t3" id="t3" className="sr-only peer" />
            <Label
              htmlFor="t3"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="mb-2 h-5 w-5 rounded-full bg-violet-500" />
              <div className="text-sm font-medium">T3</div>
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
