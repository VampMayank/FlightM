'use client';

import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isTakingOff, setIsTakingOff] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTakingOff(true);
    }, 500);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-blue-600 to-indigo-900 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-12 bg-white rounded-full blur-xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-48 h-16 bg-white rounded-full blur-xl animate-pulse delay-700" />
        <div className="absolute bottom-1/4 left-1/3 w-40 h-14 bg-white rounded-full blur-xl animate-pulse delay-500" />
      </div>

      <div className={`relative transition-all duration-[2000ms] ease-in-out ${
        isTakingOff 
          ? 'translate-x-[150vw] -translate-y-[100vh] scale-150 rotate-[-15deg]' 
          : 'translate-x-0 translate-y-0 scale-100 rotate-0'
      }`}>
        <div className="relative">
          <Plane className="h-24 w-24 text-white drop-shadow-[0_20px_50px_rgba(255,255,255,0.3)]" />
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-400 rounded-full blur-md animate-pulse" />
        </div>
      </div>

      <div className={`mt-12 text-center transition-opacity duration-500 ${isTakingOff ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">FlightM</h1>
        <p className="text-blue-200 font-bold uppercase tracking-[0.4em] text-xs">Ready for takeoff</p>
      </div>
    </div>
  );
}
