import { useRouter } from "next/navigation";
import { MdTerminal } from "react-icons/md";
import { SlEnergy } from "react-icons/sl";
import { useSession,signOut } from "next-auth/react";

const Nav = () => {
  const router = useRouter();
  const { data: session ,status} = useSession();  
  function handleSignIn() {
    // Implement sign-in logic here
    router.push("/auth");
  }
  return (
    <div>
    <header className=" overflow-hidden w-full bg-neutral-950 flex justify-between items-center px-6 h-16 border-none">
      <div className="text-[#4ade80] uppercase text-2xl  flex items-center gap-3 font-[Space] font-bold">
        <MdTerminal size={26} />
        Code_wars
      </div>
      <nav className="flex uppercase max-sm:justify-end justify-center items-center font-[Space] h-10 text-white w-80 gap-7">
        {!session?.user ?<button className="font-bold border-2 hover:rounded-none rounded-lg px-2 py-1 hover:scale-105 transition-all ease-in-out duration-300 hover:text-[#9cff93] text-slate-500" onClick={handleSignIn}>
          SIGN IN
        </button> : <button className="font-bold border-2  hover:rounded-none max-sm:px-1 max-sm:py-0.5  rounded-lg px-2 py-1 hover:scale-105 transition-all ease-in-out duration-300 hover:text-[#9cff93] text-slate-500" onClick={() => signOut()}>
          SIGN OUT
        </button> }
        
        <div className="flex max-sm:hidden text-[#78dffb] items-center-safe justify-between gap-1 font-bold ">
          <span>
            <SlEnergy size={20} />
          </span>
          <h1>1234_XP</h1>
        </div>
      </nav>
    </header>
    </div>
  );
};

export default Nav;
