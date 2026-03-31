"use client"
import {  useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
const Lobby = ({roomCode}:{roomCode:string |null}) => {
    const {socket} = useSocket();
    const [data, setData] = useState<{roomCode:string, isHost:boolean, clients:string[]} | null>(null);
    useEffect(()=>{
        if(!socket || !roomCode){
            console.log("No socket connection in Lobby component");
            return;
        }

        socket.emit("roomInfo", roomCode, (roomData: { roomCode: string; isHost: boolean; clients: string[]; message?: string }) => {
            if (roomData?.message) {
                return;
            }
            console.log(roomData);
            setData(roomData);
        });

        const onRoomUpdate = (updatedData: { roomCode: string; isHost: boolean; clients: string[] }) => {
            if (updatedData.roomCode !== roomCode) {
                return;
            }
            console.log("Received updated room info:", updatedData);
            setData(updatedData);
        };

        socket.on("updateRoomInfo", onRoomUpdate);

        const onRoomClosed = () => {
            setData(null);
        };

        socket.on("roomClosed", onRoomClosed);

        return () => {
            socket.off("updateRoomInfo", onRoomUpdate);
            socket.off("roomClosed", onRoomClosed);
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
