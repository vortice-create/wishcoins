import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, X, Loader2, Sparkles } from 'lucide-react';
import { addNewWish } from '../services/wishService';
import { LatLng } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

interface MagicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (coords: LatLng) => void;
}

const MagicModal: React.FC<MagicModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isOpen && window.google && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        fields: ["geometry", "name"],
        types: ["establishment", "geocode"]
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          setCoords({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
          setLocationName(place.name || "Unknown Location");
        }
      });
    }
  }, [isOpen]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationName("Current Location");
        
        // Reverse geocode could go here to get a prettier name
        if (addressInputRef.current) {
          addressInputRef.current.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location", error);
        setIsLocating(false);
        alert("Could not get your location. Please enter it manually.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) {
      alert("Please select a location!");
      return;
    }

    setStep('submitting');
    
    await addNewWish(
      {
        message,
        locationName,
        lat: coords.lat,
        lng: coords.lng,
      },
      photo || undefined
    );

    setStep('success');
    
    // Close after a brief success message
    setTimeout(() => {
      onSuccess(coords); // Pass coords back to center map
      resetForm();
      onClose();
    }, 2000);
  };

  const resetForm = () => {
    setStep('form');
    setPhoto(null);
    setMessage('');
    setLocationName('');
    setCoords(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-float">
        
        {/* Decorative Gold Bar */}
        <div className="h-2 w-full bg-gold-500" />

        <div className="p-8">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-serif text-2xl text-stone-800">Share the Magic</h2>
                <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600">
                  <X size={24} />
                </button>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Photo of the Coin
                </label>
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`
                    border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300
                    ${photo ? 'border-gold-500 bg-gold-50' : 'border-stone-300 hover:border-gold-400'}
                  `}>
                    {photo ? (
                      <div className="flex items-center justify-center text-gold-600 font-medium">
                        <Sparkles size={18} className="mr-2" />
                        {photo.name}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-stone-400">
                        <Camera size={24} className="mb-2" />
                        <span className="text-sm">Tap to upload photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Where did you find it?
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-stone-400" size={18} />
                  <input
                    ref={addressInputRef}
                    type="text"
                    placeholder="Search places..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="text-xs text-gold-600 hover:text-gold-500 font-bold flex items-center"
                >
                  {isLocating ? <Loader2 size={12} className="animate-spin mr-1"/> : <MapPin size={12} className="mr-1" />}
                  USE CURRENT LOCATION
                </button>
              </div>

              {/* Wish */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Your Wish
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What is your wish for the next holder?"
                  className="w-full p-3 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all h-24 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-stone-900 text-gold-400 py-4 rounded-lg font-serif text-lg tracking-wide hover:bg-black transition-colors flex items-center justify-center gap-2 group"
              >
                Place on Map
                <Sparkles size={18} className="transition-transform group-hover:scale-125" />
              </button>
            </form>
          )}

          {step === 'submitting' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 size={48} className="text-gold-500 animate-spin mb-4" />
              <h3 className="font-serif text-xl text-stone-800">Releasing your wish...</h3>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mb-4 text-gold-600">
                <Sparkles size={32} />
              </div>
              <h3 className="font-serif text-2xl text-stone-800 mb-2">Magic Found!</h3>
              <p className="text-stone-500">Your coin has been added to the trail.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagicModal;