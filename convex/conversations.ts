import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const GetMessages = query({
  args: {
    user: v.string(),
    conversation: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      user: v.string(),
      content: v.string(),
      model: v.id("models"),
      conversation: v.id("conversations"),
      role: v.union(v.literal("user"), v.literal("assistant")),
    }),
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 40;
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversation", args.conversation))
      .order("desc")
      .take(limit);
  },
});

export const GetConversations = query({
  args: {
    user: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("conversations"),
      _creationTime: v.number(),
      user: v.string(),
      name: v.string(),
      tags: v.array(v.string()),
    }),
  ),
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
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }
    return await ctx.db.insert("conversations", {
      user: args.user,
      name: "New Conversation",
      tags: [],
    });
  },
});

export const DeleteConversation = mutation({
  args: {
    user: v.string(),
    conversation: v.id("conversations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }
    if (user.subject !== args.user) {
      throw new Error("User not authorized");
    }
    await ctx.db.delete(args.conversation);
    return null;
  },
});
