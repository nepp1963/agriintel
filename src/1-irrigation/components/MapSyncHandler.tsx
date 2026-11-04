import { useMapEvents } from 'react-leaflet';
import { useLocation } from '../../context/LocationContext';

export function MapSyncHandler() {
  const { updateFromCoords, setZoom } = useLocation();

  useMapEvents({
    click(e) {
      updateFromCoords(e.latlng.lat, e.latlng.lng);
    },
    zoomend(e) {
      setZoom(e.target.getZoom());
    },
    moveend(e) {
      const center = e.target.getCenter();
      // Optional: keep coords pinned to center or allow free map pan
    }
  });

  return null;
}
