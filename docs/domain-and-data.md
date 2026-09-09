# Domain rules and data

## Synthetic customers

The default customer lookup tools use three records embedded in [`src/domain/loan-risk.ts`](../src/domain/loan-risk.ts).

| Customer | Accepted aliases | Credit score | Account status |
| --- | --- | ---: | --- |
| Loren | `loren`, `loren@ibm.com`, `1111` | 455 | `good-standing` |
| Matt | `matt`, `matt@ibm.com`, `2222` | 685 | `closed` |
| Hilda | `hilda`, `hilda@ibm.com`, `3333` | 825 | `delinquent` |

Aliases are case-insensitive and surrounding whitespace is removed.

## Unknown customers

Unknown customer identifiers produce randomized demo values:

- Credit score: integer from 300 through 850
- Account status: one of `delinquent`, `good-standing`, or `closed`

This behavior is intentionally preserved from the original demonstration but is unsuitable for real lending decisions. Tests inject deterministic random values rather than asserting nondeterministic output.

## Default local risk rules

| Credit score | Good-standing | Closed | Delinquent |
| --- | --- | --- | --- |
| 750 or higher | Low | Medium | Medium |
| 550 through 749 | Medium | High | High |
| Below 550 | High | High | High |

An unknown account status returns `unable to determine`, except scores below 550 remain `high`.

## Default local interest rates

| Overall risk | Demo rate |
| --- | ---: |
| Low | 3% |
| Medium | 5% |
| High | 8% |
| Unknown or unsupported value | 12% |

## Reference policy PDFs

The repository also contains:

- `artifacts/data/Bank Loan Overall Risk Policy.pdf`
- `artifacts/data/Bank Loan Interest Rate Policy.pdf`

Those documents define a different policy:

- Score bands use 300-674, 675-749, and 750-850.
- A closed account with a score from 675-749 is medium risk.
- A closed account with a score from 750-850 is low risk.
- Rates are 3.175%, 4.885%, and 6.325%.

The historical deployment guide treats these files as the knowledge source for the optional IBM RAG mode. They are not the current default local decision implementation.

This divergence is a deliberate documentation point and should not be resolved implicitly. A product owner must decide which rule set is authoritative before production use.
