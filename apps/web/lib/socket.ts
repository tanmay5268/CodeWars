import { io, Socket } from "socket.io-client";

const DEFAULT_URL = "http://localhost:4000";

declare global {
  var __codewarsSocket: Socket | undefined;
}

export function getSocketUrl() {
  return process.env.NEXT_PUBLIC_SOCKET_URL || DEFAULT_URL;
}

export function getSingletonSocket(): Socket {
  if (typeof window === "undefined") {
    throw new Error("getSingletonSocket() must be called in the browser");
  }

  if (!globalThis.__codewarsSocket) {
    globalThis.__codewarsSocket = io(getSocketUrl(), {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
  }

  return globalThis.__codewarsSocket;
}

export function ensureSocketConnected(): Socket {
  const socket = getSingletonSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}
