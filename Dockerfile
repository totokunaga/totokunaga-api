FROM node:18-alpine3.15 as builder

RUN apk update && apk add curl
RUN apk --no-cache add tzdata && \
    cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    apk del tzdata

WORKDIR /app
COPY ./ ./

RUN rm -rf /app/node_modules && yarn install

USER 101

ARG NODE_ENV="prod"
ENV NODE_ENV ${NODE_ENV}

CMD yarn start:${NODE_ENV}
