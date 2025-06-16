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
    pinned: v.boolean(),
    provider: v.union(
      v.literal("openrouter"),
      v.literal("anthropic"),
      v.literal("google"),
      v.literal("openai"),
    ),
  }),
  conversations: defineTable({
    user: v.string(),
    name: v.string(),
    tags: v.array(v.string()),
  }).index("by_user", ["user"]),
});
