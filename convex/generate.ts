import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateMessage = mutation({
  args: {
    user: v.string(),
    body: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {

    const model = await ctx.db.query("models").filter((q) => q.eq(q.field("model"), "deepseek/deepseek-r1-0528:free")).first();

    if (!model) {
      throw new Error("Model not found");
    }

    console.log("This TypeScript function is running on the server.");
    await ctx.db.insert("messages", {
      user: args.user,
      body: args.body,
      createdAt: Date.now(),
      model: model._id
    });
  },
});

export const GetModels = query({
  args: { },
  handler: async (ctx) => {
    return await ctx.db.query("models").collect();
  },
});

export const GetMessages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").collect();
  },
});