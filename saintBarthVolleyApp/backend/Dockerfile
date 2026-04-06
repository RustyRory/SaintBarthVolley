FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
ENV HUSKY=0
RUN npm install --omit=dev

COPY . .

# Dossier uploads persisté via volume
RUN mkdir -p public/uploads

EXPOSE 5000
CMD ["node", "server.js"]
