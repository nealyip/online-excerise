FROM node:12-alpine

WORKDIR /app

RUN chown node:node /app

USER node

COPY --chown=node:node ./server .

RUN npm install && npm run build

EXPOSE 8080

CMD ["node", "dist/server.js"]
