import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { requiredVars } from './env';
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

        // console.log("Room created with code:", roomCode);

        if (typeof ack === "function") {
            ack({ code: roomCode });
        }
        hostcodeMap.set(roomCode, socket.id);
        socketToCode.set(socket.id, roomCode);
        console.log(hostcodeMap);
        console.log(socketToCode);
    });

    socket.on("joinRoom", (data) => {
        console.log(`User ${socket.id} joined room: ${data.code}`);
        socketToCode.set(socket.id, data.code);
        console.log(hostcodeMap);
        console.log(socketToCode);
    });
    socket.on('roomInfo',(roomCode)=>{
        const clientsArray=[];
        for(let [socketId, code] of socketToCode.entries()){
            if(code === roomCode){
                clientsArray.push(socketId);
            }
        }
        const hostId = hostcodeMap.get(roomCode);
        const isHost = hostId === socket.id;

        socket.emit('roomInfoResponse', {
            roomCode,
            isHost,
            clients: clientsArray});
    })

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        const code = socketToCode.get(socket.id);
        if (code) {
            console.log(socketToCode);
            console.log(hostcodeMap);
            socketToCode.delete(socket.id);
            hostcodeMap.delete(code);
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
