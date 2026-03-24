'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import Lobby from './Lobby';

type SocketRoomMeta = {
    __roomCode?: string;
};

const Create = () => {
    const { socket, initializeSocket } = useSocket();
    const [roomCode, setRoomCode] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        try {
            const activeSocket = initializeSocket();
            if (!activeSocket) {
                throw new Error('Failed to initialize socket in Create component');
            }

            const socketWithMeta = activeSocket as typeof activeSocket & SocketRoomMeta;

            if (socketWithMeta.__roomCode && mounted) {
                setRoomCode(socketWithMeta.__roomCode);
                return;
            }

            // In Next.js dev, React StrictMode intentionally runs effects twice.
            // Use Socket.IO acknowledgements so even if a simulated unmount happens,
            // we still capture the response without relying on an event listener.
            activeSocket.emit('CreateRoom', (data: { code: string }) => {
                // Persist on the singleton socket so future mounts reuse it.
                socketWithMeta.__roomCode = data.code;
                if (mounted) {
                    setRoomCode((prev) => (prev === data.code ? prev : data.code));
                }

            });

            return () => {
                mounted = false;
            };
        } catch (err) {
            console.error('Error initializing socket in Create component:', err);
            return () => {
                mounted = false;
            };
        }
    }, [initializeSocket]);

    return (
        <div>
            {socket?.id}
            {roomCode ? ` | room: ${roomCode}` : null}
            <Lobby />
        </div>
    );
};

export default Create;
