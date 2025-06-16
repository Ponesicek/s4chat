
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
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "google/gemini-2.5-flash-preview-05-20",
    name: "Gemini 2.5 Flash Preview 05-20",
    description:
      "Gemini 2.5 Flash May 20th Checkpoint is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in thinking capabilities, enabling it to provide responses with greater accuracy and nuanced context handling.",
    input_modalities: ["image", "text", "file"],
    output_modalities: ["text"],
    created_at: "May 20, 2025",
    author: "Google",
    context_length: 1048576,
    reasoning: false,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "google/gemini-2.5-flash-preview-05-20:thinking",
    name: "Gemini 2.5 Flash Preview 05-20 (thinking)",
    description:
      "Gemini 2.5 Flash May 20th Checkpoint is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in thinking capabilities, enabling it to provide responses with greater accuracy and nuanced context handling.",
    input_modalities: ["image", "text", "file"],
    output_modalities: ["text"],
    created_at: "May 20, 2025",
    author: "Google",
    context_length: 1048576,
    reasoning: true,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "google/gemini-2.5-pro-preview",
    name: "Gemini 2.5 Pro Preview 06-05",
    description:
      "Gemini 2.5 Pro is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in thinking capabilities, enabling it to provide responses with greater accuracy and nuanced context handling.",
    input_modalities: ["image", "text", "file"],
    output_modalities: ["text"],
    created_at: "Jun 5, 2025",
    author: "Google",
    context_length: 1048576,
    reasoning: true,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    description:
      "Claude Sonnet 4 significantly enhances the capabilities of its predecessor, Sonnet 3.7, excelling in both coding and reasoning tasks with improved precision and controllability. Achieving state-of-the-art performance on SWE-bench (72.7%), Sonnet 4 balances capability and computational efficiency, making it suitable for a broad range of applications from routine coding tasks to complex software development projects. Key enhancements include improved autonomous codebase navigation, reduced error rates in agent-driven workflows, and increased reliability in following intricate instructions. Sonnet 4 is optimized for practical everyday use, providing advanced reasoning capabilities while maintaining efficiency and responsiveness in diverse internal and external scenarios.",
    input_modalities: ["image", "text"],
    output_modalities: ["text"],
    created_at: "May 22, 2025",
    author: "Anthropic",
    context_length: 200000,
    reasoning: true,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "anthropic/claude-opus-4",
    name: "Claude Opus 4",
    description:
      "Claude Opus 4 is benchmarked as the world's best coding model, at time of release, bringing sustained performance on complex, long-running tasks and agent workflows. It sets new benchmarks in software engineering, achieving leading results on SWE-bench (72.5%) and Terminal-bench (43.2%). ",
    input_modalities: ["image", "text"],
    output_modalities: ["text"],
    created_at: "May 22, 2025",
    author: "Anthropic",
    context_length: 200000,
    reasoning: true,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "anthropic/claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    description:
      "Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks.",
    input_modalities: ["image", "text"],
    output_modalities: ["text"],
    created_at: "Feb 24, 2025",
    author: "Anthropic",
    context_length: 200000,
    reasoning: false,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "anthropic/claude-3.7-sonnet:thinking",
    name: "Claude 3.7 Sonnet (thinking)",
    description:
      "Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks.",
    input_modalities: ["image", "text"],
    output_modalities: ["text"],
    created_at: "Feb 24, 2025",
    author: "Anthropic",
    context_length: 200000,
    reasoning: true,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    description:
      "New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at: Coding: Scores ~49% on SWE-Bench Verified, higher than the last best score, and without any fancy prompt scaffolding",
    input_modalities: ["image", "text"],
    output_modalities: ["text"],
    created_at: "Oct 22, 2025",
    author: "Anthropic",
    context_length: 200000,
    reasoning: false,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "openai/gpt-4o",
    name: "ChatGPT-4o",
    description:
      "GPT-4o is OpenAI's multimodal flagship model capable of real-time reasoning over text and vision.",
    input_modalities: ["text", "image", "file"],
    output_modalities: ["text"],
    created_at: "May 15, 2024",
    author: "OpenAI",
    context_length: 128000,
    reasoning: true,
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
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "openai/gpt-4.1",
    name: "GPT-4.1",
    description:
      "GPT-4.1 is OpenAI's flagship model optimized for advanced instruction following, software engineering, and long-context reasoning.",
    input_modalities: ["text", "image", "file"],
    output_modalities: ["text"],
    created_at: "Apr 14, 2025",
    author: "OpenAI",
    context_length: 1000000,
    reasoning: true,  
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "openai/o3",
    name: "OpenAI o3",
    description:
      "o3 is a powerful general-purpose language model delivering strong performance on math, science and coding tasks.",
    input_modalities: ["text", "image"],
    output_modalities: ["text"],
    created_at: "Apr 16, 2025",
    author: "OpenAI",
    context_length: 1000000,
    reasoning: true,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "openai/o4-mini",
    name: "OpenAI o4-mini",
    description:
      "OpenAI o4-mini is a compact reasoning model in the o-series, optimized for fast, cost-efficient performance while retaining strong multimodal and agentic capabilities. It supports tool use and demonstrates competitive reasoning and coding performance across benchmarks like AIME (99.5% with Python) and SWE-bench, outperforming its predecessor o3-mini and even approaching o3 in some domains.",
    input_modalities: ["text", "image"],
    output_modalities: ["text"],
    created_at: "Apr 16, 2025",
    author: "OpenAI",
    context_length: 2000000,
    reasoning: true,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "gpt-image-1",
    name: "GPT Image 1",
    description:
      "GPT Image 1 is our new state-of-the-art image generation model. It is a natively multimodal language model that accepts both text and image inputs, and produces image outputs.",
    input_modalities: ["text", "image"],
    output_modalities: ["image"],
    created_at: "Apr 23, 2025",
    author: "OpenAI",
    context_length: 0,
    reasoning: false,
    pinned: true,
    provider: "openai" as const,
  },
  {
    model: "x-ai/grok-3-beta",
    name: "Grok 3",
    description:
      "Grok 3 is xAI's latest model designed for enterprise data extraction, coding, and summarization with strong reasoning abilities.",
    input_modalities: ["text"],
    output_modalities: ["text"],
    created_at: "Jun 1, 2025",
    author: "xAI",
    context_length: 128000,
    reasoning: true,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "x-ai/grok-3-mini-beta",
    name: "Grok 3 Mini",
    description:
      "Grok 3 Mini is a lightweight version of Grok 3, ideal for latency-sensitive quantitative reasoning tasks.",
    input_modalities: ["text"],
    output_modalities: ["text"],
    created_at: "Jun 1, 2025",
    author: "xAI",
    context_length: 128000,
    reasoning: true,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "qwen/qwq-32b",
    name: "Qwen QwQ 32B",
    description:
      "QwQ is the reasoning model of the Qwen series. Compared with conventional instruction-tuned models, QwQ, which is capable of thinking and reasoning, can achieve significantly enhanced performance in downstream tasks, especially hard problems. ",
    input_modalities: ["text"],
    output_modalities: ["text"],
    created_at: "Mar 5, 2025",
    author: "Qwen",
    context_length: 131072,
    reasoning: true,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "deepseek/deepseek-chat-v3",
    name: "DeepSeek V3",
    description:
      "DeepSeek V3 is a 685B-parameter mixture-of-experts model offering strong general reasoning and multilingual chat abilities.",
    input_modalities: ["text", "image"],
    output_modalities: ["text"],
    created_at: "Mar 24, 2025",
    author: "DeepSeek",
    context_length: 128000,
    reasoning: true,
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
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "meta-llama/llama-4-scout",
    name: "Llama 4 Scout",
    description:
      "Llama 4 Scout 17B is a multimodal MoE model from Meta supporting multilingual chat and image understanding tasks.",
    input_modalities: ["text", "image"],
    output_modalities: ["text"],
    created_at: "Apr 10, 2025",
    author: "Meta",
    context_length: 1048576,
    reasoning: true,
    pinned: true,
    provider: "openrouter" as const,
  },
  {
    model: "meta-llama/llama-4-maverick",
    name: "Llama 4 Maverick",
    description:
      "Llama 4 Maverick 17B is a high-capacity multimodal MoE model optimized for vision-language reasoning and assistant-style interaction.",
    input_modalities: ["text", "image"],
    output_modalities: ["text"],
    created_at: "Apr 5, 2025",
    author: "Meta",
    context_length: 1048576,
    reasoning: true,
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