"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";



export function AppSidebar() {
  const { user } = useUser();
  const params = useParams();
  const conversations = useQuery(api.generate.GetConversations, { user: user?.id ?? "" });
  const createConversationMutation = useMutation(api.generate.CreateConversation);
  const createConversation = async () => {
    const conversationId = await createConversationMutation({ user: user?.id ?? "" });
    Cookies.set("conversation", conversationId);
  };

  return (
    <Sidebar>
        <SidebarHeader>
            <SidebarGroup>
                <SidebarGroupLabel className="text-2xl font-bold flex justify-center items-center m-2">S4 Chat</SidebarGroupLabel>
                <Button onClick={createConversation}>New Chat</Button>
            </SidebarGroup>
        </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations ? (
                conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation._id}>
                    <SidebarMenuButton asChild>
                      <a href={`/conversation/${conversation._id}`} className={params.id === conversation._id ? "bg-foreground text-background" : ""}>
                        <span>{conversation.name}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                // Show empty sidebar while loading
                <div className="text-sm text-muted-foreground p-2">
                  Loading conversations...
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

