export interface AppConfig {
  application: {
    name: string;
    host: string;
    port: number;
  };
  bedrock: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };
  rag: {
    enabled: boolean;
    apiKey?: string;
    endpoint?: string;
    iamTokenEndpoint: string;
  };
  watsonxAssistant: {
    enabled: boolean;
    integrationId?: string;
    region?: string;
    serviceInstanceId?: string;
  };
}

const isEnabled = (value: string | undefined): boolean =>
  value?.toLowerCase() === "true";

const required = (
  env: NodeJS.ProcessEnv,
  name: string,
  message = `${name} is required.`,
): string => {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(message);
  }
  return value;
};

const applicationPort = (value: string | undefined): number => {
  const port = Number(value ?? "8080");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("APPLICATION_PORT must be an integer between 1 and 65535.");
  }
  return port;
};

export const loadConfig = (
  env: NodeJS.ProcessEnv = process.env,
): AppConfig => {
  const ragEnabled = isEnabled(env.ENABLE_RAG_LLM);
  const assistantEnabled = isEnabled(env.ENABLE_WXASST);

  const config: AppConfig = {
    application: {
      name: env.APPLICATION_NAME?.trim() || "LoanRisk-AIAgent",
      host: env.APPLICATION_HOST?.trim() || "127.0.0.1",
      port: applicationPort(env.APPLICATION_PORT),
    },
    bedrock: {
      apiKey: required(
        env,
        "AWS_BEARER_TOKEN_BEDROCK",
        "AWS_BEARER_TOKEN_BEDROCK is required. Add it to .env or export it before starting the application.",
      ),
      baseUrl:
        env.BEDROCK_OPENAI_BASE_URL?.trim() ||
        "https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1",
      model: env.BEDROCK_MODEL?.trim() || "us.openai.gpt-5.6-luna",
    },
    rag: {
      enabled: ragEnabled,
      iamTokenEndpoint:
        env.IBM_IAM_TOKEN_ENDPOINT?.trim() ||
        "https://iam.cloud.ibm.com/identity/token",
    },
    watsonxAssistant: {
      enabled: assistantEnabled,
    },
  };

  if (ragEnabled) {
    config.rag.apiKey = required(env, "WATSONX_AI_APIKEY");
    config.rag.endpoint = required(env, "WATSONX_RISK_RAG_LLM_ENDPOINT");
  }

  if (assistantEnabled) {
    config.watsonxAssistant.integrationId = required(
      env,
      "WXASST_INTEGRATION_ID",
    );
    config.watsonxAssistant.region = required(env, "WXASST_REGION");
    config.watsonxAssistant.serviceInstanceId = required(
      env,
      "WXASST_SERVICE_INSTANCE_ID",
    );
  }

  return config;
};
