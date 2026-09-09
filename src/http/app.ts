import express, { type Application } from "express";
import path from "node:path";

export type AgentRunner = (
  query: string,
) => Promise<Array<Record<string, unknown>>>;

export interface AppLogger {
  error(message: string, error?: unknown): void;
  info(message: string, details?: unknown): void;
}

export interface WebAppOptions {
  publicDirectory: string;
  runAgent: AgentRunner;
  logger?: AppLogger;
}

export const createWebApp = ({
  publicDirectory,
  runAgent,
  logger = {
    error: (message, error) => console.error(message, error),
    info: (message, details) => console.log(message, details ?? ""),
  },
}: WebAppOptions): Application => {
  const app = express();

  app.use(express.static(publicDirectory));
  app.use(express.json({ limit: "16kb" }));

  app.get("/", (_request, response) => {
    response.sendFile(path.join(publicDirectory, "index-single-agent.html"));
  });

  app.post("/callagent", async (request, response) => {
    const query = request.body?.query;
    if (typeof query !== "string" || !query.trim()) {
      response.status(400).json({ error: "A non-empty query is required." });
      return;
    }

    try {
      logger.info("Received agent request.");
      response.json(await runAgent(query.trim()));
    } catch (error) {
      logger.error("Unable to complete agent request.", error);
      response.status(500).json({
        error: "Unable to complete agent request.",
      });
    }
  });

  return app;
};
