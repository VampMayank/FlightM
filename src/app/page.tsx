'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlaneTakeoff, PlaneLanding, Calendar, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFlightStore } from '@/store/useFlightStore';

export default function HomePage() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useFlightStore();
  
  const [formData, setFormData] = useState(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(formData);
    router.push('/search');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-gray-900">
          Your Next Adventure <span className="text-blue-600">Starts Here</span>
        </h1>
        <p className="text-lg text-gray-600">
          Search and book flights to over 100 destinations worldwide with the best prices guaranteed.
        </p>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">From</label>
            <div className="relative">
              <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Origin City"
                className="pl-10"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">To</label>
            <div className="relative">
              <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Destination City"
                className="pl-10"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Departure</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="date"
                className="pl-10"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Passengers</label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="number"
                  min="1"
                  max="9"
                  className="pl-10"
                  value={formData.passengers}
                  onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <Button type="submit" size="icon" className="h-10 w-12 shrink-0">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-8">
        {[
          { title: 'Best Prices', desc: 'We compare hundreds of airlines to find you the best deals.' },
          { title: 'Safe & Secure', desc: 'Your data and payments are protected with industry-standard encryption.' },
          { title: '24/7 Support', desc: 'Our team is here to help you every step of the way.' }
        ].map((feature, i) => (
          <div key={i} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
