import { useState } from "react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import Lobby from "./Lobby";

const JoinRoom = () => {
    const [joinCode, setJoinCode] = useState("");
    const [codeSuccess, setCodeSuccess] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState("");

    const { socket, initializeSocket } = useSocket();

    const handleCodeInput = (e) => {
        setJoinCode(e.target.value);
        setError("");
    };

    const joinWithCode = async () => {
        if (!joinCode.trim()) {
            setError("Please enter a room code");
            return;
        }

        setIsJoining(true);
        setError("");

        try {
            const response = await axios.post("http://localhost:4000/joinRoom", {
                code: joinCode
            });

            if (response.data.available) {
                const newSocket = initializeSocket();

                if (!newSocket) {
                    setIsJoining(false);
                    setError("Failed to connect to server");
                    return;
                }

                const handleConnect = () => {
                    console.log("Socket connected, now joining room...");

                    newSocket.emit("joinRoom", { code: joinCode });

                    console.log("Joined room with code:", joinCode);
                    setCodeSuccess(true);
                    console.log(newSocket);

                    newSocket.off("connect", handleConnect);
                };

                if (newSocket.connected) {
                    handleConnect();
                } else {
                    newSocket.once("connect", handleConnect);
                }
            } else {
                setError("Room code not found. Please check and try again.");
            }
        } catch (err) {
            console.error("Error joining room:", err.message);
            setError("Error joining room. Please try again.");
        } finally {
            setIsJoining(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            joinWithCode();
        }
    };

    return (
        <div className="flex flex-col items-center text-center mb-6 border-2 p-4 rounded-lg">
            <h2 className="mb-4 text-lg font-semibold">Join an Existing Room</h2>

            <input
                type="text"
                placeholder="Enter Room Code"
                value={joinCode}
                onChange={handleCodeInput}
                onKeyUp={handleKeyPress}
                className="mb-3 p-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 w-full max-w-xs"
                disabled={isJoining}
            />

            <button
                onClick={joinWithCode}
                disabled={isJoining}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold mb-6 py-2 px-4 rounded disabled:bg-gray-400"
            >
                {isJoining ? "Joining..." : "Join Room"}
            </button>

            {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

            {codeSuccess && (
                <p className="text-green-600 font-semibold">
                    Successfully joined!
                </p>
            )}

            {socket && (
                <p className="mt-3 text-sm text-blue-600">
                    ✓ Socket connected (ID: {socket.id})
                </p>
            )}
            <Lobby />
        </div>
    );
};

export default JoinRoom;
