import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  messages: defineTable({
    user: v.string(),
    content: v.string(),
    model: v.id("models"),
    conversation: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    isImage: v.boolean(),
    reasoning: v.optional(v.string()),
  }).index("by_conversation", ["conversation"]),
  models: defineTable({
    model: v.string(),
    name: v.string(),
    description: v.string(),
    input_modalities: v.array(v.string()),
    output_modalities: v.array(v.string()),
    created_at: v.string(),
    author: v.string(),
    context_length: v.number(),
    reasoning: v.boolean(),
    reasoning_tags: v.array(v.string()),
    price: v.array(v.number()),
    pinned: v.boolean(),
    provider: v.union(
      v.literal("openrouter"),
      v.literal("anthropic"),
      v.literal("google"),
    ),
  }),
  conversations: defineTable({
    user: v.string(),
    name: v.string(),
    tags: v.array(v.string()),
  }).index("by_user", ["user"]),
  users: defineTable({
    openrouter_api_key: v.string(),
    theme: v.object({
      theme: v.union(
        v.literal("light"),
        v.literal("dark"),
        v.literal("system"),
      ),
      colors: v.union(
        v.literal("default"),
        v.literal("gruvbox"),
        v.literal("catpuccin"),
        v.literal("nord"),
        v.literal("t3"),
      ),
      font: v.union(
        v.literal("inter"),
        v.literal("roboto"),
        v.literal("system"),
        v.literal("mono"),
      ),
      fontSize: v.union(
        v.literal("small"),
        v.literal("medium"),
        v.literal("large"),
      ),
    }),
  }),
});
