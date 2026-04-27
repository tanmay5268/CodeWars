import React from "react";
import { MdTerminal } from "react-icons/md";
import { SlEnergy } from "react-icons/sl";
const Nav = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-neutral-950 flex justify-between items-center px-6 h-16 border-none">
      <div className="text-[#4ade80] uppercase text-2xl  flex items-center gap-3 font-[Space] font-bold">
        <MdTerminal size={26} />
        Code_Wars
      </div>
      <nav className="flex uppercase justify-around items-center-safe font-[Space] h-10 text-white     w-80 gap-4">
        <button className="font-bold text-slate-500"> SIGN IN</button>
        <button className="text-[#9cff93] font-bold border px-4 ">
          SIGN UP
        </button>
        <div className="flex text-[#78dffb] items-center-safe justify-between gap-1 font-bold ">
          <span>
            <SlEnergy size={20} />
          </span>
          <h1>1234_XP</h1>
        </div>
      </nav>
    </header>
  );
};

export default Nav;
