FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

# devサーバーを 0.0.0.0 でバインド
CMD ["npm", "run", "dev", "--" ,"-H", "0.0.0.0", "-p", "3001"]
