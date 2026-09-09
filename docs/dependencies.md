# Dependency status

## Current audit snapshot

As of September 9, 2026, a normal non-force `npm audit fix` has been applied.

It removed the previously reported critical `form-data` issue and updated compatible transitive versions including `ws`, `path-to-regexp`, and `@langchain/langgraph-sdk`.

The remaining production audit reports:

- 0 critical
- 1 high
- 8 moderate

The remaining advisories are rooted in the current major-version lines for:

- `@langchain/core`
- `@langchain/langgraph`
- `@langchain/openai`
- `express`

The high advisory is inherited through the legacy LangChain dependency on `langsmith`. The remaining automatic remediations require major upgrades to LangChain 1.x and Express 5.

## Why major upgrades are not included

This pass focuses on documentation, deterministic tests, and maintainable boundaries. Forcing major dependency upgrades would combine API migration with repository restructuring and make behavioral regressions harder to isolate.

Do not use:

```bash
npm audit fix --force
```

without reviewing and testing the resulting LangChain, LangGraph, OpenAI integration, and Express API changes.

## Recommended upgrade workflow

1. Create a dedicated dependency-upgrade branch.
2. Record the current `npm run check` and live Bedrock behavior.
3. Upgrade Express separately from LangChain.
4. Migrate LangChain core, OpenAI, and LangGraph as one compatible set.
5. Verify Responses API tool calling and repeated-tool finalization.
6. Run `npm run check`, `npm run build`, and a controlled live Bedrock request.
7. Re-run `npm audit --omit=dev`.

The current deterministic suite is intended to provide the behavioral baseline for that migration.
