import { mutation } from "./_generated/server";

const models = [
  {
    model: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash Experimental",
    description:
      "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to Gemini Flash 1.5, while maintaining quality on par with larger models like Gemini Pro 1.5. It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences.",
    input_modalities: ["image", "text", "file"],
    output_modalities: ["text"],
    created_at: "Feb 5, 2025",
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
    created_at: "May 22, 2025",
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
    created_at: "Jul 18, 2024",
    author: "OpenAI",
    context_length: 128000,
    reasoning: false,
    reasoning_tags: [],
    price: [15, 60],
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    description:
      "DeepSeek R1 is here: Performance on par with OpenAI o1, but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.",
    input_modalities: ["text"],
    output_modalities: ["text"],
    created_at: "Jan 20, 2025",
    author: "DeepSeek",
    context_length: 128000,
    reasoning: true,
    reasoning_tags: [],
    price: [45, 215],
    pinned: true,
    provider: "openrouter" as const,
  },
];

export const updateModels = mutation({
  args: {},
  handler: async (ctx) => {
    const existingModels = await ctx.db.query("models").collect();

    // Create a map of existing models by their model identifier
    const existingModelMap = new Map(
      existingModels.map((model) => [model.model, model]),
    );

    // Create a set of model identifiers from the models array
    const newModelIds = new Set(models.map((m) => m.model));

    let updatedCount = 0;
    let insertedCount = 0;
    let deletedCount = 0;

    // Update existing models or insert new ones
    for (const model of models) {
      const existingModel = existingModelMap.get(model.model);

      if (existingModel) {
        // Model exists, update it
        await ctx.db.patch(existingModel._id, {
          name: model.name,
          description: model.description,
          input_modalities: model.input_modalities,
          output_modalities: model.output_modalities,
          created_at: model.created_at,
          author: model.author,
          context_length: model.context_length,
          reasoning: model.reasoning,
          reasoning_tags: model.reasoning_tags,
          price: model.price,
          pinned: model.pinned,
          provider: model.provider,
        });
        updatedCount++;
      } else {
        // Model doesn't exist, insert it
        await ctx.db.insert("models", model);
        insertedCount++;
      }
    }

    // Delete models that exist in database but not in the models array
    for (const existingModel of existingModels) {
      if (!newModelIds.has(existingModel.model)) {
        await ctx.db.delete(existingModel._id);
        deletedCount++;
      }
    }

    return {
      updated: updatedCount,
      inserted: insertedCount,
      deleted: deletedCount,
      models: models,
    };
  },
});
