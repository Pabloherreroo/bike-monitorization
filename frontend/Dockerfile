FROM node:20

WORKDIR /app

ENV VITE_CJS_IGNORE_WARNING=true

# Install dependencies
COPY package*.json ./
RUN npm install

# Expose the development port
EXPOSE 80

# Use Vite's development server in dev mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"]