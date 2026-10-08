# Build Stage
FROM node:24-alpine AS build
WORKDIR /app

# somehow the environment variable for the api url is not passed to npm run build, causing errors during runtime :/
# not clean but it's a workaround for now
ARG frontend_base_url
ENV frontend_base_url=${frontend_base_url}

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

# Production Stage
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html

# heredoc syntax is reletively new in docker, so if you have a build error update your docker install :)
RUN cat << 'EOF' > /etc/nginx/conf.d/default.conf.template
server {
    listen        ${frontend_http_port};
    server_name   ${frontend_http_host};
    root          /usr/share/nginx/html;
    index         index.html;

    location / {
        try_files $uri $uri/ /index.html =404;
    }
}
EOF

EXPOSE ${frontend_http_port:-8080}
CMD envsubst '${frontend_http_port} ${frontend_http_host}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && \
    nginx -g 'daemon off;'
