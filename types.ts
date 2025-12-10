export interface Wish {
  id: string;
  lat: number;
  lng: number;
  message: string;
  photoUrl?: string; // Optional: URL from Firebase Storage
  locationName: string;
  timestamp: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}