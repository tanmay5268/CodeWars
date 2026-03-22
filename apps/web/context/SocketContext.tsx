"use client";
import type { Socket } from "socket.io-client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ensureSocketConnected } from "../lib/socket";

interface SocketContextType {
    socket: Socket | null;
    initializeSocket: () => Socket | null | undefined;
    disconnectSocket: () => void;
    isConnecting: boolean;
    error: string | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const connectingRef = useRef(false);

    const initializeSocket = useCallback(() => {
        if (socketRef.current) {
            return socketRef.current;
        }

        if (connectingRef.current) {
            return;
        }

        connectingRef.current = true;
        setIsConnecting(true);
        setError(null);

        try {
            const newSocket = ensureSocketConnected();
            socketRef.current = newSocket;
            setSocket(newSocket);
            return newSocket;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("Error creating socket:", err);
            setError(message);
            connectingRef.current = false;
            setIsConnecting(false);
            return null;
        }
    }, []);

    useEffect(() => {
        if (!socket) {
            return;
        }

        const onConnect = () => {
            connectingRef.current = false;
            setIsConnecting(false);
            console.log("Socket connected with ID:", socket.id);
        };

        const onDisconnect = () => {
            console.log("Socket disconnected");
        };

        const onError = (err: Error) => {
            console.error("Socket error:", err);
            setError(err.message);
        };

        const onConnectError = (err: Error) => {
            console.error("Socket connection error:", err);
            setError(err.message);
            connectingRef.current = false;
            setIsConnecting(false);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("error", onError);
        socket.on("connect_error", onConnectError);

        if (socket.connected) {
            onConnect();
        }

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("error", onError);
            socket.off("connect_error", onConnectError);
        };
    }, [socket]);

    const disconnectSocket = useCallback(() => {
        const activeSocket = socketRef.current;
        if (!activeSocket) return;
        activeSocket.disconnect();
        socketRef.current = null;
        connectingRef.current = false;
        setIsConnecting(false);
        setSocket(null);
        console.log("Socket disconnected");
    }, []);

    const value = useMemo(
        () => ({
            socket,
            initializeSocket,
            disconnectSocket,
            isConnecting,
            error,
        }),
        [socket, initializeSocket, disconnectSocket, isConnecting, error]
    );

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);

    if (!context) {
        throw new Error(
            "useSocket must be used within a SocketProvider. Make sure your entire app is wrapped with <SocketProvider>"
        );
    }

    return context;
}
