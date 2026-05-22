'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, User, ShieldCheck, Globe, Calendar, Info, Plane } from 'lucide-react';

import { use } from 'react';

export default function PassengerDetailsPage({ params: paramsPromise }: { params: Promise<{ flightId: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { selectedFlight, selectedSeat, passengerData, setPassengerData, setCurrentStep } = useFlightStore();

  const [formData, setFormData] = useState(passengerData || {
    full_name: '',
    passport_no: '',
    nationality: '',
    dob: '',
  });

  // Effect to handle redirection if data is missing
  useEffect(() => {
    if (!selectedFlight || !selectedSeat) {
      router.push('/search');
    }
  }, [selectedFlight, selectedSeat, router]);

  if (!selectedFlight || !selectedSeat) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassengerData(formData);
    setCurrentStep(3); // Step 3: Confirmation
    router.push(`/book/${params.flightId}/confirm`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 pt-6">
      {/* Navigation & Progress */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="rounded-xl font-bold text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Seat Selection
        </Button>
        <div className="flex items-center gap-6 px-8 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">1</div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Seat</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">2</div>
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest underline underline-offset-8 decoration-blue-500 decoration-2">Passenger Info</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">3</div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Confirmation</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-4">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 sm:p-12 rounded-[40px] shadow-2xl shadow-blue-900/[0.03] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
            
            <div className="space-y-2 mb-10">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Passenger Details</h1>
              <p className="text-slate-500 font-medium text-lg">Enter your official identification information as shown on your passport.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 gap-8">
                <div className="relative group">
                  <div className="absolute left-4 top-11 transition-colors group-focus-within:text-blue-600">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    label="Full Name (As on Passport)"
                    placeholder="e.g. JOHN MICHAEL DOE"
                    className="pl-12 h-14 rounded-2xl border-slate-200"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative group">
                    <div className="absolute left-4 top-11 transition-colors group-focus-within:text-blue-600">
                      <ShieldCheck className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                      label="Passport Number"
                      placeholder="e.g. A12345678"
                      className="pl-12 h-14 rounded-2xl border-slate-200"
                      value={formData.passport_no}
                      onChange={(e) => setFormData({ ...formData, passport_no: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-11 transition-colors group-focus-within:text-blue-600">
                      <Globe className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                      label="Nationality"
                      placeholder="e.g. UNITED STATES"
                      className="pl-12 h-14 rounded-2xl border-slate-200"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-11 transition-colors group-focus-within:text-blue-600">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    label="Date of Birth"
                    type="date"
                    className="pl-12 h-14 rounded-2xl border-slate-200"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
                <Info className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                  Important: Ensure all details are correct. Inaccurate information may result in boarding denial or additional fees during check-in.
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full h-16 rounded-[20px] text-xl font-black shadow-xl shadow-blue-200 active:scale-[0.98] transition-all group">
                Review & Confirm Booking
                <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-blue-900/[0.02] border border-slate-100 space-y-8 sticky top-24">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Trip Summary</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Plane className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Flight</p>
                  <p className="text-lg font-black text-slate-900">{selectedFlight.flight_no}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Origin</span>
                  <span className="text-slate-900">{selectedFlight.origin}</span>
                </div>
                <div className="w-full h-px bg-slate-100 relative">
                  <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 rotate-90 bg-white" />
                </div>
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Destination</span>
                  <span className="text-slate-900">{selectedFlight.destination}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Selected Seat</p>
                     <p className="text-lg font-black text-slate-900">{selectedSeat.seat_number}</p>
                  </div>
                  <div className="bg-blue-50 px-3 py-1 rounded-full">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedSeat.class}</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Total</span>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 mb-1">USD</p>
                    <p className="text-4xl font-black text-blue-600 tracking-tighter">
                      ${Number(selectedFlight.base_price) + Number(selectedSeat.extra_fee)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
