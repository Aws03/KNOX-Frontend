# syntax=docker/dockerfile:1

# ---- Build ----
# The bundle is plain JS/CSS, so it is built once on the native platform for every target architecture.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Baked into the bundle at build time (Vite inlines import.meta.env.*). The relative default
# goes through nginx's /api proxy, so the browser never needs the backend's address.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Serve (non-root nginx on 8080) ----
FROM nginxinc/nginx-unprivileged:alpine AS runtime
ARG VERSION=dev
ARG REVISION=unknown
LABEL org.opencontainers.image.title="knox-web" \
      org.opencontainers.image.source="https://github.com/Aws03/KNOX-Frontend" \
      org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$REVISION

# Where images, videos and direct uploads live (object storage / CDN origins, space-separated) for the
# Content-Security-Policy. The default allows any HTTPS origin; pin it to your CDN and bucket hosts.
ENV CSP_MEDIA_SOURCES="https:"

# Pick up OS security fixes released after the base image was built.
USER root
RUN apk upgrade --no-cache
USER 101

COPY --from=build /app/dist /usr/share/nginx/html
# Rendered to /etc/nginx/conf.d/default.conf by the image's envsubst step at start-up.
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
