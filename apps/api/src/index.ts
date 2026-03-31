import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { requiredVars } from './env';
import { log } from 'console';
const app = express();
const port = requiredVars.SOCKET_PORT;
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: requiredVars.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

const hostcodeMap = new Map<string, string>();
const socketToCode = new Map<string, string>();
const roomToClients = new Map<string, Set<string>>();

const getRoomInfo = (roomCode: string, requesterId: string) => {
    const hostId = hostcodeMap.get(roomCode);
    const isHost = hostId === requesterId;
    const clients = Array.from(roomToClients.get(roomCode) ?? []);
    return { roomCode, isHost, clients };
};

const emitRoomUpdate = (roomCode: string) => {
    const clients = Array.from(roomToClients.get(roomCode) ?? []);

    for (const socketId of clients) {
        const isHost = hostcodeMap.get(roomCode) === socketId;
        io.to(socketId).emit("updateRoomInfo", { roomCode, isHost, clients });
    }
};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("CreateRoom", (ack?: (payload: { code: string }) => void) => {
        const existingCode = socketToCode.get(socket.id);
        if (existingCode) {
            if (typeof ack === "function") {
                ack({ code: existingCode });
            }
            return;
        }
        let roomCode = "";
        do {
            roomCode = Math.floor(Math.random() * 1000000)
                .toString()
                .padStart(6, "0");
        } while (hostcodeMap.has(roomCode));

        if (typeof ack === "function") {
            ack({ code: roomCode });
        }

        hostcodeMap.set(roomCode, socket.id);
        socketToCode.set(socket.id, roomCode);
        socket.join(roomCode);

        if (!roomToClients.has(roomCode)) {
            roomToClients.set(roomCode, new Set());
        }
        roomToClients.get(roomCode)?.add(socket.id);

        emitRoomUpdate(roomCode);
        console.log(roomToClients);

    });

    socket.on("joinRoom", (data: { code: string } | string, ack?: (payload: { ok: boolean; message?: string }) => void) => {
        const roomCode = typeof data === "string" ? data : data?.code;

        if (!roomCode || !hostcodeMap.has(roomCode)) {
            if (typeof ack === "function") {
                ack({ ok: false, message: "Room not found" });
            }
            return;
        }

        console.log(`User ${socket.id} joined room: ${roomCode}`);
        socketToCode.set(socket.id, roomCode);
        socket.join(roomCode);

        if (!roomToClients.has(roomCode)) {
            roomToClients.set(roomCode, new Set());
        }
        roomToClients.get(roomCode)?.add(socket.id);

        emitRoomUpdate(roomCode);

        if (typeof ack === "function") {
            ack({ ok: true });
        }
        console.log(roomToClients);
    });

    socket.on('roomInfo', (roomCode: string, ack?: (payload: { roomCode: string; isHost: boolean; clients: string[] } | { message: string }) => void) => {
        if (!roomCode || !hostcodeMap.has(roomCode)) {
            if (typeof ack === "function") {
                ack({ message: "Room not found" });
            }
            return;
        }

        if (typeof ack === "function") {
            ack(getRoomInfo(roomCode, socket.id));
        }
    });

    socket.on("someoneJoined", (roomCode: string) => {
        if (!roomCode || !hostcodeMap.has(roomCode)) {
            return;
        }
        emitRoomUpdate(roomCode);
        console.log(roomToClients);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        const code = socketToCode.get(socket.id);
        if (code) {
            console.log(socketToCode);
            console.log(hostcodeMap);

            roomToClients.get(code)?.delete(socket.id);
            if ((roomToClients.get(code)?.size ?? 0) === 0) {
                roomToClients.delete(code);
            }

            const hostId = hostcodeMap.get(code);
            socketToCode.delete(socket.id);

            if (hostId === socket.id) {
                hostcodeMap.delete(code);
                const members = Array.from(roomToClients.get(code) ?? []);
                for (const memberSocketId of members) {
                    socketToCode.delete(memberSocketId);
                }
                roomToClients.delete(code);
                io.to(code).emit("roomClosed", { roomCode: code });
            } else {
                emitRoomUpdate(code);
            }
        }
    });
});

app.post('/joinRoom', (req, res) => {
    console.log("Join room request received with body:", req.body);
    try {
        const { code } = req.body;
        if (hostcodeMap.has(code)) {
            res.send({ available: true });
        } else {
            res.send({ available: false });
        }
    } catch (error) {
        res.status(400).send({ message: "Bad request" });
    }
});

server.listen(port, () => {
    console.log(`Socket.IO server running on port ${port}`);
});
