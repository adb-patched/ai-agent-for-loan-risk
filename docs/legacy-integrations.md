# Legacy IBM integrations

The current primary model path is Amazon Bedrock. Two IBM integrations remain for compatibility with the original repository.

## IBM-hosted RAG

Enable with:

```env
ENABLE_RAG_LLM="true"
WATSONX_AI_APIKEY="replace-me"
WATSONX_RISK_RAG_LLM_ENDPOINT="https://example/ai_service?version=..."
```

When enabled:

- Customer credit-score and account-status tools remain local.
- Risk and interest-rate tools call the configured IBM deployment.
- IBM IAM tokens are acquired on demand and cached in memory.
- The deployment response must expose text at `choices[0].message.content`.

The reference policy PDFs under `artifacts/data/` were originally intended as this deployment's retrieval source.

## watsonx Assistant

Enable with:

```env
ENABLE_WXASST="true"
WXASST_INTEGRATION_ID="replace-me"
WXASST_REGION="replace-me"
WXASST_SERVICE_INSTANCE_ID="replace-me"
```

At startup, the application renders:

- `public/wx.html`
- `public/wx-detailed.html`

from the checked-in templates.

## Historical deployment material

`artifacts/deployment/` describes the former IBM Cloud Code Engine and watsonx.ai primary-model architecture. It is retained for historical reference and optional-integration context, not as the current quick-start guide.

The current source and configuration documentation take precedence.
