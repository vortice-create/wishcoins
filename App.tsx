import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import Map from './components/Map';
import MagicModal from './components/MagicModal';
import { subscribeToWishes } from './services/wishService';
import { Wish, LatLng } from './types';

const App: React.FC = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLng | undefined>(undefined);
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const loadMaps = () => {
      // Check if already loaded globally
      if (window.google && window.google.maps) {
        setIsMapsLoaded(true);
        return;
      }

      // Check for existing script to prevent double loading
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => setIsMapsLoaded(true));
        return;
      }

      // Use the provided Google Maps API Key
      const apiKey = "AIzaSyC7vJSqW-HsAhTjIr3tGwRAyFvry9c153A";
      
      if (!apiKey) {
        setMapError("API Key is missing. Cannot load map.");
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapsLoaded(true);
      script.onerror = () => setMapError("Failed to load Google Maps API.");
      document.head.appendChild(script);
    };

    loadMaps();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToWishes((updatedWishes) => {
      setWishes(updatedWishes);
    });
    return () => unsubscribe();
  }, []);

  const handleModalSuccess = (coords: LatLng) => {
    setMapCenter(coords);
  };

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-100 text-stone-600 p-8 text-center font-serif">
        <div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p>{mapError}</p>
        </div>
      </div>
    );
  }

  if (!isMapsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-stone-100 text-gold-500">
        <Loader2 className="animate-spin mb-4" size={48} />
        <span className="font-serif text-lg text-stone-600">Summoning Map...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-100">
      
      {/* 1. The Map Layer */}
      <div className="absolute inset-0 z-0">
        <Map 
          wishes={wishes} 
          onMarkerClick={setSelectedWish} 
          center={mapCenter}
        />
      </div>

      {/* 2. Top Header (Floating) */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-full shadow-lg pointer-events-auto border border-white/50">
          <h1 className="font-serif text-xl md:text-2xl text-stone-900 tracking-tight">
            Spirit + Soul <span className="text-gold-500 italic">Magic Map</span>
          </h1>
        </div>
      </div>

      {/* 3. Bottom CTA (Floating) */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <button
          onClick={() => setIsModalOpen(true)}
          className="pointer-events-auto bg-white text-stone-900 font-serif text-lg px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 border border-gold-100 group"
        >
          <span className="text-gold-500 group-hover:rotate-90 transition-transform duration-500">
            <Plus size={24} />
          </span>
          I Found Magic
        </button>
      </div>

      {/* 4. Magic Modal (Add Coin) */}
      <MagicModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* 5. Wish Detail Modal (View Coin) */}
      {selectedWish && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-0 pointer-events-none">
          <div 
            className="pointer-events-auto absolute inset-0 bg-black/20 backdrop-blur-[2px]" 
            onClick={() => setSelectedWish(null)} 
          />
          
          <div className="pointer-events-auto relative w-full max-w-sm bg-white rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
            <button 
              onClick={() => setSelectedWish(null)}
              className="absolute top-4 right-4 bg-black/20 text-white rounded-full p-1 hover:bg-black/40 transition-colors z-20"
            >
              <X size={20} />
            </button>

            {/* Hero Image */}
            <div className="h-48 md:h-56 bg-stone-200 overflow-hidden relative">
              {selectedWish.photoUrl ? (
                <img 
                  src={selectedWish.photoUrl} 
                  alt="Wish Coin" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gold-100 text-gold-400">
                  <span className="font-serif italic">No photo available</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Found At</p>
                <p className="font-serif text-lg">{selectedWish.locationName}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="mb-4">
                <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">
                  The Wish
                </span>
                <p className="font-serif text-xl text-stone-800 mt-2 leading-relaxed italic">
                  "{selectedWish.message}"
                </p>
              </div>
              
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center text-stone-400 text-sm">
                <span>{new Date(selectedWish.timestamp).toLocaleDateString()}</span>
                <span>Coin #{selectedWish.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;