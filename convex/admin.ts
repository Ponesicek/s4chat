import { mutation } from "./_generated/server";

const models = [
  {
    model: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash Experimental",
    description:
      "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to Gemini Flash 1.5, while maintaining quality on par with larger models like Gemini Pro 1.5. It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences.",
    input_modalities: [],
    output_modalities: [],
    createdAt: "Feb 5, 2025",
    author: "Google",
    context_length: 1048576,
    reasoning: false,
    reasoning_tags: [],
    price: [10, 40],
    pinned: true,
  },
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
    model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
    name: "Deepseek R1 0528 Qwen3 8B",
    description:
      "DeepSeek-R1-0528 is a lightly upgraded release of DeepSeek R1 that taps more compute and smarter post-training tricks, pushing its reasoning and inference to the brink of flagship models like O3 and Gemini 2.5 Pro. It now tops math, programming, and logic leaderboards, showcasing a step-change in depth-of-thought.",
    input_modalities: [],
    output_modalities: [],
    createdAt: "May 29, 2025",
    author: "Deeseek",
    context_length: 131072,
    reasoning: true,
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
