import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

import type { AppConfig } from "../config.js";
import { agentSystemPrompt } from "./instructions.js";
import { messageContentToText } from "./message-content.js";

export interface ToolCallLike {
  name: string;
  args: unknown;
}

export const toolCallSignature = (toolCall: ToolCallLike): string =>
  `${toolCall.name}:${JSON.stringify(toolCall.args)}`;

export const hasRepeatedToolCalls = (
  messages: Array<{ tool_calls?: ToolCallLike[] }>,
): boolean => {
  const currentCalls = messages.at(-1)?.tool_calls;
  if (!currentCalls?.length) {
    return false;
  }

  const previousCalls = new Set(
    messages
      .slice(0, -1)
      .flatMap((message) => message.tool_calls ?? [])
      .map(toolCallSignature),
  );

  return currentCalls.every((toolCall) =>
    previousCalls.has(toolCallSignature(toolCall)),
  );
};

export const createBedrockModel = (config: AppConfig["bedrock"]): ChatOpenAI =>
  new ChatOpenAI({
    model: config.model,
    apiKey: config.apiKey,
    useResponsesApi: true,
    maxRetries: 2,
    configuration: {
      baseURL: config.baseUrl,
    },
  });

export const createAgentGraph = (tools: Array<any>, model: any): any => {
  const modelWithTools = model.bindTools(tools);
  const toolNode = new ToolNode(tools);

  const callModel = async (state: any) => ({
    messages: await modelWithTools.invoke(state.messages),
  });

  const finalizeRepeatedToolCall = async (state: any) => ({
    messages: await model.invoke([
      new SystemMessage(
        "Answer the user's question using the completed tool results in this conversation. Do not request or describe another tool call.",
      ),
      ...state.messages.slice(0, -1),
    ]),
  });

  const shouldContinue = (state: any) => {
    const lastMessage = state.messages.at(-1);
    if (!lastMessage?.tool_calls?.length) {
      return END;
    }
    return hasRepeatedToolCalls(state.messages) ? "finalize" : "tools";
  };

  return new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addNode("finalize", finalizeRepeatedToolCall)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue, ["tools", "finalize", END])
    .addEdge("tools", "agent")
    .addEdge("finalize", END)
    .compile();
};

export const runAgentQuery = async (
  graph: any,
  query: string,
): Promise<Array<Record<string, unknown>>> => {
  const stream = await graph.stream(
    {
      messages: [
        new SystemMessage(agentSystemPrompt),
        new HumanMessage({ content: query }),
      ],
    },
    {
      streamMode: "values",
      recursionLimit: 12,
    },
  );

  const messages: Array<Record<string, unknown>> = [];
  for await (const chunk of stream) {
    const lastMessage = chunk.messages.at(-1);
    const message = {
      type: lastMessage._getType(),
      content: messageContentToText(lastMessage.content),
      toolCalls: lastMessage.tool_calls,
    };
    console.dir(message, { depth: null });
    messages.push(message);
  }
  return messages;
};
