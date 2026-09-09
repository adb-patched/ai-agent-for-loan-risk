# Loan Risk - AI Agent

This checkout calls Amazon Bedrock's OpenAI-compatible Responses API directly from the TypeScript application. Bedrock authentication uses `AWS_BEARER_TOKEN_BEDROCK`.

This repository provides an AI agent application for demonstration and proof-of-concept(PoC) to showcase agentic AI adoption in industry/enterprise workflows and use cases.

With a focus on the financial industry, it uses a bank loan processing workflow as an example that leverages agentic AI. It demonstrates one of the main values of using agentic AI - _relying on LLMs to reason about what to do and take actions_, instead of relying on traditional approach of rules and conditions. 

The application runs as a local Node.js web server and uses LangChain's `ChatOpenAI` client against Amazon Bedrock. The original optional IBM-hosted RAG and watsonx Assistant integrations remain available but are disabled by default.

To learn more about the key features and architectural concepts of agentic AI and about using this Loan Risk AI Agent, you can: 

- Read the article [Agentic AI in enterprise workflow automation](https://developer.ibm.com/articles/agentic-ai-workflow-automation/).
- Watch the 5-minute demo video [Agentic AI on IBM Cloud - Demo](https://mediacenter.ibm.com/media/Agentic+AI+on+IBM+Cloud+-+Demo+Video/1_kn6kvqmz).

For questions or feedback contact Anuj Jain (jainanuj@us.ibm.com).

## Use Case
+ AI agent to support bank loan risk evaluation workflow.
+ AI agent determines overall risk and interest rate for a bank loan using LLMs and relevant tools.

Similar use cases can be found in insurance, healthcare and other industry/enterprise workflows.


## Architecture
+ Architecture: Single AI Agent with Tools (using LangGraph, TypeScript/NodeJS)
+ LLM: OpenAI GPT-5.6 Luna through Amazon Bedrock's OpenAI-compatible endpoint
+ Tools: API/functions (for credit score, account status, risk evaluation criteria, interest rate determination)

#### Conceptual Architecture
![Conceptual architecture](artifacts/architecture/LoanRisk-Single-AI-Agent-Conceptual.png)

#### High-level Deployment Architecture
![High-level deployment architecture](artifacts/architecture/LoanRisk-Single-AI-Agent-Deployment.png)


## Deployment
### Prerequisites

- Node.js 18 or newer
- An Amazon Bedrock API key
- Access to `us.openai.gpt-5.6-luna` in Amazon Bedrock `us-east-1`

### Local setup

Create `.env` from the provided example and add your Bedrock API key:

```bash
cp .env.example .env
```

Install and start the Node.js application:

```bash
npm install
npm run build
npm start
```

Then open `http://127.0.0.1:8080`.

The application loads `.env` automatically. No LiteLLM proxy, Python environment, or separate process is required.

### Application configuration

- `AWS_BEARER_TOKEN_BEDROCK`: required Bedrock API key
- `BEDROCK_OPENAI_BASE_URL`: defaults to `https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1`
- `BEDROCK_MODEL`: defaults to `us.openai.gpt-5.6-luna`
- `APPLICATION_HOST`: defaults to `127.0.0.1`
- `APPLICATION_PORT`: defaults to `8080`

The original IBM Cloud deployment guide remains under [artifacts/deployment](artifacts/deployment/deployment-README.md). Enabling `ENABLE_RAG_LLM=true` still requires the IBM-hosted RAG endpoint and IBM credentials described there.


## Usage
For usage and additional examples refer [here.](artifacts/usage-examples/usage-examples-README.md)

![Example usage screenshot](artifacts/usage-examples/UsageExample2.png)

  
