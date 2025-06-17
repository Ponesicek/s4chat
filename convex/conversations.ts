import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const GetMessagesPaginated = query({
  args: {
    user: v.string(),
    conversation: v.id("conversations"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("messages"),
        _creationTime: v.number(),
        user: v.string(),
        content: v.string(),
        model: v.id("models"),
        conversation: v.id("conversations"),
        role: v.union(v.literal("user"), v.literal("assistant")),
        isImage: v.boolean(),
        reasoning: v.optional(v.string()),
        status: v.optional(v.union( 
          v.object({
            type: v.literal("pending"),
            message: v.string(),
          }),
          v.object({
            type: v.literal("completed"),
          }),
          v.object({
            type: v.literal("error"),
            message: v.string(),
          }))),
      }),
    ),
    isDone: v.boolean(),
    continueCursor: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversation);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (conversation.user !== args.user) {
      throw new Error("User not authorized to access this conversation");
    }
    const result = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversation", args.conversation),
      )
      .order("desc")
      .paginate(args.paginationOpts);
    return {
      page: result.page,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const GetMessagesPaginatedWithModels = query({
  args: {
    user: v.string(),
    conversation: v.id("conversations"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("messages"),
        _creationTime: v.number(),
        user: v.string(),
        content: v.string(),
        model: v.object({
          _id: v.id("models"),
          name: v.string(),
          model: v.string(),
          author: v.string(),
          provider: v.union(
            v.literal("openrouter"),
            v.literal("anthropic"),
            v.literal("google"),
            v.literal("openai"),
          ),
        }),
        conversation: v.id("conversations"),
        role: v.union(v.literal("user"), v.literal("assistant")),
        isImage: v.boolean(),
        reasoning: v.optional(v.string()),
        status: v.optional(v.union( 
          v.object({
            type: v.literal("pending"),
            message: v.string(),
          }),
          v.object({
            type: v.literal("completed"),
          }),
          v.object({
            type: v.literal("error"),
            message: v.string(),
          }))),
      }),
    ),
    isDone: v.boolean(),
    continueCursor: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversation);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (conversation.user !== args.user) {
      throw new Error("User not authorized to access this conversation");
    }
    const result = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversation", args.conversation),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    // Fetch model information for each message
    const messagesWithModels = await Promise.all(
      result.page.map(async (message) => {
        const model = await ctx.db.get(message.model);
        if (!model) {
          throw new Error("Model not found");
        }
        return {
          ...message,
          model: {
            _id: model._id,
            name: model.name,
            model: model.model,
            author: model.author,
            provider: model.provider,
          },
        };
      }),
    );

    return {
      page: messagesWithModels,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const GetMessages = query({
  args: {
    user: v.string(),
    conversation: v.id("conversations"),
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
      isImage: v.boolean(),
      reasoning: v.optional(v.string()),
      status: v.optional(v.union( 
        v.object({
          type: v.literal("pending"),
          message: v.string(),
        }),
        v.object({
          type: v.literal("completed"),
        }),
        v.object({
          type: v.literal("error"),
          message: v.string(),
        }))),
    }),
  ),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversation);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (conversation.user !== args.user) {
      throw new Error("User not authorized to access this conversation");
    }
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversation", args.conversation),
      )
      .order("asc")
      .take(40);
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

export const GetImage = query({
  args: {
    user: v.string(),
    image: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    try {
      return (await ctx.storage.getUrl(args.image as Id<"_storage">)) ?? "";
    } catch (error) {
      console.error(error);
      return "";
    }
  },
});

export const StopGeneration = mutation({
  args: {
    conversation: v.id("conversations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const messages = await ctx.db.query("messages").withIndex("by_conversation", (q) => q.eq("conversation", args.conversation)).take(1);
    for (const message of messages) {
      await ctx.db.patch(message._id, {
        status: {
          type: "error",
          message: "Generation stopped",
        },
      });
    }
    return null;
  },
});

export const BranchConversation = mutation({
  args: {
    user: v.string(),
    conversation: v.id("conversations"),
    branchedFrom: v.id("messages"),
  },
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversation);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    const messages = await ctx.db.query("messages").withIndex("by_conversation", (q) => q.eq("conversation", args.conversation)).collect();
    const newConversation = await ctx.db.insert("conversations", {
      user: conversation.user,
      name: conversation.name,
      tags: conversation.tags,
    });
    for (const message of messages) {
      await ctx.db.insert("messages", {
        user: args.user,
        content: message.content,
        model: message.model,
        conversation: newConversation,
        role: message.role,
        isImage: message.isImage,
        reasoning: message.reasoning,
        status: message.status,
      });
      if (message._id === args.branchedFrom) {
        break;
      }
    }
    return newConversation;
  },
});

export const EditMessage = mutation({
  args: {
    user: v.string(),
    message: v.string(),
    content: v.string(),
    apiKey: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.message as Id<"messages">);
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.user !== args.user) {
      throw new Error("User not authorized to edit this message");
    }
    await ctx.db.patch(args.message as Id<"messages">, {
      content: args.content,
    });
    // Delete all messages except the one being edited
    const messages = await ctx.db.query("messages").withIndex("by_conversation", (q) => q.eq("conversation", message.conversation)).order("desc").collect();
    for (const m of messages) {
      const cur = m._id;
      await ctx.db.delete(m._id);
      if (cur === args.message) {
        break;
      }
    }
    await ctx.runMutation(api.generate.generateMessage, {
      user: args.user,
      content: args.content,
      model: message.model,
      conversation: message.conversation,
      apiKey: args.apiKey,
      useMCP: false,
    });
  },
});