import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const GetMessages = query({
    args: {
      user: v.string(),
      conversation: v.id("conversations"),
    },
    handler: async (ctx, args) => {
      return await ctx.db.query("messages").filter((q) => q.eq(q.field("user"), args.user)).filter((q) => q.eq(q.field("conversation"), args.conversation)).collect();
    },
  });
  
  export const GetConversations = query({
    args: {
      user: v.string(),
    },
    handler: async (ctx, args) => {
      return await ctx.db
        .query("conversations")
        .withIndex("by_user", (q) => q.eq("user", args.user))
        .collect();
    },
  });
  
  export const CreateConversation = mutation({
    args: {
      user: v.string(),
    },
    handler: async (ctx, args) => {
      return await ctx.db.insert("conversations", {
        user: args.user,
        createdAt: Date.now(),
        name: "New Conversation",
        tags: [],
      });
    },
  });
  