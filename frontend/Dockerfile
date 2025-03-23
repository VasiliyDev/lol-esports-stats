FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# No need for the sed command now that we're setting host in vite.config.js
EXPOSE 5173

CMD ["npm", "run", "dev"]
