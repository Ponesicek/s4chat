import { mutation, query, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { generateText } from "ai";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { internal } from "./_generated/api";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const writeResponse = internalMutation({
  args: {
    user: v.string(),
    content: v.string(),
    model: v.id("models"),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
    user: args.user,
    content: args.content,
    createdAt: Date.now(),
    model: args.model,
    conversation: args.conversation,
    role: "assistant",
  });
  },
});

export const generateMessageAction = internalAction({
  args: {
    user: v.string(),
    content: v.string(),
    model: v.id("models"),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const response = await generateText({
      model: openrouter.chat(args.model),
      prompt: args.content,
    });
    if (!response) {
      return;
    }
    await ctx.runMutation(internal.generate.writeResponse, {
      user: args.user,
      content: response.text,
      model: args.model,
      conversation: args.conversation,
    });
    return response;
  },
});

export const generateMessage = mutation({
  args: {
    user: v.string(),
    content: v.string(),
    model: v.id("models"),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const model = await ctx.db
      .query("models")
      .filter((q) => q.eq(q.field("model"), args.model))
      .first();

    if (!model) {
      throw new Error("Model not found");
    }

    console.log("This TypeScript function is running on the server.");
    await ctx.db.insert("messages", {
      user: args.user,
      content: args.content,
      createdAt: Date.now(),
      model: model._id,
      conversation: args.conversation,
      role: "user",
    });

    await ctx.scheduler.runAfter(0, internal.generate.generateMessageAction, {
      user: args.user,
      content: args.content,
      model: args.model,
      conversation: args.conversation,
    });
  },
});

export const GetModels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("models").collect();
  },
});

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
      .filter((q) => q.eq(q.field("user"), args.user))
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
