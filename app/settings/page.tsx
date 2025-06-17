"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomizationSettings } from "./customization-settings";
import { UserSettings } from "./user-settings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("settings");

  return (
    <div className="w-full overflow-y-auto h-[calc(100vh-40px)] no-scrollbar">
    <div className="container mx-auto py-10 space-y-8 ">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsContent value="settings" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsContent value="settings" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Customization</CardTitle>
              <CardDescription>
                Personalize your experience with appearance settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomizationSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}
