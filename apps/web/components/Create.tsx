'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import Lobby from './Lobby';

type SocketRoomMeta = {
    __roomCode?: string;
};

const Create = () => {
    const { initializeSocket } = useSocket();
    const [roomCode, setRoomCode] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        try {
            const activeSocket = initializeSocket();
            if (!activeSocket) {
                throw new Error('Failed to initialize socket in Create component');
            }

            const socketWithMeta = activeSocket as typeof activeSocket & SocketRoomMeta;
            console.log(typeof socketWithMeta);

            if (socketWithMeta.__roomCode && mounted) {
                setRoomCode(socketWithMeta.__roomCode);
                return;
            }


            activeSocket.emit('CreateRoom', (data: { code: string }) => {
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
            {roomCode ? ` | room: ${roomCode}` : null}
            <Lobby roomCode={roomCode} />
        </div>
    );
};

export default Create;
