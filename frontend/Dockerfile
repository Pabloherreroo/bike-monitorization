FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

FROM node:20

RUN npm install -g serve
WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 80

CMD ["serve", "-s", "dist", "--single", "-l", "80"]
