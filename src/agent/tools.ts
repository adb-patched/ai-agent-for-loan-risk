import { tool } from "@langchain/core/tools";
import { z } from "zod";

import {
  determineInterestRate,
  determineOverallRisk,
  getAccountStatus,
  getCreditScore,
  type RandomInteger,
} from "../domain/loan-risk.js";
import { agentInstructions } from "./instructions.js";

export interface RagDecisionClient {
  getOverallRisk(creditScore: number, accountStatus: string): Promise<string>;
  getInterestRate(overallRisk: string): Promise<string>;
}

export interface ToolOptions {
  enableRag?: boolean;
  ragClient?: RagDecisionClient;
  randomInteger?: RandomInteger;
}

export const createLoanRiskTools = ({
  enableRag = false,
  ragClient,
  randomInteger,
}: ToolOptions = {}): Array<any> => {
  const creditScoreTool = tool(
    ({ customer_id }) => getCreditScore(customer_id, randomInteger),
    {
      name: "get_credit_score",
      description: agentInstructions.creditScore,
      schema: z.object({
        customer_id: z.string().min(1).describe("Customer id, name, or email"),
      }),
    },
  );

  const accountStatusTool = tool(
    ({ customer_id }) => getAccountStatus(customer_id, randomInteger),
    {
      name: "get_account_status",
      description: agentInstructions.accountStatus,
      schema: z.object({
        customer_id: z.string().min(1).describe("Customer id, name, or email"),
      }),
    },
  );

  const overallRiskTool = tool(
    ({ credit_score, account_status }) =>
      determineOverallRisk(credit_score, account_status),
    {
      name: "get_overall_risk",
      description: agentInstructions.overallRisk,
      schema: z.object({
        credit_score: z.number().describe("Credit score"),
        account_status: z.string().describe("Account status"),
      }),
    },
  );

  const interestRateTool = tool(
    ({ overall_risk }) => determineInterestRate(overall_risk),
    {
      name: "get_interest_rate",
      description: agentInstructions.interestRate,
      schema: z.object({
        overall_risk: z.string().describe("Overall risk"),
      }),
    },
  );

  if (!enableRag) {
    return [
      creditScoreTool,
      accountStatusTool,
      overallRiskTool,
      interestRateTool,
    ];
  }

  if (!ragClient) {
    throw new Error("A RAG decision client is required when RAG is enabled.");
  }

  const ragOverallRiskTool = tool(
    ({ credit_score, account_status }) =>
      ragClient.getOverallRisk(credit_score, account_status),
    {
      name: "get_overall_risk_from_rag_llm",
      description: agentInstructions.overallRisk,
      schema: z.object({
        credit_score: z.number().describe("Credit score"),
        account_status: z.string().describe("Account status"),
      }),
    },
  );

  const ragInterestRateTool = tool(
    ({ overall_risk }) => ragClient.getInterestRate(overall_risk),
    {
      name: "get_interest_rate_from_rag_llm",
      description: agentInstructions.interestRate,
      schema: z.object({
        overall_risk: z.string().describe("Overall risk"),
      }),
    },
  );

  return [
    creditScoreTool,
    accountStatusTool,
    ragOverallRiskTool,
    ragInterestRateTool,
  ];
};
