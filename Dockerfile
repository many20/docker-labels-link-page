FROM node:22-alpine
WORKDIR /app

#RUN mkdir -p /app

RUN apk update && apk add bash curl

RUN npm install -g pnpm@10

COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm install

COPY . .

ENTRYPOINT ["npx", "zx"]
CMD ["./lib/server.mjs"]
