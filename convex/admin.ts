import { mutation } from "./_generated/server";

const models = [
  {
    model: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek V3",
    description:
      "DeepSeek V3, a 685B-parameter, mixture-of-experts model, is the latest iteration of the flagship chat model family from the DeepSeek team. It succeeds the DeepSeek V3 model and performs really well on a variety of tasks.",
    input_modalities: [],
    output_modalities: [],
    createdAt: "Mar 24, 2025",
    author: "DeepSeek",
    context_length: 163840,
    reasoning: false,
    reasoning_tags: [],
    price: [0, 0],
    pinned: true,
  },
  {
    model: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    description:
      "DeepSeek R1 is here: Performance on par with OpenAI o1, but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.",
    input_modalities: [],
    output_modalities: [],
    createdAt: "May 28, 2025",
    author: "DeepSeek",
    context_length: 163840,
    reasoning: false,
    reasoning_tags: [],
    price: [0, 0],
    pinned: true,
  },
  {
    model: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash Experimental (free)",
    description:
      "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to Gemini Flash 1.5, while maintaining quality on par with larger models like Gemini Pro 1.5. It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences.",
    input_modalities: [],
    output_modalities: [],
    createdAt: "Dec 11, 2024",
    author: "Google",
    context_length: 1048576,
    reasoning: false,
    reasoning_tags: [],
    price: [0, 0],
    pinned: true,
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
