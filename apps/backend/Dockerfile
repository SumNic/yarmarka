FROM node:alpine As dev

WORKDIR /app

COPY package*.json ./ yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

COPY . .

RUN yarn build

FROM node:alpine as prod

WORKDIR /app

COPY --from=dev /app/dist ./dist
COPY --from=dev /app/node_modules ./node_modules
COPY --from=dev /app/package.json ./
COPY --from=dev /app/sequelize.config.js ./
# COPY --from=dev /app/migrations ./migrations

EXPOSE 5000

CMD ["node", "dist/main"]