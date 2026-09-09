# Loan Risk AI Agent

A TypeScript and LangGraph proof of concept that uses Amazon Bedrock's OpenAI-compatible Responses API to answer loan-risk questions through a small set of tools.

The default application is a demo, not a production lending system. Customer records are synthetic and stored in code. No customer database is connected.

## What the application does

- Accepts a natural-language question from the browser or `POST /callagent`.
- Uses `us.openai.gpt-5.6-luna` on Amazon Bedrock to select and sequence tools.
- Retrieves a synthetic customer's credit score and account status.
- Calculates demo risk and interest-rate outcomes with deterministic local rules.
- Optionally replaces the local risk and rate tools with a legacy IBM-hosted RAG deployment.

## Important rule distinction

The repository contains two rule sets:

1. **Default local demo rules** in [`src/domain/loan-risk.ts`](src/domain/loan-risk.ts), which preserve the original application's behavior and are covered by automated tests.
2. **Reference policy PDFs** in [`artifacts/data`](artifacts/data), which are intended for the optional IBM RAG path and contain different thresholds and rates.

See [Domain and data](docs/domain-and-data.md) before interpreting application output.

## Setup

### Prerequisites

- Git
- Node.js 18 or newer, including npm
- An Amazon Bedrock API key
- Access to the default `us.openai.gpt-5.6-luna` model through the
  `us-east-1` Bedrock endpoint

The current application calls Amazon Bedrock directly. It does not require a
Python environment, LiteLLM proxy, database, or IBM Cloud service for the
default local demo.

### 1. Get the repository

```bash
git clone https://github.com/adb-patched/ai-agent-for-loan-risk.git
cd ai-agent-for-loan-risk
```

If you already have the repository, run the remaining commands from its root
directory, where `package.json` is located.

### 2. Install dependencies

Use the committed lockfile for a reproducible installation:

```bash
npm ci
```

### 3. Configure Bedrock access

Create a local environment file:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder token:

```env
AWS_BEARER_TOKEN_BEDROCK="your-bedrock-api-key"
```

The remaining values in `.env.example` already match the application defaults.
In particular, the server listens on `127.0.0.1:8080`. The application fails
at startup with a clear error if the Bedrock token is missing.

Do not commit `.env`; it is ignored by Git and should contain only local
credentials. See [Configuration](docs/configuration.md) for model, endpoint,
server, IBM RAG, and watsonx Assistant options.

### 4. Start the application

For a normal compiled run:

```bash
npm run build
npm start
```

For development with automatic TypeScript restarts:

```bash
npm run dev
```

Use one startup method at a time. When startup succeeds, the terminal prints
the application URL, selected Bedrock model, and IBM RAG status.

### 5. Use the demo

Open `http://127.0.0.1:8080` in a browser and try:

```text
What is the interest rate for Matt? Explain how it was determined.
```

The first question can take longer while the application waits for Bedrock.
You can also call the HTTP endpoint directly using the
[API example](#api-example) below.

### Setup troubleshooting

- `AWS_BEARER_TOKEN_BEDROCK is required`: add a non-empty token to the root
  `.env` file, or export it in the shell before starting.
- A Bedrock authentication or authorization error: confirm the token is valid
  and has access to the configured model and endpoint.
- Port `8080` is already in use: set another value such as
  `APPLICATION_PORT=8081` in `.env`, then open that port in the browser.
- The server must be reachable outside the local machine or from a container:
  set `APPLICATION_HOST=0.0.0.0` and apply appropriate network controls. The
  application has no built-in authentication.

## Common commands

```bash
npm run dev            # Start the TypeScript entrypoint in watch mode
npm run build          # Compile application source into build/
npm run typecheck      # Type-check application source
npm test               # Run deterministic tests; no Bedrock requests
npm run test:watch     # Re-run tests while files change
npm run check          # Type-check application source and run all tests
```

## Repository structure

```text
main.ts                         Application composition and server startup
src/
  agent/                        Prompts, tools, graph, and message normalization
  domain/                       Synthetic customers and demo decision rules
  http/                         Express application and API boundary
  integrations/                 Optional IBM RAG and watsonx Assistant adapters
tests/                          Deterministic unit and HTTP integration tests
public/                         Browser UI and static assets
artifacts/                      Original IBM diagrams, policies, and legacy guides
docs/                           Current technical documentation
```

## Documentation

- [Documentation index](docs/README.md)
- [Architecture and runtime flow](docs/architecture.md)
- [Configuration](docs/configuration.md)
- [HTTP API](docs/api.md)
- [Domain rules and data](docs/domain-and-data.md)
- [Testing strategy](docs/testing.md)
- [Dependency status](docs/dependencies.md)
- [Security and limitations](docs/security-and-limitations.md)
- [Legacy IBM integrations](docs/legacy-integrations.md)
- [Evaluation guide](docs/evaluation-guide.md)

## API example

```bash
curl http://127.0.0.1:8080/callagent \
  -H "Content-Type: application/json" \
  -d '{"query":"What is Matt'\''s credit score?"}'
```

The response is an ordered list of human, AI, and tool messages. Text returned by the Bedrock Responses API is normalized to a string before it crosses the HTTP boundary.

## Test scope

The test suite covers:

- Configuration defaults and required credentials
- Synthetic customer aliases and fallback behavior
- Risk and interest-rate rules, including boundaries
- LangChain tool names and RAG-mode selection
- Repeated tool-call detection
- Responses API content normalization
- Express input validation and error redaction
- IBM RAG authentication and token reuse with mocked HTTP

Tests deliberately do not call Amazon Bedrock or IBM services.

The current dependency line has residual advisories that require major LangChain and Express upgrades. See [Dependency status](docs/dependencies.md).

## Production warning

This application has no user authentication, authorization, rate limiting, persistent audit log, or real customer data source. Unknown customers receive randomized demo values. Review [Security and limitations](docs/security-and-limitations.md) before exposing it beyond a local demonstration environment.
