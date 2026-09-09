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

## Quick start

Requirements:

- Node.js 18 or newer
- An Amazon Bedrock API key
- Access to `us.openai.gpt-5.6-luna` in `us-east-1`

Create the local environment file:

```bash
cp .env.example .env
```

Set your token in `.env`:

```env
AWS_BEARER_TOKEN_BEDROCK="your-bedrock-api-key"
```

Install, build, and start:

```bash
npm install
npm run build
npm start
```

Open `http://127.0.0.1:8080`.

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
