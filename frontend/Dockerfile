FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# devサーバーを 0.0.0.0 でバインド
CMD ["npx", "next", "dev", "-H", "0.0.0.0", "-p", "3000"]
