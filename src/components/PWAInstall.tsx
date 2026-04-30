"use client";

import { useState, useEffect } from "react";

// Define BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstall() {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register the service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("/sw.js")
          .then(
            function (registration) {
              console.log(
                "ServiceWorker registration successful with scope: ",
                registration.scope
              );
            },
            function (err) {
              console.log("ServiceWorker registration failed: ", err);
            }
          );
      });
    }

    // Check if app is already installed
    const checkAppInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        // App is running in standalone mode (installed)
        setIsInstalled(true);
      }
    };
    
    checkAppInstalled();

    // Add PWA install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install button
      setShowInstallButton(true);
    });

    // Hide the button when the app is installed
    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false);
      setIsInstalled(true);
      console.log('PWA was installed');
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }
    
    // Show the prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  // Return null if the app is already installed or can't be installed yet
  if (isInstalled || !showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 mx-auto w-max z-50">
      <button 
        onClick={handleInstall}
        className="bg-black text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v8"/>
          <path d="m16 6-4 4-4-4"/>
          <path d="M8 15v0a5 5 0 1 0 8 0v0"/>
          <path d="M22 19v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/>
        </svg>
        Install App
      </button>
    </div>
  );
}
