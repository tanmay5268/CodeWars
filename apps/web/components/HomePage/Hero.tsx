"use client";
import React from "react";
import { VscDiffAdded } from "react-icons/vsc";
import { RxExit } from "react-icons/rx";
import { RoomStatus } from "../RoomStatus";
import { useSession } from "next-auth/react";

type ActionButtonProps = {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  variant: "primary" | "secondary";
};

const ActionButton = ({ label, onClick, icon, variant }: ActionButtonProps) => {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] transition-all duration-300";
  const variants = {
    primary:
      "bg-primary text-black shadow-[0_0_25px_rgba(0,255,65,0.35)] hover:translate-y-[-2px] hover:shadow-[0_0_40px_rgba(0,255,65,0.6)]",
    secondary:
      "border border-secondary text-secondary/90 hover:border-secondary hover:text-secondary hover:shadow-[0_0_30px_rgba(188,19,254,0.35)]",
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
};

const Hero = () => {
  const { data: session, status } = useSession();
  const [whatTodo, setWhatTodo] = React.useState("");

  function handleJoinClick() {
    if (status === "unauthenticated") {
      return alert("Please Signin to join a room.");
    }
    setWhatTodo("join");
  }

  function handleCreateClick() {
    if (status === "unauthenticated") {
      return alert("Please Signin to create a room.");
    }
    setWhatTodo("create");
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl flex-col justify-center gap-12 px-6 pb-16 pt-12 lg:flex-row lg:items-center">
      <div className="flex flex-1 flex-col gap-8">
        <div className="inline-flex w-fit items-center gap-3 rounded-sm border border-white/10 bg-black/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#78dffb]">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,65,0.6)]" />
          System status: online
        </div>

        <div className="space-y-6">
          <h1 className="font-display text-5xl uppercase leading-[0.9] tracking-[0.1em] text-white md:text-7xl">
            Code <span className="text-primary">Wars</span>
          </h1>
          <p className="max-w-xl text-base text-[#d7c4d0] md:text-lg">
            A competitive arena for modern developers. Enter real-time duels,
            climb the global ladder, and optimize your logic under pressure.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-[#bfa3b0] md:grid-cols-3">
          {[
            "Live matchmaking",
            "Ranked seasonal ladder",
            "Code-first spectator mode",
          ].map((item) => (
            <div
              key={item}
              className="rounded-sm border border-white/10 bg-black/40 px-4 py-3"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <ActionButton
            label="Join room"
            icon={<RxExit />}
            onClick={handleJoinClick}
            variant="primary"
          />
          <ActionButton
            label="Create room"
            icon={<VscDiffAdded />}
            onClick={handleCreateClick}
            variant="secondary"
          />
        </div>

        <div className="glass-panel scanline grid gap-4 rounded-sm p-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#78dffb]">
              Arena telemetry
            </p>
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#9cff93]">
              synced
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Active rooms", value: "128" },
              { label: "Avg latency", value: "28ms" },
              { label: "Queue time", value: "00:12" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-sm border border-white/10 bg-black/30 px-4 py-3"
              >
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#bfa3b0]">
                  {stat.label}
                </p>
                <p className="font-display text-2xl text-white">{stat.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#bfa3b0]">
            {session?.user
              ? `Signed in as ${session.user.name ?? "player"}.`
              : "Sign in to unlock ranked matchmaking and private arenas."}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-1 justify-center lg:justify-end">
        <RoomStatus whatTodo={whatTodo} />
      </div>
    </section>
  );
};

export default Hero;
