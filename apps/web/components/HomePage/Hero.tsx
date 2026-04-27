const Hero = () => {
  return (
    <div className="absolute bg-background h-screen w-screen">
      <section className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* join/create section */}
          <div className=" mt-50 space-y-8">
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
          </div>
          {/* lobby section */}
        </div>
      </section>
    </div>
  );
};

export default Hero;
