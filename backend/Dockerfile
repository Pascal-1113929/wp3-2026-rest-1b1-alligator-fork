# Build Stage
FROM python:3.10-alpine AS builder
WORKDIR /app
COPY requirements.txt /app

RUN apk add --no-cache rust cargo

RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install gunicorn -r requirements.txt
COPY . .
CMD ["sh", "-c", "gunicorn -b ${backend_http_host:-0.0.0.0}:${backend_http_port:-5000} app:app"]
