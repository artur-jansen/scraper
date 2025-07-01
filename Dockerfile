FROM node:20

# Instala Playwright e dependências do Chromium
RUN apt-get update && apt-get install -y wget gnupg ca-certificates libglib2.0-0 libnss3 libatk-bridge2.0-0 libxss1 libasound2 libx11-xcb1 libgtk-3-0 libxcomposite1 libxdamage1 libxrandr2 libgbm-dev libpango-1.0-0 libatk1.0-0 libcups2 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
