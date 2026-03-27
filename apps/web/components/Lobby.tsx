"use client"
import {  useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
const Lobby = ({roomCode}:{roomCode:string |null}) => {
    const {socket} = useSocket();
    const [data, setData] = useState<{roomCode:string, isHost:boolean, clients:string[]} | null>(null);
    useEffect(()=>{
        if(!socket){
            console.log("No socket connection in Lobby component");
            return;
        }
        socket.emit("roomInfo", roomCode);

        socket.on("roomInfoResponse",async (data) => {
            console.log("Received room info:", data);
            setData(data);
        });

        return () => {
            socket.off("roomInfoResponse");
        };
    }, [socket, roomCode]);
  return (
    <div>{
        data ? (
            <div>
                <h2>Lobby</h2>
                <p>Room Code: {data.roomCode}</p>
                <p>{data.isHost ? "You are the host" : "You are a participant"}</p>
                <p>Clients in room: {data.clients.join(", ")}</p>
            </div>
        ) : (
            <p>Loading room info...</p>
        )
    }</div>
  )
}

export default Lobby
