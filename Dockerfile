ARG BUILDER_IMAGE=node:24.12.0
ARG TARGET_IMAGE=nginx:1.29.4-alpine

FROM ${BUILDER_IMAGE} AS builder

WORKDIR /app

COPY . .

RUN yarn

RUN yarn build


FROM ${TARGET_IMAGE} AS final

COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/docker/etc/nginx /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
