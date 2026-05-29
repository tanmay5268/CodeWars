"use client";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";

const Lobby = ({ roomCode }: { roomCode: string | null }) => {
  const { socket } = useSocket();
  const copiedRef = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    if (!copiedRef.current) return;
    try {
      await navigator.clipboard.writeText(copiedRef.current.textContent || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }
  useEffect(() => {
    const currentRef = copiedRef.current;
    if (currentRef) {
      currentRef.addEventListener("click", handleCopy);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("click", handleCopy);
      }
    };
  }, []);
  const [data, setData] = useState<{
    roomCode: string;
    isHost: boolean;
    clients: string[];
  } | null>(null);
  useEffect(() => {
    if (!socket || !roomCode) {
      return;
    }

    socket.emit(
      "roomInfo",
      roomCode,
      (roomData: {
        roomCode: string;
        isHost: boolean;
        clients: string[];
        message?: string;
      }) => {
        if (roomData?.message) {
          return;
        }
        setData(roomData);
      },
    );

    const onRoomUpdate = (updatedData: {
      roomCode: string;
      isHost: boolean;
      clients: string[];
    }) => {
      if (updatedData.roomCode !== roomCode) {
        return;
      }
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
    <div className="h-full w-full p-4 font-body text-[#e9dbe3]">
      {data ? (
        <div className="flex h-full min-h-0 flex-col gap-4">
          <div className="flex items-center justify-between rounded-sm border border-white/10 bg-black/40 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#9cff93]">
                Lobby
              </p>
              <p className="text-xs text-[#bfa3b0]">Waiting for players</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${
                  data.isHost
                    ? "bg-[#9cff93] text-[#0b0b0b]"
                    : "bg-[#d375fe] text-[#140b1a]"
                }`}
              >
                {data.isHost ? "Host" : "Participant"}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#78dffb]">
                Online
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-sm border border-white/10 bg-black/30 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#bfa3b0]">
                Room code
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  ref={copiedRef}
                  className="font-display text-2xl text-[#9cff93] tracking-[0.3em]"
                >
                  {data.roomCode}
                </span>
                <button
                  className="rounded-sm border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#78dffb] transition-all duration-200 ease-out hover:scale-105 active:scale-95"
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-3 text-xs text-[#a38a98]">
                Give this code to friends to join your match.
              </p>
            </div>
            <div className="rounded-sm border border-white/10 bg-black/30 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#bfa3b0]">
                Session
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#bfa3b0]">Status</span>
                  <span className="font-semibold text-[#9cff93]">Open</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#bfa3b0]">Players</span>
                  <span className="font-semibold text-white">
                    {data.clients.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#bfa3b0]">Role</span>
                  <span
                    className={`font-semibold ${
                      data.isHost ? "text-[#9cff93]" : "text-[#d375fe]"
                    }`}
                  >
                    {data.isHost ? "Host" : "Participant"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-sm border border-white/10 bg-black/20">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#bfa3b0]">
                Connected players
              </p>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#78dffb]">
                {data.clients.length} online
              </span>
            </div>
            <div className="min-h-0 flex-1 px-4 py-3 md:overflow-y-auto">
              {data.clients.length === 0 ? (
                <div className="rounded-sm border border-dashed border-white/10 px-3 py-4 text-center text-xs text-[#a38a98]">
                  No players yet. Share the room code to invite others.
                </div>
              ) : (
                <ul className="space-y-2">
                  {data.clients.map((client) => {
                    const isYou = client === socket?.id;
                    return (
                      <li
                        key={client}
                        className={`flex items-center justify-between rounded-sm border px-3 py-2 text-xs ${
                          isYou
                            ? "border-[#9cff93]/60 bg-[#122314] text-[#caffc1]"
                            : "border-white/10 bg-black/40 text-[#d9c7d3]"
                        }`}
                      >
                        <span className="font-mono tracking-[0.08em]">
                          {client}
                        </span>
                        <span
                          className={`rounded-sm px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                            isYou
                              ? "bg-[#9cff93] text-[#0b0b0b]"
                              : "bg-[#2a1b27] text-[#bfa3b0]"
                          }`}
                        >
                          {isYou ? "You" : "Player"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="glass-panel rounded-sm px-4 py-3 text-sm text-[#bfa3b0]">
            Loading room info...
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
