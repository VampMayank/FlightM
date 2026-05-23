'use client';

import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isTakingOff, setIsTakingOff] = useState(false);

  useEffect(() => {
    // Start animation after a very brief delay
    const timer = setTimeout(() => setIsTakingOff(true), 100);
    const finishTimer = setTimeout(onFinish, 2400);
    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[10000] bg-indigo-900 overflow-hidden flex items-center justify-center">
      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-800 to-purple-900 opacity-100" />
      
      {/* Animated Clouds / Speed Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-[20%] -left-64 w-48 h-1 bg-white/20 rounded-full transition-transform duration-[1500ms] ${isTakingOff ? 'translate-x-[200vw]' : ''}`} />
        <div className={`absolute top-[40%] -left-96 w-64 h-1 bg-white/10 rounded-full transition-transform duration-[1800ms] delay-100 ${isTakingOff ? 'translate-x-[200vw]' : ''}`} />
        <div className={`absolute top-[60%] -left-48 w-32 h-1 bg-white/20 rounded-full transition-transform duration-[1200ms] delay-200 ${isTakingOff ? 'translate-x-[200vw]' : ''}`} />
        <div className={`absolute top-[80%] -left-80 w-56 h-1 bg-white/10 rounded-full transition-transform duration-[2000ms] delay-300 ${isTakingOff ? 'translate-x-[200vw]' : ''}`} />
      </div>

      {/* Plane Container */}
      <div className={`relative transition-all duration-[2000ms] ease-in-out ${
        isTakingOff 
          ? 'translate-x-[150vw] -translate-y-[100vh] scale-[2.5] rotate-[-20deg]' 
          : 'translate-x-0 translate-y-0 scale-100 rotate-0'
      }`}>
        <div className="relative group">
          {/* Main Plane Icon */}
          <Plane className="h-24 w-24 text-white drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] fill-white" />
          
          {/* Engine Trail / Glow */}
          <div className={`absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-400 rounded-full blur-xl transition-opacity duration-1000 ${isTakingOff ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-400 rounded-full blur-md animate-pulse ${isTakingOff ? 'block' : 'hidden'}`} />
        </div>
      </div>

      {/* Brand Text */}
      <div className={`absolute bottom-20 text-center transition-all duration-700 ${isTakingOff ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
        <div className="relative">
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic">FlightM</h1>
          <div className="h-1 w-20 bg-blue-400 mx-auto rounded-full" />
        </div>
        <p className="mt-4 text-blue-200 font-bold uppercase tracking-[0.6em] text-[10px]">Pioneer Your Journey</p>
      </div>

      {/* Decorative Light Flare */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
    </div>
  );
}
