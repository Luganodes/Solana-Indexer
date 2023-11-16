FROM node:18-alpine

WORKDIR /app

USER root

COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]
