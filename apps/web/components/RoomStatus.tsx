"use client";
import { useSession } from "next-auth/react";
import Create from "./Create";
import Join from "./Join";
import type { Session } from "next-auth";
interface RoomStatusProps {
  whatTodo: string;
}
export const RoomStatus = (props: RoomStatusProps) => {
  const { data: session } = useSession();
  const sessionData = session as Session | null;
  return (
    <div className="glass-panel w-full max-w-xl rounded-sm border border-white/10 p-4 max-sm:max-w-full">
      <div className="flex items-center justify-between rounded-sm border border-white/10 bg-black/40 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#9cff93]">
          Streak: {sessionData?.user.stats?.CurrentStreak ?? 0}_wins
        </span>
        <div className="flex gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-tertiary" />
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
        </div>
      </div>
      <div className="scanline mt-4 max-h-[60vh] overflow-y-auto rounded-sm border border-white/10 bg-[#0a0a0a]/80 md:h-[420px] md:max-h-none md:overflow-hidden">
        {props.whatTodo === "join" && <Join />}
        {props.whatTodo === "create" && <Create />}
        {!props.whatTodo && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="font-display text-2xl text-white">Awaiting command</p>
            <p className="text-sm text-[#bfa3b0]">
              Choose join or create to open the arena console.
            </p>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-sm border border-white/10 bg-black/40 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#9cff93]">
          Current mode: {props.whatTodo || "idle"}
        </span>
        <button
          type="button"
          className="rounded-sm bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black transition-all duration-200 ease-out hover:translate-y-[-1px] hover:shadow-[0_0_20px_rgba(0,255,65,0.6)] active:translate-y-0"
        >
          Ready
        </button>
      </div>
    </div>
  );
};
