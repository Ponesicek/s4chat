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
} from "@/components/ui/sidebar";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Cookies from "js-cookie";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export function AppSidebar() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const conversations = useQuery(api.conversations.GetConversations, {
    user: user?.id ?? "",
  });
  const createConversationMutation = useMutation(
    api.conversations.CreateConversation,
  );
  const deleteConversationMutation = useMutation(
    api.conversations.DeleteConversation,
  );
  const createConversation = async () => {
    const conversationId = await createConversationMutation({
      user: user?.id ?? "",
    });
    Cookies.set("conversation", conversationId);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="text-2xl font-bold flex justify-center items-center m-2"
          >
            <Link href="/">S4 Chat</Link>
          </SidebarGroupLabel>
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
                      <Link
                        href={`/conversation/${conversation._id}`}
                        className={
                          params.id === conversation._id
                            ? "bg-foreground text-background"
                            : ""
                        }
                      >
                        <span>{conversation.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto hover:bg-red-500 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (params.id === conversation._id) {
                              router.push("/");
                            }
                            deleteConversationMutation({
                              user: user?.id ?? "",
                              conversation: conversation._id,
                            });
                          }}
                        >
                          X
                        </Button>
                      </Link>
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
  );
}
