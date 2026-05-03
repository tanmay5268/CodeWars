"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import Lobby from "./Lobby";
import { ChangeEvent } from "react";
const JoinRoom = () => {
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
            { code: joinCode },
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
    <div className="h-full w-full items-center justify-center">
        {!codeSuccess && <div className="flex justify-center items-center  h-full w-full ">
        <div
          className={`bg-[#c3ccf2] flex  w-fit flex-col h-fit gap-4 text-white justify-center items-center text-center px-3 py-3 rounded-sm transition-opacity duration-700 ease-in-out ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <input
            className="rounded-sm py-3 px-3   bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#9cff93] w-64"
            type="text"
            placeholder="Enter Room Code"
            value={joinCode}
            onChange={handleCodeInput}
            onKeyUp={handleKeyPress}
            disabled={isJoining}
          />
          <div className=" w-full flex items-center justify-center">
            <button
              onClick={joinWithCode}
              disabled={isJoining}
              className="transition-all shadow-[3px_3px_0px_#00e038] hover:shadow-none hover:translate-x-0.75 uppercase hover:translate-y-0.75 text-neutral-950 w-full py-3 text-xl font-[Space] rounded-sm  font-bold bg-[#9cff92]  focus:outline-none focus:ring-2 focus:ring-[#9cff93]">
              {isJoining ? "Joining..." : "Enter Room"}
            </button>
          </div>
        </div>
      </div> }
      
      {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

      {codeSuccess && <Lobby roomCode={joinCode} />}
    </div>
  );
};

export default JoinRoom;
