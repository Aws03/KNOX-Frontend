# KNOX web

The React SPA for KNOX, a university knowledge hub. The API lives in [Aws03/KNOX](https://github.com/Aws03/KNOX), which also holds the production deployment (`deploy/`).

**Stack:** React 19, TypeScript, Vite 7, React Router 7, TanStack Query, Axios, Tailwind v4 + shadcn/ui, react-i18next (English and Arabic).

## Development

```bash
npm ci
npm run dev        # http://localhost:5173, calls the API at http://localhost:5001/api
npm run lint
npm test           # Vitest
npm run build      # type-check + production bundle in dist/
```

Set `VITE_API_URL` to point at another API. It is inlined at build time, and the Docker image defaults to `/api`, which nginx proxies.

## Production image

`Dockerfile` builds the bundle and serves it from unprivileged nginx on port 8080 (`nginx.conf`, rendered from a template at start-up):

- Routes are code-split per page. Hashed `/assets` are cached for a year as immutable; the HTML shell is always revalidated.
- `/api/*` is proxied to `backend:5001`. The real client IP is taken from the edge proxy (Caddy) and passed on as a single trusted `X-Forwarded-For` hop.
- `/healthz` proxies the API's readiness check, for uptime monitoring.
- Security headers include a strict Content-Security-Policy. Set `CSP_MEDIA_SOURCES` to the origins of your CDN and buckets (default `https:`).

Course materials, including large videos, are uploaded straight from the browser to object storage with a presigned URL, and played from short-lived signed URLs. The API only signs requests.

CI (`.github/workflows/ci.yml`) runs audit, lint, tests and build, scans the image with Trivy, and publishes `ghcr.io/<owner>/knox-web` (`sha-<commit>`, `latest`, semver tags) for `linux/amd64` and `linux/arm64`.
