'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, User, ShieldCheck, Globe, Calendar } from 'lucide-react';

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

  if (!selectedFlight || !selectedSeat) {
    router.push('/search');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassengerData(formData);
    setCurrentStep(3); // Step 3: Confirmation
    router.push(`/book/${params.flightId}/confirm`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to seat selection
        </Button>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
          <span className="text-gray-900">1. Select Seat</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-blue-600">2. Passenger Details</span>
          <ChevronRight className="h-4 w-4" />
          <span>3. Confirmation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Passenger Information</h1>
            <p className="text-sm text-gray-500">Please enter the details exactly as they appear on your passport.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="relative">
                  <User className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    className="pl-10"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                    <Input
                      label="Passport Number"
                      placeholder="A1234567"
                      className="pl-10"
                      value={formData.passport_no}
                      onChange={(e) => setFormData({ ...formData, passport_no: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                    <Input
                      label="Nationality"
                      placeholder="United States"
                      className="pl-10"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                  <Input
                    label="Date of Birth"
                    type="date"
                    className="pl-10"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full rounded-xl">
                  Review Booking
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">Booking Summary</h3>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Flight</span>
                <span className="font-medium">{selectedFlight.flight_no}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Route</span>
                <span className="font-medium">{selectedFlight.origin} → {selectedFlight.destination}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Seat</span>
                <span className="font-medium">{selectedSeat.seat_number} ({selectedSeat.class})</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total Price</span>
                <span className="font-bold text-blue-600">${Number(selectedFlight.base_price) + Number(selectedSeat.extra_fee)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 mb-2">Flexible Booking</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              You can reschedule your flight up to 24 hours before departure. Cancellations are allowed up to 2 hours before flight time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
