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
    <div className="flex h-full w-full flex-col font-body">
      {!codeSuccess && (
        <div className="flex w-full flex-1 items-center justify-center">
          <div
            className={`glass-panel w-full max-w-sm rounded-sm px-6 py-6 text-[#e9dbe3] transition-opacity duration-700 ease-in-out ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase font-semibold tracking-[0.4em] text-[#78dffb]">
                  Join room
                </p>
                <p className="text-xs font-medium text-[#bfa3b0]">
                  Enter the match code to connect
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#9cff93]">
                Ready
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <input
                className="w-full rounded-sm border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-[#6f5f69] focus:outline-none focus:ring-2 focus:ring-[#9cff93]"
                type="text"
                placeholder="Enter room code"
                value={joinCode}
                onChange={handleCodeInput}
                onKeyUp={handleKeyPress}
                disabled={isJoining}
              />
              <button
                onClick={joinWithCode}
                disabled={isJoining}
                className="w-full rounded-sm bg-primary py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_0_20px_rgba(0,255,65,0.35)] transition-all hover:translate-y-[-2px] hover:shadow-[0_0_35px_rgba(0,255,65,0.6)] focus:outline-none focus:ring-2 focus:ring-[#9cff93] disabled:cursor-not-allowed disabled:bg-[#6da96a]"
              >
                {isJoining ? "Joining..." : "Enter room"}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <div className="mt-4 rounded-sm border border-dashed border-white/10 px-4 py-3 text-[11px] font-medium text-[#a38a98]">
              Make sure the host is already waiting in the lobby.
            </div>
          </div>
        </div>
      )}

      {codeSuccess && <Lobby roomCode={joinCode} />}
    </div>
  );
};

export default JoinRoom;
