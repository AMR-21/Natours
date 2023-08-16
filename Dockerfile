FROM node:latest

WORKDIR /usr/src/natours
COPY package*.json /
EXPOSE 3000

RUN npm ci --omit=dev
COPY . .
CMD ["node", "server.js"]

