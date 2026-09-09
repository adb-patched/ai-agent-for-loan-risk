# Configuration

Configuration is loaded from process environment variables by [`src/config.ts`](../src/config.ts). The application automatically loads a root `.env` file through `dotenv`.

Copy `.env.example` to `.env` for local development. `.env` is ignored by Git.

## Core settings

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `AWS_BEARER_TOKEN_BEDROCK` | Yes | None | Amazon Bedrock API key. Treat as a secret. |
| `BEDROCK_OPENAI_BASE_URL` | No | `https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1` | OpenAI-compatible Bedrock endpoint. |
| `BEDROCK_MODEL` | No | `us.openai.gpt-5.6-luna` | Bedrock model identifier. |
| `APPLICATION_HOST` | No | `127.0.0.1` | Address used by the Express server. |
| `APPLICATION_PORT` | No | `8080` | TCP port, validated as an integer from 1 to 65535. |
| `APPLICATION_NAME` | No | `LoanRisk-AIAgent` | Name shown in startup logs. |

## Optional IBM RAG settings

These variables are read only when `ENABLE_RAG_LLM=true`.

| Variable | Required in RAG mode | Default | Purpose |
| --- | --- | --- | --- |
| `ENABLE_RAG_LLM` | No | `false` | Replaces local risk/rate tools with IBM RAG tools. |
| `WATSONX_AI_APIKEY` | Yes | None | IBM IAM API key. |
| `WATSONX_RISK_RAG_LLM_ENDPOINT` | Yes | None | Deployed IBM RAG inference endpoint. |
| `IBM_IAM_TOKEN_ENDPOINT` | No | `https://iam.cloud.ibm.com/identity/token` | IBM IAM token endpoint. |

The IBM access token is held in memory and refreshed when it is within five minutes of expiration.

## Optional watsonx Assistant settings

These variables are read only when `ENABLE_WXASST=true`.

| Variable | Required in Assistant mode | Purpose |
| --- | --- | --- |
| `ENABLE_WXASST` | No | Generates watsonx Assistant HTML pages at startup. |
| `WXASST_INTEGRATION_ID` | Yes | Assistant web-chat integration identifier. |
| `WXASST_REGION` | Yes | Assistant region. |
| `WXASST_SERVICE_INSTANCE_ID` | Yes | Assistant service instance. |

Missing values fail startup rather than generating partially configured pages.

## Example

```env
AWS_BEARER_TOKEN_BEDROCK="replace-me"
BEDROCK_OPENAI_BASE_URL="https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1"
BEDROCK_MODEL="us.openai.gpt-5.6-luna"
APPLICATION_HOST="127.0.0.1"
APPLICATION_PORT="8080"
```

Do not commit `.env` or place real credentials in `.env.example`.
