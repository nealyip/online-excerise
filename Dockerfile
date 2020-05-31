FROM node:12-alpine AS install-image

WORKDIR /app

RUN chown node:node /app

USER node

COPY --chown=node:node ./server/package*.json ./

RUN npm install

FROM node:12-alpine AS runtime-image

WORKDIR /app

COPY --from=install-image /app /app
COPY --chown=node:node ./server .

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/server.js"]
