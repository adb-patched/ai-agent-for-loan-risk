# Contributing

## Development setup

```bash
cp .env.example .env
npm install
npm run check
```

A Bedrock token is needed only to start the live application, not to build or test.

## Change guidelines

- Keep domain rules in `src/domain/`.
- Keep provider and external-service code in `src/integrations/`.
- Keep HTTP handlers independent from model construction.
- Preserve stable tool names unless the API contract is intentionally changing.
- Add or update tests for behavior changes.
- Update the relevant document under `docs/`.
- Do not commit `.env`, credentials, generated `build/`, or dependency directories.

## Before committing

```bash
npm run check
npm run build
git diff --check
```

Live provider testing is optional and should be explicitly documented when performed.
