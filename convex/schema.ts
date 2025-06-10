import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  messages: defineTable({
    user: v.string(),
    body: v.string(),
    createdAt: v.number(),
    model: v.id("models"),
  }),
  models: defineTable({
    model: v.string(),
    name: v.string(),
    description: v.string(),
  }),
});
