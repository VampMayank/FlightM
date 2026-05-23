'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';
import SeatMap from '@/components/booking/SeatMap';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plane, Dice5, MousePointer2, Coffee, Utensils, Wine } from 'lucide-react';
import { Seat } from '@/types/database';
import { useState, useEffect, use } from 'react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const FOOD_OPTIONS = [
  { id: 'standard', name: 'Standard Meal', price: 0, icon: Utensils, desc: 'A balanced meal with main, side and drink' },
  { id: 'premium', name: 'Premium Dining', price: 25, icon: Wine, desc: 'Gourmet 3-course meal with wine pairing' },
  { id: 'snack', name: 'Light Snack', price: 10, icon: Coffee, desc: 'Assorted snacks and premium coffee/tea' },
];

export default function SeatSelectionPage({ params: paramsPromise }: { params: Promise<{ flightId: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { 
    selectedFlight, 
    selectedReturnFlight,
    selectedSeat, 
    selectedReturnSeat,
    setSelectedSeat, 
    setSelectedReturnSeat,
    setCurrentStep, 
    seatSelectionMode, 
    setSeatSelectionMode,
    foodOption,
    setFoodOption
  } = useFlightStore();

  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [availableReturnSeats, setAvailableReturnSeats] = useState<Seat[]>([]);
  const [selectingReturnSeat, setSelectingReturnSeat] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAvailableSeats() {
      const { data } = await supabase
        .from('seats')
        .select('*')
        .eq('flight_id', params.flightId)
        .eq('is_available', true);
      if (data) setAvailableSeats(data);
    }
    fetchAvailableSeats();
  }, [params.flightId, supabase]);

  useEffect(() => {
    async function fetchReturnSeats() {
      if (selectedReturnFlight) {
        const { data } = await supabase
          .from('seats')
          .select('*')
          .eq('flight_id', selectedReturnFlight.id)
          .eq('is_available', true);
        if (data) setAvailableReturnSeats(data);
      }
    }
    fetchReturnSeats();
  }, [selectedReturnFlight, supabase]);

  if (!selectedFlight) {
    router.push('/search');
    return null;
  }

  const handleSelectSeat = (seat: Seat) => {
    if (selectingReturnSeat) {
      setSelectedReturnSeat(seat);
    } else {
      setSelectedSeat(seat);
      if (selectedReturnFlight) setSelectingReturnSeat(true);
    }
    setSeatSelectionMode('manual');
  };

  const handleRandomAssignment = () => {
    if (availableSeats.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSeats.length);
      setSelectedSeat({ ...availableSeats[randomIndex], extra_fee: 0 });
    }
    
    if (selectedReturnFlight && availableReturnSeats.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableReturnSeats.length);
      setSelectedReturnSeat({ ...availableReturnSeats[randomIndex], extra_fee: 0 });
    }
    
    setSeatSelectionMode('random');
  };

  const handleContinue = () => {
    if (selectedSeat && (!selectedReturnFlight || selectedReturnSeat)) {
      setCurrentStep(2); // Step 2: Passenger Details
      router.push(`/book/${params.flightId}/passenger`);
    }
  };

  const seatCharge = seatSelectionMode === 'manual' ? 15 : 0;
  const foodCharge = FOOD_OPTIONS.find(f => f.id === foodOption)?.price || 0;
  let totalPrice = Number(selectedFlight.base_price) + seatCharge + foodCharge;
  if (selectedReturnFlight) totalPrice += Number(selectedReturnFlight.base_price) + seatCharge;

  const currentFlightForSeat = selectingReturnSeat ? selectedReturnFlight : selectedFlight;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl font-bold">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to results
        </Button>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          <span className="text-blue-600 underline underline-offset-8 decoration-2">1. Seat & Extras</span>
          <ChevronRight className="h-4 w-4" />
          <span>2. Passenger Info</span>
          <ChevronRight className="h-4 w-4" />
          <span>3. Confirmation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Seat Selection Mode */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleRandomAssignment}
              className={cn(
                "p-6 rounded-[32px] border-2 transition-all text-left flex flex-col gap-4 group",
                seatSelectionMode === 'random' 
                  ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200" 
                  : "bg-white border-slate-100 hover:border-blue-200"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                seatSelectionMode === 'random' ? "bg-white/20" : "bg-slate-50 group-hover:bg-blue-50"
              )}>
                <Dice5 className={cn("h-6 w-6", seatSelectionMode === 'random' ? "text-white" : "text-blue-600")} />
              </div>
              <div>
                <p className="font-black text-lg">Random Assignment</p>
                <p className={cn("text-xs font-bold", seatSelectionMode === 'random' ? "text-blue-100" : "text-slate-400")}>Free • System selects best available</p>
              </div>
            </button>

            <button
              onClick={() => setSeatSelectionMode('manual')}
              className={cn(
                "p-6 rounded-[32px] border-2 transition-all text-left flex flex-col gap-4 group",
                seatSelectionMode === 'manual' 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200" 
                  : "bg-white border-slate-100 hover:border-indigo-200"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                seatSelectionMode === 'manual' ? "bg-white/20" : "bg-slate-50 group-hover:bg-indigo-50"
              )}>
                <MousePointer2 className={cn("h-6 w-6", seatSelectionMode === 'manual' ? "text-white" : "text-indigo-600")} />
              </div>
              <div>
                <p className="font-black text-lg">Select My Seat</p>
                <p className={cn("text-xs font-bold", seatSelectionMode === 'manual' ? "text-indigo-100" : "text-slate-400")}>From $15 • Choose your perfect spot</p>
              </div>
            </button>
          </div>

          {seatSelectionMode === 'manual' && currentFlightForSeat && (
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-blue-900/[0.02] space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                   {selectingReturnSeat ? 'Select Return Seat' : 'Select Outbound Seat'}
                 </h2>
                 {selectedReturnFlight && (
                   <button 
                     onClick={() => setSelectingReturnSeat(!selectingReturnSeat)}
                     className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"
                   >
                     Switch to {selectingReturnSeat ? 'Outbound' : 'Return'}
                   </button>
                 )}
              </div>
              <SeatMap 
                flightId={currentFlightForSeat.id} 
                selectedSeatId={selectingReturnSeat ? selectedReturnSeat?.id : selectedSeat?.id} 
                onSelectSeat={handleSelectSeat} 
              />
            </div>
          )}

          {/* Food Options */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-blue-900/[0.02] space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">In-flight Dining</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FOOD_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFoodOption(option.id)}
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all text-left space-y-4",
                    foodOption === option.id 
                      ? "border-blue-600 bg-blue-50/50" 
                      : "border-slate-50 bg-slate-50/30 hover:border-blue-200"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    foodOption === option.id ? "bg-blue-600 text-white" : "bg-white text-slate-400"
                  )}>
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{option.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 mb-2">{option.desc}</p>
                    <p className="text-sm font-black text-blue-600">{option.price === 0 ? 'FREE' : `+$${option.price}`}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-blue-900/[0.02] space-y-6 sticky top-24">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Flight</p>
                <p className="font-black text-slate-900">{selectedFlight.origin} → {selectedFlight.destination}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-400">Total Fares</span>
                <span className="font-black text-slate-900">${Number(selectedFlight.base_price) + (selectedReturnFlight ? Number(selectedReturnFlight.base_price) : 0)}</span>
              </div>
              {selectedSeat && (
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-400">Outbound Seat {selectedSeat.seat_number}</span>
                  <span className="font-black text-blue-600">{seatSelectionMode === 'random' ? 'FREE' : `+$15`}</span>
                </div>
              )}
              {selectedReturnSeat && (
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-400">Return Seat {selectedReturnSeat.seat_number}</span>
                  <span className="font-black text-blue-600">{seatSelectionMode === 'random' ? 'FREE' : `+$15`}</span>
                </div>
              )}
              {foodOption && (
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-400">{FOOD_OPTIONS.find(f => f.id === foodOption)?.name}</span>
                  <span className="font-black text-blue-600">{foodCharge === 0 ? 'FREE' : `+$${foodCharge}`}</span>
                </div>
              )}
              <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total</span>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">USD</p>
                   <p className="text-4xl font-black text-slate-900 tracking-tighter">${totalPrice}</p>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              disabled={!selectedSeat || (!!selectedReturnFlight && !selectedReturnSeat) || !foodOption} 
              onClick={handleContinue}
              className="w-full h-16 rounded-[24px] text-lg font-black shadow-xl shadow-blue-200"
            >
              Confirm Extras
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
