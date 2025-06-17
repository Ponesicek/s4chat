import {
  mutation,
  query,
  internalAction,
  internalMutation,
} from "./_generated/server";
import { v } from "convex/values";
import { generateText, experimental_generateImage as generateImage, streamText, experimental_createMCPClient as createMCPClient,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { openai } from '@ai-sdk/openai';

// Global MCP client singleton - only initialized in actions
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
let globalMCPClient: any[] | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalTools: Record<string, any> = {};
let mcpInitPromise: Promise<void> | null = null;

// Define MCP server configurations for better type safety and maintainability
interface MCPServerConfig {
  name: string;
  url: string;
  config?: {
    type?: string;
    properties?: Record<string, unknown>;
    description?: string;
    [key: string]: unknown;
  };
}

const mcpServerConfigs: MCPServerConfig[] = [
  {
    name: "context7",
    url: "https://server.smithery.ai/@upstash/context7-mcp/mcp"
  },
  {
    name: "exa", 
    url: "https://server.smithery.ai/exa/mcp",
    config: {
      
        exaApiKey: process.env.EXA_API_KEY || "",
      
    }
  },
  {
    name: "sequential thinking",
    url: "https://server.smithery.ai/@smithery-ai/server-sequential-thinking/mcp"
  }
];

async function initializeMCPClient() {
  if (mcpInitPromise) {
    return mcpInitPromise;
  }

  mcpInitPromise = (async () => {
    try {
      console.log("Initializing MCP clients...");
      
      const apiKey = process.env.SMITHERY_API_KEY;
      if (!apiKey) {
        throw new Error("SMITHERY_API_KEY environment variable is required");
      }

      // Initialize all clients in parallel for better performance
      const clientPromises = mcpServerConfigs.map(async (serverConfig) => {
        try {
          // Build URL with API key and optional config parameters
          const url = new URL(serverConfig.url);
          url.searchParams.set('api_key', apiKey);
          
          // Add config parameters to URL if provided
          if (serverConfig.config) {
            // Add any additional config as query parameters (skip schema-related keys)
            Object.entries(serverConfig.config).forEach(([key, value]) => {
              if (!['type', 'properties', 'description', 'items', 'default'].includes(key) && value !== undefined && value !== '') {
                url.searchParams.set(key, String(value));
              }
            });
          }
          
          const transport = new StreamableHTTPClientTransport(url);
          
          console.log(`Initializing MCP client for ${serverConfig.name}...`);
          const client = await createMCPClient({ transport });
          
          const tools = await client.tools();
          console.log(`Initialized MCP client for ${serverConfig.name} with ${Object.keys(tools).length} tools`);
          
          return { name: serverConfig.name, client, tools };
        } catch (error) {
          console.error(`Failed to initialize MCP client for ${serverConfig.name}:`, error);
          return null;
        }
      });

      // Wait for all client initializations to complete
      const results = await Promise.all(clientPromises);
      
      // Filter out failed initializations and organize successful ones
      const successfulClients = results.filter((result): result is NonNullable<typeof result> => result !== null);
      
      if (successfulClients.length === 0) {
        throw new Error("Failed to initialize any MCP clients");
      }

      // Update global state with successful clients
      globalMCPClient = successfulClients.map(result => result.client);
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
       globalTools = successfulClients.reduce((acc, result) => {
         // Flatten tools from all clients into a single object
         Object.assign(acc, result.tools);
         return acc;
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       }, {} as Record<string, any>);

      console.log(
        `Successfully initialized ${successfulClients.length}/${mcpServerConfigs.length} MCP clients:`,
        successfulClients.map(r => r.name).join(", ")
      );
      console.log("Available tools:", Object.keys(globalTools));

    } catch (error) {
      console.error("Failed to initialize MCP clients:", error);
      globalMCPClient = null;
      globalTools = {};
      throw error; // Re-throw to allow caller to handle
    }
  })();

  return mcpInitPromise;
}

export const writeResponse = internalMutation({
  args: {
    user: v.string(),
    content: v.string(),
    model: v.id("models"),
    conversation: v.id("conversations"),
    modelName: v.string(),
    messageId: v.optional(v.id("messages")),
    isName: v.boolean(),
    reasoning: v.optional(v.string()),
    status: v.object({
      type: v.string(),
      message: v.string(),
    }),
    isImage: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.isName) {
      await ctx.db.patch(args.conversation, {
        name: args.content,
      });
      return;
    }
    if (args.messageId === undefined) {
      return await ctx.db.insert("messages", {
        user: args.user,
        content: args.content,
        model: args.model,
        conversation: args.conversation,
        role: "assistant",
        isImage: args.isImage,
        reasoning: args.reasoning,
      });
    }
    if (args.status) {
      switch (args.status.type) {
        case "pending":
          await ctx.db.patch(args.messageId, {
            status: {
              type: "pending",
              message: args.status.message,
            },
          });
          break;
        case "completed":
          await ctx.db.patch(args.messageId, {
            status: {
              type: "completed",
            },
          });
          break;
        case "error":
          await ctx.db.patch(args.messageId, {
            status: {
              type: "error",
              message: args.status.message,
            },
          });
          break;
        default:
          break;
      }
    }
    await ctx.db.patch(args.messageId, {
      content: args.content,
      reasoning: args.reasoning,
    });
  },
});

