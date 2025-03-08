FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Update the Vite configuration to listen on all interfaces
RUN sed -i 's/5173/5173 --host/g' package.json

EXPOSE 5173

CMD ["npm", "run", "dev"]
