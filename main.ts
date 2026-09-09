/*
 Copyright 2025 IBM Corp.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

import "dotenv/config";
import path from "node:path";

import { createAgentGraph, createBedrockModel, runAgentQuery } from "./src/agent/graph.js";
import { createLoanRiskTools } from "./src/agent/tools.js";
import { loadConfig } from "./src/config.js";
import { createWebApp } from "./src/http/app.js";
import { IbmRagClient } from "./src/integrations/ibm-rag-client.js";
import { prepareWatsonxAssistantPages } from "./src/integrations/watsonx-assistant.js";

const config = loadConfig();
const publicDirectory = path.resolve("public");

await prepareWatsonxAssistantPages(
  config.watsonxAssistant,
  publicDirectory,
);

const ragClient = config.rag.enabled
  ? new IbmRagClient({
      apiKey: config.rag.apiKey!,
      endpoint: config.rag.endpoint!,
      iamTokenEndpoint: config.rag.iamTokenEndpoint,
    })
  : undefined;

const tools = createLoanRiskTools({
  enableRag: config.rag.enabled,
  ragClient,
});
const model = createBedrockModel(config.bedrock);
const graph = createAgentGraph(tools, model);

const webapp = createWebApp({
  publicDirectory,
  runAgent: (query) => runAgentQuery(graph, query),
});

webapp.listen(config.application.port, config.application.host, () => {
  console.log(
    `Agentic AI application ${config.application.name} is running at http://${config.application.host}:${config.application.port}`,
  );
  console.log(
    `Using Amazon Bedrock model ${config.bedrock.model} via ${config.bedrock.baseUrl}`,
  );
  console.log(
    `IBM RAG mode is ${config.rag.enabled ? "enabled" : "disabled"}.`,
  );
});
