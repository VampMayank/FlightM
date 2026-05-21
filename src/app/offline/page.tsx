'use client';

import { WifiOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      <div className="bg-gray-100 p-6 rounded-full">
        <WifiOff className="h-12 w-12 text-gray-400" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900">You are offline</h1>
        <p className="text-gray-500 max-w-sm">
          It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
