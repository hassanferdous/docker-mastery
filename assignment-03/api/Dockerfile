FROM node:26-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
EXPOSE 8000
CMD ["npm", "run", "start"]