export const generateMessageAction = internalAction({
  args: {
    user: v.string(),
    content: v.string(),
    model: v.id("models"),
    modelName: v.string(),
    conversation: v.id("conversations"),
    apiKey: v.string(),
    useMCP: v.boolean(),
  },
  handler: async (ctx, args) => {
    const messagesQuery = await ctx.runQuery(api.conversations.GetMessages, {
      user: args.user,
      conversation: args.conversation,
    });
    const shouldGenerateName = messagesQuery.length === 1;

    const messagesHistory: Array<
      | {
          role: "user";
          content:
            | string
            | Array<
                | { type: "text"; text: string }
                | { type: "image"; image: string }
              >;
        }
      | { role: "assistant"; content: string }
    > = [];

    let currentUserContent: Array<
      { type: "text"; text: string } | { type: "image"; image: string }
    > = [];

    for (const message of messagesQuery) {
      if (message.role === "user") {
        if (message.isImage) {
          const image = await ctx.storage.getUrl(
            message.content as Id<"_storage">,
          );
          if (image) {
            currentUserContent.push({ type: "image", image: image });
          }
        } else {
          if (message.content.trim()) {
            currentUserContent.push({ type: "text", text: message.content });
          }

          if (currentUserContent.length > 0) {
            messagesHistory.push({
              role: "user",
              content:
                currentUserContent.length === 1 &&
                currentUserContent[0].type === "text"
                  ? currentUserContent[0].text
                  : currentUserContent,
            });
            currentUserContent = [];
          }
        }
      } else if (message.role === "assistant") {
        messagesHistory.push({
          role: "assistant",
          content: message.content,
        });
      }
    }

    if (currentUserContent.length > 0) {
      messagesHistory.push({
        role: "user",
        content:
          currentUserContent.length === 1 &&
          currentUserContent[0].type === "text"
            ? currentUserContent[0].text
            : currentUserContent,
      });
    }

    if (!args.apiKey) {
      args.apiKey = process.env.OPENROUTER_API_KEY || "";
    }

    const openrouter = createOpenRouter({
      apiKey: args.apiKey,
    });

    let response;
    let tools;
    let image;
    let storageId: Id<"_storage"> | null = null;
    let messageId: Id<"messages"> | null = null;
    if (args.modelName === "gpt-image-1") {
      messageId = await ctx.runMutation(internal.generate.writeResponse, {
        user: args.user,
        content: "",
        reasoning: "",
        model: args.model,
        modelName: args.modelName,
        conversation: args.conversation,
        messageId: undefined,
        isName: false,
        status: {
          type: "pending",
          message: "Generating image...",
        },
        isImage: true,
      });
      image = await generateImage({
        model: openai.image("gpt-image-1"),
        prompt: args.content,
        n: 1,
        size: "1024x1024",
      });


      // Convert base64 to Uint8Array using Web APIs instead of Node.js Buffer
      const binaryString = atob(image.image.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "image/png" });
      storageId = await ctx.storage.store(blob);
      messageId = await ctx.runMutation(internal.generate.writeResponse, {
        user: args.user,
        content: storageId,
        reasoning: "",
        model: args.model,
        modelName: args.modelName,
        conversation: args.conversation,
        messageId: messageId as Id<"messages">,
        isName: false,
        status: {
          type: "pending",
          message: "Generating image...",
        },
        isImage: true,
      });
      return;

    }
    else {
      if (args.useMCP) {
      // Ensure MCP client is ready (non-blocking if already initialized)
      await initializeMCPClient();
      
      tools = Object.keys(globalTools).length > 0 ? globalTools : undefined;
      
      response = await streamText({
        model: openrouter.chat(args.modelName),
        messages: messagesHistory,
        tools: tools,
        maxSteps: 10,
        system: "Use GFM to format your responses. Do not mention GFM in your responses."
      });
    } else {
      response = await streamText({
        model: openrouter.chat(args.modelName),
        messages: messagesHistory,
        maxSteps: 10,
        system: "Use GFM to format your responses. Do not mention GFM in your responses."
      });
    }
    }
    if (!response) {
      return;
    }

    let namePromise: Promise<void> | undefined;
    if (shouldGenerateName) {
      namePromise = generateText({
        model: openrouter.chat("google/gemini-2.0-flash-001"),
        prompt: args.content,
        system:
          "You are a helpful assistant that generates a name for a conversation. The name should be a phrase that captures the essence of the conversation. The name should be no more than 5 words.",
      }).then(async (generateName) => {
        if (generateName.text) {
          await ctx.runMutation(internal.generate.writeResponse, {
            user: args.user,
            content: generateName.text.trim(),
            model: args.model,
            modelName: args.modelName,
            conversation: args.conversation,
            isName: true,
            status: {
              type: "pending",
              message: "Generating name...",
            },
            isImage: false,
          });
        }
      }).catch((error) => {
        console.error("Error generating conversation name:", error);
      });
    }

    let message = "";
    let reasoning = "";
    let status = {
      type: "pending",
      message: "Generating message...",
    };
    messageId = await ctx.runMutation(internal.generate.writeResponse, {
      user: args.user,
      content: message,
      model: args.model,
      modelName: args.modelName,
      conversation: args.conversation,
      messageId: undefined,
      isName: false,
      status: status,
      isImage: false,
    });

    console.log("Generating message with model: " + args.modelName);
    try {
      for await (const chunk of response.fullStream) {
        switch (chunk.type) {
          case "text-delta":
            message += chunk.textDelta;
            status = {
              type: "pending",
              message: `Generating...`,
            };
            break;
          case "reasoning":
            reasoning += chunk.textDelta;
            status = {
              type: "pending",
              message: `Reasoning...`,
            };
            break;
          case "tool-call":
            console.log("Tool call:", chunk.toolName, "with args:", JSON.stringify(chunk.args));
            status = {
              type: "pending",
              message: `Calling ${chunk.toolName}...`,
            };
            break;
          case "tool-result":
            console.log("Tool result for:", chunk.toolName, "result:", JSON.stringify(chunk.result).substring(0, 200) + "...");
            status = {
              type: "pending",
              message: `Processing ${chunk.toolName} response...`,
            };
            break;
          case "error":
            console.error("Stream error:", chunk.error);
            status = {
              type: "error",
              message: `Error: ${chunk.error}`,
            };
            break;
          default:
            console.log("Unknown chunk type:", chunk.type);
            break;
        }
        await ctx.runMutation(internal.generate.writeResponse, {
          user: args.user,
          content: message,
          reasoning: reasoning,
          model: args.model,
          modelName: args.modelName,
          conversation: args.conversation,
          messageId: messageId as Id<"messages">,
          isName: false,
          status: status,
          isImage: false,
        });
      }
    } catch (error) {
      console.error("Error in stream processing:", error);
      await ctx.runMutation(internal.generate.writeResponse, {
        user: args.user,
        content: message || "Error occurred during generation",
        reasoning: reasoning,
        model: args.model,
        modelName: args.modelName,
        conversation: args.conversation,
        messageId: messageId as Id<"messages">,
        isName: false,
        status: {
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
        isImage: false,
      });
      return message;
    }
  
    await ctx.runMutation(internal.generate.writeResponse, {
      user: args.user,
      content: message,
      reasoning: reasoning,
      model: args.model,
      modelName: args.modelName,
      conversation: args.conversation,
      messageId: messageId as Id<"messages">,
      isName: false,
      status: {
        type: "completed",
        message: "Message generated",
      },
      isImage: false,
    });


    if (namePromise) {
      await namePromise;
    }

    return message;
  },
});

