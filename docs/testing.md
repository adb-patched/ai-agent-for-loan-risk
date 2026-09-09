# Testing strategy

The test suite is intentionally deterministic and does not call paid or external AI services.

## Commands

```bash
npm test
npm run test:watch
npm run typecheck
npm run check
```

`npm run check` is the recommended local and CI verification command.

The GitHub Actions workflow at `.github/workflows/ci.yml` runs `npm ci`, `npm run check`, and `npm run build` on pushes and pull requests using Node.js 18.

## Test layers

### Configuration tests

`tests/config.test.js` verifies:

- Bedrock credential requirements
- Default endpoint, model, host, and port
- Port validation
- Conditional IBM RAG requirements
- Conditional watsonx Assistant requirements

### Domain tests

`tests/domain.test.js` verifies:

- All customer alias forms
- Deterministic unknown-customer fallback injection
- The full local risk matrix
- Boundary values at 550, 749, and 750
- Interest-rate mappings and conservative fallback

### Tool contract tests

`tests/tools.test.js` verifies:

- Stable LangChain tool names
- Tool invocation against domain logic
- The exact tool set used in local and RAG modes
- Clear failure when RAG mode lacks a client

### Graph safety tests

`tests/graph.test.js` verifies repeated tool-call detection. These tests protect the guard that prevents a model from repeatedly requesting the same tool with identical arguments.

### Message-format tests

`tests/message-content.test.js` verifies normalization of both plain chat content and Responses API text blocks. This protects the browser from displaying “no final answer” when the provider returns block-based content.

### HTTP integration tests

`tests/http.test.js` starts the Express application on an ephemeral local port and verifies:

- Static page serving
- Input validation
- Successful message responses
- Internal error redaction

The agent runner is injected, so no Bedrock request occurs.

### IBM RAG adapter tests

`tests/ibm-rag-client.test.js` uses a mocked fetch function to verify:

- IAM authentication
- Bearer-token attachment
- Token reuse
- Prompt construction
- Malformed response handling

## What is not tested

- Live Amazon Bedrock model availability or billing
- Live IBM IAM/RAG services
- Browser layout across devices
- watsonx Assistant network behavior
- The semantic quality of generated natural-language answers

Those require explicit integration or evaluation runs and credentials. They should remain separate from deterministic repository tests.

## Adding tests

Prefer tests that cover stable contracts:

- Domain inputs and outputs
- Tool names and schemas
- API status codes and response shape
- Configuration failure modes
- Provider message normalization

Avoid tests that assert exact LLM prose or require live provider calls.
