'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlaneTakeoff, PlaneLanding, Calendar, Users, Search, ArrowRightLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFlightStore } from '@/store/useFlightStore';
import { cn } from '@/lib/utils';
import SplashScreen from '@/components/SplashScreen';

const POPULAR_AIRPORTS = [
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates' },
  { code: 'LHR', city: 'London', country: 'United Kingdom' },
  { code: 'JFK', city: 'New York', country: 'USA' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore' },
  { code: 'SYD', city: 'Sydney', country: 'Australia' },
  { code: 'HND', city: 'Tokyo', country: 'Japan' },
  { code: 'CDG', city: 'Paris', country: 'France' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany' },
];

export default function HomePage() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useFlightStore();
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [showLine2, setShowLine2] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  const [formData, setFormData] = useState(searchQuery);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (!hasSeenSplash) {
      setShowSplash(true);
      document.body.style.overflow = 'hidden';
      sessionStorage.setItem('hasSeenSplash', 'true');
    } else {
      // Immediate sequence for refresh
      setTimeout(() => setShowLine2(true), 1700);
      setTimeout(() => setShowContent(true), 2700);
    }
    setIsMounted(true);

    function handleClickOutside(event: MouseEvent) {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFinishSplash = () => {
    setShowSplash(false);
    document.body.style.overflow = 'unset';
    
    // Trigger typewriter sequence
    setTimeout(() => {
      setShowLine2(true);
    }, 1700);

    // Trigger horizontal content entrance
    setTimeout(() => {
      setShowContent(true);
    }, 2700);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(formData);
    router.push('/search');
  };

  const handleSwap = () => {
    setFormData({
      ...formData,
      origin: formData.destination,
      destination: formData.origin,
    });
  };

  const filteredOriginAirports = POPULAR_AIRPORTS.filter(
    a => a.city.toLowerCase().includes(formData.origin.toLowerCase()) || 
         a.code.toLowerCase().includes(formData.origin.toLowerCase())
  );

  const filteredDestAirports = POPULAR_AIRPORTS.filter(
    a => a.city.toLowerCase().includes(formData.destination.toLowerCase()) || 
         a.code.toLowerCase().includes(formData.destination.toLowerCase())
  );

  if (!isMounted) return <div className="fixed inset-0 bg-indigo-900 z-[99999]" />;
  if (showSplash) return <SplashScreen onFinish={handleFinishSplash} />;

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12 overflow-x-hidden">
      {/* Hero Section with True Sequential Typewriter */}
      <div className="text-center space-y-4 max-w-4xl relative min-h-[160px]">
        <div className="flex flex-col items-center">
          <div className="overflow-hidden inline-block h-[60px] md:h-[80px]">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 leading-tight typewriter typewriter-line-1 mb-2">
              Your Next Adventure
            </h1>
          </div>
          <div className="overflow-hidden inline-block h-[60px] md:h-[80px]">
            {showLine2 && (
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight typewriter typewriter-line-2">
                Starts Here
              </h1>
            )}
          </div>
        </div>
        <p className={cn(
          "text-lg text-gray-600 font-medium opacity-0",
          showContent && "animate-fade-right"
        )}>
          Search and book flights to over 100 destinations worldwide with the best prices guaranteed.
        </p>
      </div>

      {/* Full Functional Search Form with Horizontal Entrance */}
      <div className={cn(
        "w-full max-w-6xl bg-white/80 backdrop-blur-2xl rounded-[40px] shadow-2xl p-2 border border-white/50 relative z-40 opacity-0",
        showContent && "animate-fade-right"
      )}>
        <div className="flex gap-4 p-4 border-b border-gray-100/50">
          <button 
            type="button"
            onClick={() => setFormData({ ...formData, tripType: 'one-way' })}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
              formData.tripType === 'one-way' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            )}
          >
            One Way
          </button>
          <button 
            type="button"
            onClick={() => setFormData({ ...formData, tripType: 'round-trip' })}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
              formData.tripType === 'round-trip' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            )}
          >
            Round Trip
          </button>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 items-stretch p-2">
          
          <div className="lg:col-span-2 grid grid-cols-[1fr_auto_1fr] items-center gap-0 bg-gray-50/50 rounded-3xl border border-gray-100/50 p-2 relative">
            <div className="relative group z-50" ref={originRef}>
              <div className="px-4 py-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">From</label>
                <div className="relative flex items-center">
                  <PlaneTakeoff className={cn("absolute left-0 h-5 w-5 transition-colors duration-300", showOriginDropdown ? "text-blue-600" : "text-gray-400")} />
                  <input
                    type="text"
                    placeholder="Origin City"
                    className="w-full bg-transparent pl-8 pr-2 h-10 font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none"
                    value={formData.origin}
                    onChange={(e) => { setFormData({ ...formData, origin: e.target.value }); setShowOriginDropdown(true); }}
                    onFocus={() => setShowOriginDropdown(true)}
                    required
                  />
                </div>
              </div>
              {showOriginDropdown && filteredOriginAirports.length > 0 && (
                <div className="absolute left-0 top-[calc(100%+12px)] w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                  <div className="max-h-60 overflow-y-auto scrollbar-hide py-2">
                    {filteredOriginAirports.map((airport) => (
                      <button key={airport.code} type="button" className="w-full px-4 py-3 flex items-center gap-4 hover:bg-blue-50 transition-colors text-left group/item" onClick={() => { setFormData({ ...formData, origin: airport.city }); setShowOriginDropdown(false); }}>
                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover/item:bg-white shadow-sm transition-colors">
                          <MapPin className="h-5 w-5 text-gray-400 group-hover/item:text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{airport.city} ({airport.code})</p>
                          <p className="text-xs text-gray-500 truncate">{airport.country}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative z-50">
              <Button type="button" variant="ghost" size="icon" onClick={handleSwap} className="h-10 w-10 rounded-full border border-gray-100 bg-white shadow-md hover:shadow-lg hover:border-blue-200 hover:text-blue-600 transition-all mx-1 shrink-0">
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative group z-50" ref={destRef}>
              <div className="px-4 py-2 text-right lg:text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">To</label>
                <div className="relative flex items-center justify-end lg:justify-start">
                  <PlaneLanding className={cn("absolute left-0 h-5 w-5 transition-colors duration-300", showDestDropdown ? "text-blue-600" : "text-gray-400")} />
                  <input
                    type="text"
                    placeholder="Destination"
                    className="w-full bg-transparent pl-8 pr-2 h-10 font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none"
                    value={formData.destination}
                    onChange={(e) => { setFormData({ ...formData, destination: e.target.value }); setShowDestDropdown(true); }}
                    onFocus={() => setShowDestDropdown(true)}
                    required
                  />
                </div>
              </div>
              {showDestDropdown && filteredDestAirports.length > 0 && (
                <div className="absolute right-0 lg:left-0 top-[calc(100%+12px)] w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                  <div className="max-h-60 overflow-y-auto scrollbar-hide py-2">
                    {filteredDestAirports.map((airport) => (
                      <button key={airport.code} type="button" className="w-full px-4 py-3 flex items-center gap-4 hover:bg-blue-50 transition-colors text-left group/item" onClick={() => { setFormData({ ...formData, destination: airport.city }); setShowDestDropdown(false); }}>
                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover/item:bg-white shadow-sm transition-colors">
                          <MapPin className="h-5 w-5 text-gray-400 group-hover/item:text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{airport.city} ({airport.code})</p>
                          <p className="text-xs text-gray-500 truncate">{airport.country}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-3xl border border-gray-100/50 p-4 flex flex-col justify-center hover:bg-white transition-all group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">Departure</label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-0 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input type="date" min={today} className="w-full bg-transparent pl-8 font-bold text-slate-900 focus:outline-none cursor-pointer" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            </div>
          </div>

          <div className={cn("bg-gray-50/50 rounded-3xl border border-gray-100/50 p-4 flex flex-col justify-center transition-all group", formData.tripType === 'round-trip' ? "opacity-100 hover:bg-white" : "opacity-30 grayscale")}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">Arrival</label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-0 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input type="date" min={today} className="w-full bg-transparent pl-8 font-bold text-slate-900 focus:outline-none cursor-pointer disabled:cursor-not-allowed" value={formData.returnDate || ''} onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })} required={formData.tripType === 'round-trip'} disabled={formData.tripType !== 'round-trip'} />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-50/50 rounded-3xl border border-gray-100/50 p-2 pl-4 hover:bg-white transition-all group">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">Travelers</label>
              <div className="relative flex items-center">
                <Users className="absolute left-0 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input type="number" min="1" max="9" className="w-full bg-transparent pl-8 font-bold text-slate-900 focus:outline-none" value={formData.passengers} onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) || 1 })} required />
              </div>
            </div>
            <Button type="submit" size="icon" className="h-16 w-16 rounded-[24px] shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600">
              <Search className="h-6 w-6 text-white" />
            </Button>
          </div>
          
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-8">
        {[
          { title: 'Best Prices', desc: 'We compare hundreds of airlines to find you the best deals.', icon: '💎' },
          { title: 'Safe & Secure', desc: 'Your data and payments are protected with industry-standard encryption.', icon: '🔒' },
          { title: '24/7 Support', desc: 'Our team is here to help you every step of the way.', icon: '💬' }
        ].map((feature, i) => (
          <div key={i} className={cn(
            "group p-8 bg-white/50 backdrop-blur-sm rounded-[32px] border border-white shadow-lg hover:shadow-xl transition-all duration-1000 hover:-translate-y-1 opacity-0",
            showContent && "animate-fade-right"
          )} style={{ animationDelay: `${i * 200 + 3100}ms` }}>
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500 inline-block">{feature.icon}</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
