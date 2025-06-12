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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export function ProfileSidebarFooter() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();

  return (
    <button
      type="button"
      onClick={() => openUserProfile?.()}
      className="flex items-center gap-3 w-full rounded-md p-3 mb-1 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <span className="pointer-events-none flex items-center justify-center">
        <UserButton />
      </span>
      <div className="flex flex-col overflow-hidden text-left">
        <span className="text-sm font-medium leading-none truncate">
          {user?.firstName} {user?.lastName}
        </span>
        <span className="text-xs text-muted-foreground truncate max-w-[160px]">
          {user?.emailAddresses?.[0]?.emailAddress}
        </span>
      </div>
    </button>
  );
}

export function AppSidebar() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const conversations = useQuery(api.conversations.GetConversations, {
    user: user?.id ?? "",
  });
  const deleteConversationMutation = useMutation(
    api.conversations.DeleteConversation,
  );

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
          <Button asChild>
            <Link href="/">New Chat</Link>
          </Button>
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
                        <span className="flex-1 truncate">{conversation.name}</span>
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
      <SidebarFooter>
        <ProfileSidebarFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
