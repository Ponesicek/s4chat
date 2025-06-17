"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import { Input } from "./ui/input";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { X, Search } from "lucide-react";
import { useEmailSettings } from "@/hooks/use-email-settings";

export function ProfileSidebarFooter() {
  const { user } = useUser();
  const { showEmail, mounted } = useEmailSettings();

  return (
    <Link href="/settings" className="w-full">
      <button
        type="button"
        className="group/profile-button flex items-center gap-3 w-full rounded-md p-3 mb-1 hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-ring"
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
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const conversations = useQuery(api.conversations.GetConversations, {
    user: user?.id ?? "",
  });
  const deleteConversationMutation = useMutation(
    api.conversations.DeleteConversation,
  );

  const filteredConversations = useMemo(() => {
    if (!conversations || !searchQuery.trim()) {
      return conversations;
    }
    return conversations.filter((conversation) =>
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'K') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="text-lg text-primary justify-center mb-2"
          >
            <Link href="/">S4 Chat</Link>
          </SidebarGroupLabel>
          <Button asChild>
            <Link href="/">New Chat</Link>
          </Button>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredConversations && filteredConversations.length > 0 ? (
                [...filteredConversations].reverse().map((conversation) => (
                  <SidebarMenuItem key={conversation._id}>
                    <div className="group/item relative h-9.5 flex items-center">
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
              ) : conversations && conversations.length > 0 && filteredConversations?.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">
                  No conversations found matching &quot;{searchQuery}&quot;
                </div>
              ) : null}
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
