# HTTP API

## `GET /`

Returns the static browser application from `public/index-single-agent.html`.

## `POST /callagent`

Runs one independent agent request. The endpoint does not maintain conversation state between calls.

### Request

```json
{
  "query": "What is Matt's credit score?"
}
```

The browser also sends a `type` field, but the server ignores it.

### Successful response

Status: `200 OK`

```json
[
  {
    "type": "human",
    "content": "What is Matt's credit score?"
  },
  {
    "type": "ai",
    "content": "",
    "toolCalls": [
      {
        "name": "get_credit_score",
        "args": {
          "customer_id": "Matt"
        },
        "type": "tool_call",
        "id": "provider-generated-id"
      }
    ]
  },
  {
    "type": "tool",
    "content": "685"
  },
  {
    "type": "ai",
    "content": "Matt's credit score is 685.",
    "toolCalls": []
  }
]
```

### Message fields

| Field | Type | Description |
| --- | --- | --- |
| `type` | string | LangChain message type such as `human`, `ai`, or `tool`. |
| `content` | string | Normalized text. Responses API text blocks are joined with newlines. |
| `toolCalls` | array or undefined | Tool requests emitted by an AI message. |

### Validation error

Status: `400 Bad Request`

```json
{
  "error": "A non-empty query is required."
}
```

### Internal error

Status: `500 Internal Server Error`

```json
{
  "error": "Unable to complete agent request."
}
```

Provider details, stack traces, and credentials are not returned to the client.

## Operational characteristics

- Request bodies are limited to 16 KB.
- The frontend uses a 60-second request timeout.
- There is no authentication, rate limiting, streaming response, or server-side conversation history.
- Each request may incur Amazon Bedrock usage.
