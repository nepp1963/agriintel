import { useState } from 'react';
import { CloudLightning, Compass } from 'lucide-react';
import { IrrigationDashboard } from './1-irrigation/components/IrrigationDashboard';
import BagyoTrackPH from './components/BagyoTrackPH';

export function App() {
  const [showBagyoTrack, setShowBagyoTrack] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="sticky top-0 z-[1100] bg-slate-900/95 backdrop-blur-md border-b border-emerald-900/70 px-4 py-2 flex items-center justify-between gap-3">
        <span className="text-xs font-bold tracking-wide text-emerald-400">
          AgriIntelPH
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBagyoTrack(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              !showBagyoTrack
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Irrigation &amp; Farm</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBagyoTrack(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              showBagyoTrack
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CloudLightning className="w-3.5 h-3.5" />
            <span>BagyoTrack PH</span>
          </button>
        </div>
      </div>

      {showBagyoTrack ? (
        <div className="p-3">
          <BagyoTrackPH />
        </div>
      ) : (
        <main>
          <IrrigationDashboard />
        </main>
      )}
    </div>
  );
}

export default App;