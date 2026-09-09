# Security and limitations

## Intended use

This repository is a demonstration and evaluation target. It is not a production loan-origination, underwriting, or customer-data system.

## Current safeguards

- Secrets are loaded from `.env`, which is ignored by Git.
- `.env.example` contains placeholders only.
- The Bedrock token is not logged.
- Invalid requests are rejected before invoking the model.
- JSON request bodies are limited to 16 KB.
- Internal exceptions are logged server-side but returned to clients as a generic error.
- Agent recursion is limited.
- Repeated identical tool calls are finalized instead of executed indefinitely.
- Automated tests do not use real provider credentials.

## Known limitations

### No access control

The HTTP server has no authentication or authorization. Anyone who can reach it can invoke the model and consume Bedrock quota.

### No rate limiting or quotas

The application does not throttle callers, limit per-user usage, or enforce a spending budget.

### Synthetic and randomized data

Customer records are hard-coded. Unknown identifiers receive randomized values, which can create inconsistent answers between requests.

### Business-rule divergence

Default local rules differ from the bundled policy PDFs. See [Domain rules and data](domain-and-data.md).

### Prompt and tool trust

User text is passed to the model. Tools are limited to fixed schemas and do not execute arbitrary commands, but the application has no dedicated prompt-injection detection or policy layer.

### No persistent audit trail

Requests, tool decisions, model identifiers, and outcomes are printed to process logs only. There is no structured or tamper-resistant audit record.

### No conversation isolation

The app is stateless between HTTP calls. This avoids cross-user memory leakage but also means there is no authenticated conversation context.

### Legacy integration risk

The optional IBM RAG path sends decision queries to an external deployment and relies on its returned text. Its security, retrieval quality, and policy correctness are outside this repository.

### Frontend dependencies

The browser page loads jQuery from a public CDN and has no Content Security Policy. Production deployment should vendor or integrity-pin dependencies and add security headers.

### Dependency advisories

Safe non-breaking audit fixes have been applied, but the current legacy LangChain and Express major-version lines retain known advisories. See [Dependency status](dependencies.md) for the dated audit snapshot and upgrade boundary.

## Production hardening checklist

Before any non-demo deployment:

1. Replace synthetic/random customer data with an authenticated data service.
2. Select and approve one authoritative risk/rate policy.
3. Add authentication, authorization, rate limiting, quotas, and monitoring.
4. Add structured audit logging with appropriate redaction.
5. Add provider timeouts, retry policy, and circuit breaking.
6. Add security headers and a Content Security Policy.
7. Perform prompt-injection, abuse, privacy, and cost testing.
8. Add live integration tests in a controlled non-production account.
9. Review all historical IBM deployment artifacts for current applicability.
