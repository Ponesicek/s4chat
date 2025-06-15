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
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { useEmailSettings } from "@/hooks/use-email-settings";

export function ProfileSidebarFooter() {
  const { user } = useUser();
  const { showEmail, mounted } = useEmailSettings();
  
  return (
    <Link href="/settings" className="w-full">
      <button
        type="button"
        className="group/profile-button flex items-center gap-3 w-full rounded-md p-3 mb-1 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span className="pointer-events-none flex items-center justify-center">
          <UserButton />
        </span>
        <div className="flex flex-col overflow-hidden text-left">
          <span className="text-sm font-medium leading-none truncate">
            {user?.username}
          </span>
          {(!mounted || showEmail) && (
            <span
              suppressHydrationWarning
              className="text-xs text-muted-foreground group-hover/profile-button:text-foreground truncate max-w-[160px] transition-colors"
            >
              {user?.emailAddresses?.[0]?.emailAddress}
            </span>
          )}
        </div>
      </button>
    </Link>
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
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations ? (
                conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation._id}>
                    <div className="group/item relative h-10 flex items-center">
                      <SidebarMenuButton
                        asChild
                        isActive={params.id === conversation._id}
                        className="group/menu-item h-full flex-1"
                      >
                        <Link href={`/conversation/${conversation._id}`}>
                          <span className="truncate">{conversation.name}</span>
                        </Link>
                      </SidebarMenuButton>
                      <div className="flex items-center h-full">
                        <SidebarMenuAction
                          className="opacity-0 group-hover/menu-item:opacity-100 transition-opacity duration-200 top-1/2 -translate-y-1/2"
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
                          <X className="h-4 w-4" />
                          <span className="sr-only">Delete conversation</span>
                        </SidebarMenuAction>
                      </div>
                    </div>
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
