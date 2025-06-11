import {
  mutation,
  query,
  internalAction,
  internalMutation,
} from "./_generated/server";
import { v } from "convex/values";
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const writeResponse = internalMutation({
  args: {
    user: v.string(),
    content: v.string(),
    model: v.id("models"),
    conversation: v.id("conversations"),
    modelName: v.string(),
    messageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    if (args.messageId === undefined) {
      return await ctx.db.insert("messages", {
        user: args.user,
        content: args.content,
        createdAt: Date.now(),
        model: args.model,
        conversation: args.conversation,
        role: "assistant",
      });
    }
    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
  },
});

export const generateMessageAction = internalAction({
  args: {
    user: v.string(),
    content: v.string(),
    model: v.id("models"),
    modelName: v.string(),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const response = streamText({
      model: openrouter.chat(args.modelName),
      prompt: args.content,
    });
    if (!response) {
      return;
    }
    let message = "";
    const messageId = await ctx.runMutation(internal.generate.writeResponse, {
      user: args.user,
      content: message,
      model: args.model,
      modelName: args.modelName,
      conversation: args.conversation,
      messageId: undefined,
    });
    for await (const chunk of response.textStream) {
      message += chunk;
      await ctx.runMutation(internal.generate.writeResponse, {
        user: args.user,
        content: message,
        model: args.model,
        modelName: args.modelName,
        conversation: args.conversation,
        messageId: messageId as Id<"messages">,
      });
    }
    return message;
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
      .filter((q) => q.eq(q.field("_id"), args.model))
      .first();

    if (!model) {
      throw new Error("Model not found");
    }

    console.log("Generating message with model: " + model.model);
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
      model: model._id,
      modelName: model.model,
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
