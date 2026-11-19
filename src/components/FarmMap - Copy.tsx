import React from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../context/LocationContext';

// Component to listen for map clicks and update global location state
const MapClickHandler: React.FC = () => {
  const { updateFromCoords } = useLocation();

  useMapEvents({
    click(e) {
      updateFromCoords(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

interface FarmMapProps {
  center?: [number, number];
  zoom?: number;
}

export const FarmMap: React.FC<FarmMapProps> = ({ center = [15.0285, 120.6817], zoom = 11 }) => {
  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-lg border border-slate-700 relative z-0">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors & PAGASA'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
      </MapContainer>
    </div>
  );
};