export const generateMessage = mutation({
  args: {
    user: v.string(),
    content: v.string(),
    model: v.id("models"),
    conversation: v.id("conversations"),
    apiKey: v.string(),
    useMCP: v.boolean(),
  },
  handler: async (ctx, args) => {
    const model = await ctx.db
      .query("models")
      .filter((q) => q.eq(q.field("_id"), args.model))
      .first();

    if (!model) {
      throw new Error("Model not found");
    }

    await ctx.db.insert("messages", {
      user: args.user,
      content: args.content,
      model: model._id,
      conversation: args.conversation,
      role: "user",
      isImage: false,
      status: {
        type: "pending",
        message: "Generating message...",
      },
    });
    await ctx.scheduler.runAfter(0, internal.generate.generateMessageAction, {
      user: args.user,
      content: args.content,
      model: model._id,
      modelName: model.model,
      conversation: args.conversation,
      apiKey: args.apiKey,
      useMCP: args.useMCP,
    });
  },
});

export const GetModels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("models").collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveImage = mutation({
  args: {
    user: v.string(),
    conversation: v.id("conversations"),
    model: v.id("models"),
    storageId: v.id("_storage"),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) {
      throw new Error("Image not found");
    }

    return await ctx.db.insert("messages", {
      user: args.user,
      content: args.storageId, // Store the storage ID instead of base64
      model: args.model,
      conversation: args.conversation,
      role: "user",
      isImage: true,
    });
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
