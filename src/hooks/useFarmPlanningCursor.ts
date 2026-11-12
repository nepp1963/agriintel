import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function useFarmPlanningCursor(isActive: boolean = true) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();

    if (isActive) {
      container.style.cursor = 'crosshair';
    } else {
      container.style.cursor = '';
    }

    return () => {
      container.style.cursor = '';
    };
  }, [map, isActive]);
}
