"use client"
import {  useEffect } from "react";
import { useSocket } from "../context/SocketContext";
const Lobby = ({roomCode}:{roomCode:string |null}) => {
    const {socket} = useSocket();

    useEffect(()=>{
        if(!socket){
            console.log("No socket connection in Lobby component");
            return;
        }
        socket.emit("roomInfo", roomCode);
        socket.on("roomInfoResponse", (data) => {
            console.log("Received room info:", data);
        });

        return () => {
            socket.off("roomInfoResponse");
        };
    }, [socket, roomCode]);
  return (
    <div>{socket?.id}</div>
  )
}

export default Lobby
