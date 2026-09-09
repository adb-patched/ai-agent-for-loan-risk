import type { AppConfig } from "../config.js";
import type { RagDecisionClient } from "../agent/tools.js";

type FetchFunction = typeof globalThis.fetch;

const responseText = (payload: any): string => {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) {
    return content;
  }
  if (Array.isArray(content)) {
    const text = content
      .filter((block) => block?.type === "text" && typeof block.text === "string")
      .map((block) => block.text)
      .join("\n");
    if (text) {
      return text;
    }
  }
  throw new Error("IBM RAG response did not contain message text.");
};

export class IbmRagClient implements RagDecisionClient {
  private accessToken?: string;
  private accessTokenExpiration = 0;

  constructor(
    private readonly config: Required<
      Pick<AppConfig["rag"], "apiKey" | "endpoint" | "iamTokenEndpoint">
    >,
    private readonly fetchFunction: FetchFunction = globalThis.fetch,
  ) {}

  private async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.accessToken && this.accessTokenExpiration > now + 300) {
      return this.accessToken;
    }

    const body = new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: this.config.apiKey,
    });
    const response = await this.fetchFunction(this.config.iamTokenEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!response.ok) {
      throw new Error(`IBM IAM token request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as any;
    if (!payload.access_token) {
      throw new Error("IBM IAM token response did not contain an access token.");
    }

    this.accessToken = payload.access_token;
    this.accessTokenExpiration = Number(payload.expiration ?? now + 3600);
    return this.accessToken;
  }

  private async requestDecision(query: string): Promise<string> {
    const accessToken = await this.getAccessToken();
    const response = await this.fetchFunction(this.config.endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: query }],
      }),
    });
    if (!response.ok) {
      throw new Error(`IBM RAG request failed with status ${response.status}.`);
    }
    return responseText(await response.json());
  }

  getOverallRisk(creditScore: number, accountStatus: string): Promise<string> {
    return this.requestDecision(
      `What is the risk for credit score ${creditScore} and account status ${accountStatus}, and how is it determined?`,
    );
  }

  getInterestRate(overallRisk: string): Promise<string> {
    return this.requestDecision(
      `What is the interest rate for overall risk ${overallRisk}, and how was it determined?`,
    );
  }
}
