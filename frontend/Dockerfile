#STAGE1
FROM node:12-alpine AS build
RUN npm config set registry https://registry.npm.taobao.org \
    && yarn config set registry https://registry.npm.taobao.org
WORKDIR /app
COPY package.json . 
RUN npm install
COPY . .
RUN npm run build

#STAGE2
FROM node:12-alpine
RUN npm config set registry https://registry.npm.taobao.org \
    && yarn config set registry https://registry.npm.taobao.org
WORKDIR /app
RUN npm install -g http-server
CMD sleep 1000
COPY --from=build /app/build ./react-mindmap
EXPOSE 8080
CMD http-server . -c-1 -o ./react-mindmap/index.html
