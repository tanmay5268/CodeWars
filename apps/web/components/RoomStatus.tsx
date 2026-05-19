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
    <div className=" max-sm:hidden h-fit bg-[#29131f]  w-full mt-10 border-4 rounded-sm border-[#9cff93] relative group">
      <div className="relative bg-surface-container py-6 px-4 arcade-border aspect-square md:aspect-video flex flex-col gap-4">
        <div className="flex  justify-between bg-[#301926] items-center bg-surface-container-high p-2">
          <span className="text-sm text-[#9cff93] font-bold font-[Space] tracking-widest uppercase">
            STREAK: {sessionData?.user.stats?.CurrentStreak}_WINS
          </span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-500"></div>
            <div className="w-3 h-3 bg-tertiary"></div>
            <div className="w-3 h-3 bg-primary"></div>
          </div>
        </div>
        <div className=" flex grow w-full h-104 bg-[#0a0a0a]">
          {props.whatTodo === "join" && <Join></Join>}
          {props.whatTodo === "create" && <Create></Create>}

        </div>
        <div className="flex justify-between bg-[#301926] items-center bg-surface-container-high p-2">
          <span className="text-sm text-[#9cff93] font-bold font-[Space] tracking-widest uppercase">
            Current mode: {props.whatTodo || "idle"}
          </span>
          <button
            type="button"
            className="bg-[#9cff93] text-[#29131f] font-bold py-2 px-4 rounded-sm transition-all duration-200 ease-out hover:scale-105 active:scale-95"
          >
            Reddy
          </button>
        </div>
      </div>
    </div>
  );
};
