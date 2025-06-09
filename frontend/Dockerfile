FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 80

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "80"]