# Build stage
FROM node:16 AS build

WORKDIR /app

# Set environment variables
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV VITE_CJS_IGNORE_WARNING=true

# Install dependencies first 
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the code
COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]