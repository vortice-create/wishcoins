import React, { useEffect, useRef } from 'react';
import { Wish, LatLng } from '../types';
import { MAP_STYLES, DEFAULT_CENTER, DEFAULT_ZOOM, GOLD_COLOR } from '../constants';

declare global {
  interface Window {
    google: any;
  }
}

interface MapProps {
  wishes: Wish[];
  onMarkerClick: (wish: Wish) => void;
  center?: LatLng;
}

const Map: React.FC<MapProps> = ({ wishes, onMarkerClick, center }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    // We assume window.google is available because App.tsx gates rendering
    if (window.google && !mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        styles: MAP_STYLES,
        disableDefaultUI: true, // Minimalist look
        zoomControl: false, // Cleaner
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    }
  }, []);

  // Update Center if provided
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.panTo(center);
      mapInstanceRef.current.setZoom(15);
    }
  }, [center]);

  // Handle Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Add new markers
    wishes.forEach(wish => {
      // Create a custom SVG marker
      const svgMarker = {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: GOLD_COLOR,
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 8, // Size of the dot
      };

      const marker = new window.google.maps.Marker({
        position: { lat: wish.lat, lng: wish.lng },
        map: mapInstanceRef.current,
        icon: svgMarker,
        title: wish.message,
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener("click", () => {
        onMarkerClick(wish);
      });

      markersRef.current.push(marker);
    });
  }, [wishes, onMarkerClick]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default Map;