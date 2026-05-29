import { useRouter } from "next/navigation";
import { MdTerminal } from "react-icons/md";
import { SlEnergy } from "react-icons/sl";
import { useSession, signOut } from "next-auth/react";

const Nav = () => {
  const router = useRouter();
  const { data: session } = useSession();

  function handleSignIn() {
    router.push("/auth");
  }

  return (
    <header className="relative z-20 w-full border-b border-white/10 bg-black/40 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-black/40">
            <MdTerminal size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-lg uppercase tracking-[0.2em] text-white">
              Code Wars
            </p>
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#78dffb]">
              arena console
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-sm border border-white/10 bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#9cff93] md:flex">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,65,0.6)]" />
            online
          </div>
          <button
            className="rounded-sm border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-[#9cff93] hover:text-[#9cff93]"
            onClick={session?.user ? () => signOut() : handleSignIn}
          >
            {session?.user ? "Sign out" : "Sign in"}
          </button>
          <div className="hidden items-center gap-2 rounded-sm border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#78dffb] md:flex">
            <SlEnergy size={14} />
            1234 XP
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Nav;
