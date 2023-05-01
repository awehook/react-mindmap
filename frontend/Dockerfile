#STAGE1
FROM node:12-alpine AS build
WORKDIR /app
COPY package.json . 
RUN npm install
COPY . .
RUN npm run build

#STAGE2
FROM node:12-alpine
WORKDIR /app
RUN npm install -g http-server
COPY --from=build /app/build ./react-mindmap
COPY env.sh .env .
EXPOSE 8080
CMD chmod +x ./env.sh && ./env.sh && mv env-config.js react-mindmap && http-server . -c-1 -o ./react-mindmap/index.html
