# Evaluation guide

This guide identifies the relevant code and trust boundaries for static analysis, repository review, or XRAE evaluation.

## Primary source

Inspect:

- `main.ts`
- `src/**/*.ts`
- `public/index-single-agent.html`
- `package.json`
- `tsconfig.json`
- `tests/**/*.test.js`
- `.github/workflows/ci.yml`
- `docs/**/*.md`
- `docs/dependencies.md`

## Generated or external material

Treat these separately:

- `build/`: generated TypeScript output; ignored by Git
- `node_modules/`: third-party dependencies; ignored by Git
- `.env`: local secret material; ignored by Git
- `.venv/`: obsolete local environment from earlier experiments; ignored by Git
- `artifacts/`: original diagrams, binary documents, screenshots, and historical deployment material
- `public/*.pdf`: copies of reference policies served by the browser

## Entry points

- Process entrypoint: `main.ts`
- HTTP application factory: `src/http/app.ts`
- Domain decisions: `src/domain/loan-risk.ts`
- Tool registry: `src/agent/tools.ts`
- Graph construction: `src/agent/graph.ts`
- Bedrock client configuration: `src/agent/graph.ts`
- IBM RAG adapter: `src/integrations/ibm-rag-client.ts`

## External calls

The default runtime makes one type of external request:

- Amazon Bedrock OpenAI-compatible Responses API

Optional runtime calls:

- IBM IAM token endpoint
- Configured IBM RAG inference endpoint
- Browser CDN request for jQuery

## Trust boundaries

1. Unauthenticated browser input enters `POST /callagent`.
2. User text is sent to the model.
3. The model selects from fixed tool schemas.
4. Tool results return to the model.
5. Model text and tool trace return to the unauthenticated caller.

## Deterministic verification

Run:

```bash
npm run check
npm run build
```

These commands do not require a Bedrock token and do not make model calls.

Live application startup requires `AWS_BEARER_TOKEN_BEDROCK`. Live semantic evaluation should be treated separately because it incurs provider usage and produces nondeterministic prose.

## High-value review areas

- Unauthenticated model-spend exposure
- Random fallback data for unknown customers
- Difference between local demo rules and policy PDFs
- Prompt-injection and model/tool sequencing behavior
- Optional RAG response trust and error handling
- CDN dependency and missing browser security headers
- Lack of structured audit logging and rate limits
- Residual dependency advisories requiring major-version migrations
