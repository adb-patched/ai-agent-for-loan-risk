# Architecture artifacts

This directory contains the original conceptual and deployment diagrams.

- `LoanRisk-Single-AI-Agent-Conceptual.png` illustrates the original single-agent and tool concept.
- `LoanRisk-Single-AI-Agent-Deployment.png` illustrates the historical IBM Cloud deployment.

The conceptual agent/tool relationship remains relevant. The deployment diagram does not represent the current default runtime, which calls Amazon Bedrock directly from the TypeScript application.

See [`docs/architecture.md`](../../docs/architecture.md) for the current architecture and request lifecycle.
