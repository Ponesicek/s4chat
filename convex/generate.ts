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

export const writeResponse = internalMutation({
  args: {
    user: v.string(),
    content: v.string(),
    model: v.id("models"),
    conversation: v.id("conversations"),
    modelName: v.string(),
    messageId: v.optional(v.id("messages")),
    isName: v.boolean(),
    reasoning: v.optional(v.string()),
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
        isImage: false,
        reasoning: args.reasoning,
      });
    }
    await ctx.db.patch(args.messageId, {
      content: args.content,
      reasoning: args.reasoning,
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
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const messagesQuery = await ctx.runQuery(api.conversations.GetMessages, {
      user: args.user,
      conversation: args.conversation,
    });
    const shouldGenerateName = messagesQuery.length === 1;

    const messagesHistory: Array<
      | {
          role: "user";
          content:
            | string
            | Array<
                | { type: "text"; text: string }
                | { type: "image"; image: string }
              >;
        }
      | { role: "assistant"; content: string }
    > = [];

    let currentUserContent: Array<
      { type: "text"; text: string } | { type: "image"; image: string }
    > = [];

    for (const message of messagesQuery) {
      if (message.role === "user") {
        if (message.isImage) {
          const image = await ctx.storage.getUrl(
            message.content as Id<"_storage">,
          );
          if (image) {
            currentUserContent.push({ type: "image", image: image });
          }
        } else {
          if (message.content.trim()) {
            currentUserContent.push({ type: "text", text: message.content });
          }

          if (currentUserContent.length > 0) {
            messagesHistory.push({
              role: "user",
              content:
                currentUserContent.length === 1 &&
                currentUserContent[0].type === "text"
                  ? currentUserContent[0].text
                  : currentUserContent,
            });
            currentUserContent = [];
          }
        }
      } else if (message.role === "assistant") {
        messagesHistory.push({
          role: "assistant",
          content: message.content,
        });
      }
    }

    if (currentUserContent.length > 0) {
      messagesHistory.push({
        role: "user",
        content:
          currentUserContent.length === 1 &&
          currentUserContent[0].type === "text"
            ? currentUserContent[0].text
            : currentUserContent,
      });
    }

    if (!args.apiKey) {
      args.apiKey = process.env.OPENROUTER_API_KEY || "";
    }

    const openrouter = createOpenRouter({
      apiKey: args.apiKey,
    });
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
    let reasoning = "";
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
    for await (const chunk of response.fullStream) {
      switch (chunk.type) {
        case "text-delta":
          message += chunk.textDelta;
          break;
        case "reasoning":
          reasoning += chunk.textDelta;
          break;
      }
      await ctx.runMutation(internal.generate.writeResponse, {
        user: args.user,
        content: message,
        reasoning: reasoning,
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
    apiKey: v.string(),
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
      isImage: false,
    });
    await ctx.scheduler.runAfter(0, internal.generate.generateMessageAction, {
      user: args.user,
      content: args.content,
      model: model._id,
      modelName: model.model,
      conversation: args.conversation,
      apiKey: args.apiKey,
    });
  },
});

export const GetModels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("models").collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveImage = mutation({
  args: {
    user: v.string(),
    conversation: v.id("conversations"),
    model: v.id("models"),
    storageId: v.id("_storage"),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) {
      throw new Error("Image not found");
    }

    return await ctx.db.insert("messages", {
      user: args.user,
      content: args.storageId, // Store the storage ID instead of base64
      model: args.model,
      conversation: args.conversation,
      role: "user",
      isImage: true,
    });
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
