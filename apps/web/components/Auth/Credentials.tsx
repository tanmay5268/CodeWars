"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { handleCredentialsLogin } from "../../actions/socialActions";
import { useSession } from "next-auth/react";
const Credentials = () => {
    const [error,setError] = React.useState<string | null>(null);
    const router = useRouter();
  const { update } = useSession();
    async function handleCredentialsSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try{
            const formData = new FormData(event.currentTarget);
            const response = await handleCredentialsLogin(formData);
            if(response?.error){
        setError(response.error);
            }
            else{
                setError(null)
        await update();
                router.push("/");
            }
        }
        catch(e){
            setError("An error occurred during login");
        }
    }
  return (
    <form onSubmit={handleCredentialsSubmit} className="w-full flex flex-col gap-4">
        <input
          type="text"
          placeholder="Name"
          name="name"
          className="
            h-10 w-62.5
            rounded-[5px]
            border-2 border-[#323232]
            bg-white px-2.5 py-1.25
            text-[15px] font-semibold text-[#323232]
            outline-none
            shadow-[4px_4px_0px_#323232]
          "
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          className="
            h-10 w-62.5
            rounded-[5px]
            border-2 border-[#323232]
            bg-white px-2.5 py-1.25
            text-[15px] font-semibold text-[#323232]
            outline-none
            shadow-[4px_4px_0px_#323232]
          "
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          className="
            h-10 w-62.5
            rounded-[5px]
            border-2 border-[#323232]
            bg-white px-2.5 py-1.25
            text-[15px] font-semibold text-[#323232]
            outline-none
            shadow-[4px_4px_0px_#323232]
          "
        />

        {/* Continue Button */}
        <button
          name="action"
          value="credentials"
          type="submit"
          className="
            group relative z-10 flex h-10 w-62.5
            items-center justify-center gap-1.25
            overflow-hidden rounded-[5px]
            border-2 border-[#323232]
            bg-white text-[16px] font-semibold text-[#323232]
            shadow-[4px_4px_0px_#323232]
            transition-all duration-300
            before:absolute before:left-0 before:top-0
            before:-z-10 before:h-full before:w-0
            before:bg-[#212121]
            before:transition-all before:duration-300
            hover:text-[#e8e8e8]
            hover:before:w-full
          "
        >
          Continue
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="m6 17 5-5-5-5" />
            <path d="m13 17 5-5-5-5" />
          </svg>
        </button>
    </form>
  );
};

export default Credentials;
