# Documentation

This directory documents the current TypeScript application. Files under `artifacts/` are retained from the original IBM project and may describe older deployment paths.

## Guides

- [Architecture and runtime flow](architecture.md)
- [Configuration](configuration.md)
- [HTTP API](api.md)
- [Domain rules and data](domain-and-data.md)
- [Testing strategy](testing.md)
- [Dependency status](dependencies.md)
- [Security and limitations](security-and-limitations.md)
- [Legacy IBM integrations](legacy-integrations.md)
- [Evaluation guide](evaluation-guide.md)

## Source-of-truth order

When documentation differs, use this order:

1. Current source under `main.ts` and `src/`
2. Automated tests under `tests/`
3. Current documentation under `docs/` and the root `README.md`
4. Historical material under `artifacts/`

The reference policy PDFs remain authoritative only for the optional policy/RAG interpretation described in [Domain rules and data](domain-and-data.md). They do not describe the current local demo calculations.
