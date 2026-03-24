"use client"
import { useSocket } from "../context/SocketContext";
const Lobby = () => {
    const {socket} = useSocket();

  return (
    <div>{socket?.id}</div>
  )
}

export default Lobby
