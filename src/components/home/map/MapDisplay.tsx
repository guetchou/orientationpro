
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Establishment } from '@/types/establishments';
import { initializeMap, addEstablishmentsToMap, flyToEstablishment } from './mapUtils';

interface MapDisplayProps {
  establishments: Establishment[];
  selectedEstablishment: Establishment | null;
}

export function MapDisplay({ establishments, selectedEstablishment }: MapDisplayProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      // Default to Congo's coordinates
      const defaultCoordinates: [number, number] = [15.2832, -4.2634]; // Brazzaville, Congo
      const defaultZoom = 11;
      
      mapRef.current = initializeMap(mapContainerRef.current, defaultCoordinates, defaultZoom);
      
      // Add establishments when map is loaded
      mapRef.current.on('load', () => {
        markersRef.current = addEstablishmentsToMap(mapRef.current, establishments);
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Update markers when establishments change
  useEffect(() => {
    if (mapRef.current && establishments.length > 0) {
      // Clear existing markers
      Object.values(markersRef.current).forEach((marker: any) => {
        marker.remove();
      });
      
      // Add new markers
      markersRef.current = addEstablishmentsToMap(mapRef.current, establishments);
    }
  }, [establishments]);

  // Fly to selected establishment
  useEffect(() => {
    if (mapRef.current && selectedEstablishment) {
      flyToEstablishment(mapRef.current, selectedEstablishment);
    }
  }, [selectedEstablishment]);

  return (
    <Card className="h-[600px] overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
    </Card>
  );
}
