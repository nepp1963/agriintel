import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface SnapToFarmButtonProps {
  farmPolygonCoords: { lat: number; lng: number }[];
}

export const SnapToFarmButton: React.FC<SnapToFarmButtonProps> = ({ farmPolygonCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Create a custom Leaflet control for the button
    const SnapControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control cursor-pointer');
        container.style.backgroundColor = 'white';
        container.style.borderRadius = '8px';
        container.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
        container.style.border = '1px solid #e2e8f0';
        container.style.overflow = 'hidden';

        const button = L.DomUtil.create('button', 'flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm transition-all', container);
        button.innerHTML = `
          <svg class="w-4 h-4 text-blue-600 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Snap to Farm
        `;
        button.title = "Snap map view to active farm boundaries";

        L.DomEvent.on(button, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          if (!farmPolygonCoords || farmPolygonCoords.length === 0) return;
          const latLngs = farmPolygonCoords.map(p => [p.lat, p.lng] as [number, number]);
          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
        });

        return container;
      }
    });

    const controlInstance = new SnapControl();
    map.addControl(controlInstance);

    return () => {
      map.removeControl(controlInstance);
    };
  }, [map, farmPolygonCoords]);

  return null;
};
