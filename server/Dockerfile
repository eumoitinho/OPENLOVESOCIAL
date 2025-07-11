# Dockerfile para WebRTC Signaling Server
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install --production || true

COPY webrtc-signaling-server.js ./

EXPOSE 8088

CMD ["node", "webrtc-signaling-server.js"] 