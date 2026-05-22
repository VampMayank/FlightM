'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Check if user has already dismissed it this session
      const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    await installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setInstallPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:w-96 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="bg-blue-600 rounded-xl p-3 shadow-lg shadow-blue-200">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 leading-tight">Install FlightM</h3>
              <p className="text-sm text-gray-500 font-medium">Add to your home screen for the best experience.</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={handleInstall} className="flex-1 font-bold rounded-xl h-12">
            Install Now
          </Button>
          <Button variant="ghost" onClick={handleDismiss} className="flex-1 font-bold rounded-xl h-12">
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
}
