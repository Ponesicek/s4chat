import {
  mutation,
  query,
  internalAction,
  internalMutation,
} from "./_generated/server";
import { v } from "convex/values";
import { generateText, streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { api, internal } from "./_generated/api";
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
    isName: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.isName) {
      await ctx.db.patch(args.conversation, {
        name: args.content,
      });
      return;
    }
    if (args.messageId === undefined) {
      return await ctx.db.insert("messages", {
        user: args.user,
        content: args.content,
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
    const messagesQuery = await ctx.runQuery(api.conversations.GetMessages, {
      user: args.user,
      conversation: args.conversation,
    });
    const shouldGenerateName = messagesQuery.length === 1;
    const messagesHistory: { role: "user" | "assistant"; content: string }[] =
      [];
    for (const message of messagesQuery) {
      if (message.role === "user") {
        messagesHistory.push({ role: "user", content: message.content });
      } else {
        messagesHistory.push({ role: "assistant", content: message.content });
      }
    }
    const response = await streamText({
      model: openrouter.chat(args.modelName),
      messages: messagesHistory,
    });

    if (!response) {
      return;
    }

    let namePromise;
    if (shouldGenerateName) {
      namePromise = generateText({
        model: openrouter.chat("google/gemini-2.0-flash-001"),
        prompt: args.content,
        system:
          "You are a helpful assistant that generates a name for a conversation. The name should be a phrase that captures the essence of the conversation. The name should be no more than 5 words.",
      }).then(async (generateName) => {
        if (generateName.text) {
          await ctx.runMutation(internal.generate.writeResponse, {
            user: args.user,
            content: generateName.text.trim(),
            model: args.model,
            modelName: args.modelName,
            conversation: args.conversation,
            isName: true,
          });
        }
      });
    }

    let message = "";
    const messageId = await ctx.runMutation(internal.generate.writeResponse, {
      user: args.user,
      content: message,
      model: args.model,
      modelName: args.modelName,
      conversation: args.conversation,
      messageId: undefined,
      isName: false,
    });

    console.log("Generating message with model: " + args.modelName);
    for await (const chunk of response.textStream) {
      message += chunk;
      await ctx.runMutation(internal.generate.writeResponse, {
        user: args.user,
        content: message,
        model: args.model,
        modelName: args.modelName,
        conversation: args.conversation,
        messageId: messageId as Id<"messages">,
        isName: false,
      });
    }

    if (namePromise) {
      await namePromise;
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

    await ctx.db.insert("messages", {
      user: args.user,
      content: args.content,
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
