import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
      {/* Left Header Title: AgriIntelPH Core Engine */}
      <h1 className="text-lg font-normal text-white tracking-wide flex items-center gap-0.5">
        Agr<span className="text-xl font-bold text-white">i</span>ntel<span className="text-xl font-bold text-white">PH</span> Core Engine
      </h1>

      {/* Right Header Title: AgriIntelPH */}
      <div className="text-sm font-normal text-white tracking-wide flex items-center gap-0.5">
        Agr<span className="text-base font-bold text-white">i</span>ntel<span className="text-base font-bold text-white">PH</span>
      </div>
    </header>
  );
};

export default Header;
