import { VscDiffAdded } from "react-icons/vsc";
import { RxExit } from "react-icons/rx";
import React from "react";
import { RoomStatus } from "../RoomStatus";
const NeuButton = (props: { onClick: () => void }) => {
  return (
    <button onClick={props.onClick} className="h-17 w-52 gap-2 font-bold bg-[#9cff92] text-neutral-950 font-[Space] uppercase flex items-center justify-center text-center text-lg  transition-all shadow-[3px_3px_0px_#00e038] hover:shadow-none hover:translate-x-0.75 hover:translate-y-0.75">
      <RxExit></RxExit>
      <h1>JOIN_ROOM</h1>
    </button>
  );
};
const NeuButton2 = (props: { onClick: () => void }) => {
  return (
    <button onClick={props.onClick} className="h-18 w-52 flex items-center gap-2 justify-center-safe text-[#d375fe] font-[Space] uppercase text-lg font-bold  border-4 border-[#d375fe] transition-all transition-ease-in-out hover:scale-105">
      <VscDiffAdded />
      <h1>CREATE_ROOM</h1>
    </button>
  );
};
const Hero = () => {
  const [whatTodo, setWhatTodo] = React.useState("");
  return (
    <div className="absolute bg-background h-screen w-screen">
      <section className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* join/create section */}
          <div className=" mt-40 space-y-8">
            <div className="inline-block px-3 py-1 bg-tertiary/10 text-tertiary font-[Space] font-bold text-sm tracking-widest border border-tertiary/30">
              SYSTEM_STATUS: ONLINE
            </div>
            <h2 className="text-6xl md:text-8xl font-[Space] font-bold text-white leading-[0.9] text-on-surface tracking-tighter">
              CODE <br />
              <span className="text-[#9cff93]">STRIKE</span>
            </h2>
            <p className="text-on-surface-variant text-[#bfa3b0] font-[Space] text-lg max-w-md">
              The ultimate competitive arena for the modern developer. Duel in
              real-time, climb the global ladder, and optimize your logic.
            </p>
            <p className="text-sm uppercase tracking-widest text-[#9cff93] font-[Space]">
              
            </p>
            <div className="flex gap-6">
              <NeuButton onClick={() => setWhatTodo("join")} />
              <NeuButton2 onClick={() => setWhatTodo("create")} />
            </div>
          </div>
          {/* lobby section */}
          <RoomStatus whatTodo={whatTodo} />
        </div>
      </section>
    </div>
  );
};

export default Hero;
