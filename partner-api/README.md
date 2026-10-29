# Demo partner API

A stand-in data source. Returns **demo data**, not real campaigns or jobs.

```bash
PARTNER_TOKEN=choose-a-secret node server.mjs     # token optional locally
curl -H "Authorization: Bearer choose-a-secret" localhost:4010/campaigns/cmp_ada/stats
```

Endpoints: `GET /health`, `GET /campaigns/:id/stats`, `GET /jobs/:id`. No dependencies.

For Live mode, deploy it to a public URL (any Node host or container) and use that URL in the Primus template.
A Primus attestor runs the TLS session from its own network, so `localhost` will not work.
