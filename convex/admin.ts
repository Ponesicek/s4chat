import { mutation } from "./_generated/server";

const models = [
  {
    model: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash Experimental",
    description:
      "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to Gemini Flash 1.5, while maintaining quality on par with larger models like Gemini Pro 1.5. It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences.",
    input_modalities: ["image", "text", "file"],
    output_modalities: ["text"],
    createdAt: "Feb 5, 2025",
    author: "Google",
    context_length: 1048576,
    reasoning: false,
    reasoning_tags: [],
    price: [10, 40],
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    description:
      "Claude Sonnet 4 significantly enhances the capabilities of its predecessor, Sonnet 3.7, excelling in both coding and reasoning tasks with improved precision and controllability. Achieving state-of-the-art performance on SWE-bench (72.7%), Sonnet 4 balances capability and computational efficiency, making it suitable for a broad range of applications from routine coding tasks to complex software development projects. Key enhancements include improved autonomous codebase navigation, reduced error rates in agent-driven workflows, and increased reliability in following intricate instructions. Sonnet 4 is optimized for practical everyday use, providing advanced reasoning capabilities while maintaining efficiency and responsiveness in diverse internal and external scenarios.",
    input_modalities: ["image", "text", "file"],
    output_modalities: ["text"],
    createdAt: "May 22, 2025",
    author: "Anthropic",
    context_length: 200000,
    reasoning: true,
    reasoning_tags: [],
    price: [300, 1500],
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "openai/gpt-4o-mini",
    name: "GPT-4o-mini",
    description:
      "GPT-4o mini is OpenAI's newest model after GPT-4 Omni, supporting both text and image inputs with text outputs. As their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than GPT-3.5 Turbo. It maintains SOTA intelligence, while being significantly more cost-effective.",
    input_modalities: ["text", "image", "file"],
    output_modalities: ["text"],
    createdAt: "Jul 18, 2024",
    author: "OpenAI",
    context_length: 128000,
    reasoning: false,
    reasoning_tags: [],
    price: [15, 60],
    pinned: true,
    provider: "openrouter" as const,
  },
];

export const updateModels = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing documents from the models table
    const existingModels = await ctx.db.query("models").collect();
    for (const model of existingModels) {
      await ctx.db.delete(model._id);
    }

    console.log(`Deleted ${existingModels.length} existing models`);

    // Insert new models data
    const insertPromises = models.map((model) =>
      ctx.db.insert("models", model),
    );

    const insertedIds = await Promise.all(insertPromises);
    console.log(`Inserted ${insertedIds.length} new models`);

    return {
      deleted: existingModels.length,
      inserted: insertedIds.length,
      models: models,
    };
  },
});
