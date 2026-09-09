import fs from "node:fs/promises";
import path from "node:path";

import type { AppConfig } from "../config.js";

const renderTemplate = (
  template: string,
  config: Required<
    Omit<AppConfig["watsonxAssistant"], "enabled">
  >,
): string =>
  template
    .replace("[[[WXASST_INTEGRATION_ID]]]", config.integrationId)
    .replace("[[[WXASST_REGION]]]", config.region)
    .replace("[[[WXASST_SERVICE_INSTANCE_ID]]]", config.serviceInstanceId);

export const prepareWatsonxAssistantPages = async (
  config: AppConfig["watsonxAssistant"],
  publicDirectory: string,
): Promise<void> => {
  if (!config.enabled) {
    return;
  }

  const values = config as Required<Omit<typeof config, "enabled">>;
  const pages = [
    ["wx-template.html", "wx.html"],
    ["wx-template2.html", "wx-detailed.html"],
  ] as const;

  await Promise.all(
    pages.map(async ([templateName, outputName]) => {
      const template = await fs.readFile(
        path.join(publicDirectory, templateName),
        "utf8",
      );
      await fs.writeFile(
        path.join(publicDirectory, outputName),
        renderTemplate(template, values),
        "utf8",
      );
    }),
  );
};
