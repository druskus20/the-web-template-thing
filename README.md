# The web template thing

End to end typesafe template app with json logging and Svelte.

Scalar (OpenAPI), Hono (Server), SvelteKit, ORPC, Pino (Logging), pnpm stuff

By default: 

- backend: localhost:3001/
  - scalar: http://localhost:3001/
  - openapi spec: http://localhost:3001/spec.json
- frontend: http://localhost:5173/



## Get started

```bash
just install
just setup            # Full project setup
just fmt
just clean            # Clean then build everything
```

### Run locally and recompile typechecks

```bash
just dev
just dev-backend
just dev-frontend
```
