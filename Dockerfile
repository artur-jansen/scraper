FROM node:18-alpine

# Instalar dependências do sistema necessárias para o Playwright rodar (Chromium etc)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/*

WORKDIR /app

COPY package*.json ./

RUN npm install

# Baixar navegadores para Playwright
RUN npx playwright install

COPY . .

CMD ["node", "threadsScraper.js"]
