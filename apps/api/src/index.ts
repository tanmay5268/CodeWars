import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const port = process.env.BACKEND_PORT
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const codeMap = new Map<string, string>();
const socketToCode = new Map<string, string>();

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
        } while (codeMap.has(roomCode));

        // console.log("Room created with code:", roomCode);

        if (typeof ack === "function") {
            ack({ code: roomCode });
        }
        codeMap.set(roomCode, socket.id);
        socketToCode.set(socket.id, roomCode);
        console.log(codeMap);
        console.log(socketToCode);
    });

    socket.on("joinRoom", (data) => {
        const { roomCode } = data;
        socket.join(roomCode);
        console.log(`User ${socket.id} joined room: ${roomCode}`);
        socket.emit("joinedRoom", { roomCode });
    });

    socket.on("send_message", (data) => {
        const { roomCode, message, timestamp } = data;
        console.log(`Message in room ${roomCode}: ${message}`);

        // Send ONLY to users in this room
        io.emit(`receive_message-${data.roomCode}`, {
            message,
            timestamp,
            sender: socket.id
        });
    });
    socket.on("get_questions", (roomCode) => {
        io.emit(`questions-${roomCode}`);
    })

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        const code = socketToCode.get(socket.id);
        if (code) {
            console.log(socketToCode);
            console.log(codeMap);
            socketToCode.delete(socket.id);
            codeMap.delete(code);
        }
    });
});

app.post('/joinRoom', (req, res) => {
    console.log("Join room request received with body:", req.body);
    try {
        const { code } = req.body;
        if (codeMap.has(code)) {
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
