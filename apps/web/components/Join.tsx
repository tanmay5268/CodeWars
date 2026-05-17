"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import Lobby from "./Lobby";
import { ChangeEvent } from "react";
const JoinRoom = () => {
  const { data: session } = useSession();
  const [joinCode, setJoinCode] = useState("");
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { initializeSocket } = useSocket();

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleCodeInput = (e: ChangeEvent<HTMLInputElement>) => {
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
        code: joinCode,
      });

      if (response.data.available) {
        const newSocket = initializeSocket();

        if (!newSocket) {
          setIsJoining(false);
          setError("Failed to connect to server");
          return;
        }

        const handleConnect = () => {

          newSocket.emit(
            "joinRoom",
            { code: joinCode, username: session?.user?.name || "Guest" },
            (joinAck: { ok: boolean; message?: string }) => {
              if (!joinAck?.ok) {
                setError(joinAck?.message || "Unable to join room");
                setCodeSuccess(false);
                return;
              }

              setCodeSuccess(true);
            },
          );

          newSocket.off("connect", handleConnect);
        };

        if (newSocket.connected) {
          handleConnect();
        } else {
          newSocket.once("connect", handleConnect);
        }
      } else {
        setError("Room code not found. Please check and try again.");
        setJoinCode("");
        setCodeSuccess(false);
      }
    } catch (e) {
      setError(`Error joining room ------ ${e}.`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      joinWithCode();
    }
  };

  return (
    <div className="h-full w-full items-center justify-center font-[Space]">
      {!codeSuccess && (
        <div className="flex h-full w-full items-center justify-center">
          <div
            className={`w-full max-w-sm rounded-sm border border-[#2b1b26] bg-[#0f0d13] px-5 py-5 text-[#e9dbe3] shadow-[0_0_28px_rgba(120,223,251,0.08)] transition-opacity duration-700 ease-in-out ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.35em] text-[#78dffb]">
                  Join Room
                </p>
                <p className="text-xs text-[#bfa3b0]">
                  Enter the match code to connect
                </p>
              </div>
              <span className="rounded-sm border border-[#3a2130] px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-[#9cff93]">
                Ready
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-sm border border-[#2a2a2a] bg-[#14111a] px-3 py-3 text-sm text-white placeholder:text-[#6f5f69] focus:outline-none focus:ring-2 focus:ring-[#9cff93]"
                type="text"
                placeholder="Enter Room Code"
                value={joinCode}
                onChange={handleCodeInput}
                onKeyUp={handleKeyPress}
                disabled={isJoining}
              />
              <button
                onClick={joinWithCode}
                disabled={isJoining}
                className="w-full rounded-sm bg-[#9cff92] py-3 text-base font-bold uppercase text-neutral-950 shadow-[3px_3px_0px_#00e038] transition-all hover:translate-x-0.75 hover:translate-y-0.75 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-[#9cff93] disabled:cursor-not-allowed disabled:bg-[#6da96a]"
              >
                {isJoining ? "Joining..." : "Enter Room"}
              </button>
            </div>

            <div className="mt-4 rounded-sm border border-dashed border-[#2b1b26] px-3 py-2 text-[12px] font-medium text-[#a38a98]">
              Make sure your friend is already waiting in the lobby.
            </div>
          </div>
        </div>
      )}

      {error && <p className="mb-3 text-center text-sm text-red-400">{error}</p>}

      {codeSuccess && <Lobby roomCode={joinCode} />}
    </div>
  );
};

export default JoinRoom;
