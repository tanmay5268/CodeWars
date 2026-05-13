import React from "react";

const Card: React.FC = () => {
  return (
    <div className="z-50 fixed top-4 right-4">
      <div className="relative flex h-fit w-80 items-center justify-center bg-[#fff0d1] transition-all duration-300 before:absolute  before:-z-10 before:h-full before:w-full before:bg-[#ffb700] before:p-1 before:transition-all before:duration-300 hover:before:ml-6.25 hover:before:mt-6.25">
      <div className="flex w-full flex-col gap-0.75 px-4.5 py-3.75">
        <p className="text-base font-extrabold">
          Privacy Policy is currently undefined.
        </p>
        <button
          className="absolute right-2 top-2 flex h-7.5 w-7.5 items-center justify-center border-none bg-transparent transition-colors hover:bg-[#eadaba]"
          aria-label="Close"
        >
          <svg
            fill="none"
            viewBox="0 0 15 15"
            height={15}
            width={15}
          >
            <path
              strokeLinecap="round"
              strokeWidth={2}
              stroke="black"
              d="M1 14L14 1"
            />
            <path
              strokeLinecap="round"
              strokeWidth={2}
              stroke="black"
              d="M1 1L14 14"
            />
          </svg>
        </button>
      </div>
    </div>
    </div>
  );
};

export default Card;
