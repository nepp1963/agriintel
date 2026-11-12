import React from 'react';
import { Polygon, Marker } from 'react-leaflet';

interface FarmBoundaryEditorProps {
  coords: { lat: number; lng: number }[];
  isEditing: boolean;
  onVertexDragEnd: (index: number, newLat: number, newLng: number) => void;
}

export const FarmBoundaryEditor: React.FC<FarmBoundaryEditorProps> = ({
  coords,
  isEditing,
  onVertexDragEnd
}) => {
  const polygonPositions = coords.map(p => [p.lat, p.lng] as [number, number]);

  return (
    <>
      <Polygon 
        positions={polygonPositions} 
        pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 3 }} 
      />

      {isEditing && coords.map((coord, index) => (
        <Marker
          key={`vertex-${index}`}
          position={[coord.lat, coord.lng]}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const pos = marker.getLatLng();
              onVertexDragEnd(index, pos.lat, pos.lng);
            },
          }}
        />
      ))}
    </>
  );
};
