
import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Pantry } from './types';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { getIconForPantry, getRandomIcon } from './marker-icons';

interface PantryMapProps {
  pantries: Pantry[];
  onViewDetails: (pantry: Pantry) => void;
  isPreview?: boolean;
}

export function PantryMap({ pantries = [], onViewDetails, isPreview = false }: PantryMapProps) {
  const mapRef = React.useRef<L.Map>(null);
  const markerRefs = React.useRef<{ [key: number]: L.Marker | null }>({});

  const handleMarkerClick = (pantry: Pantry) => {
    if (isPreview) return;
    const marker = markerRefs.current[pantry.id];
    if (marker) {
      marker.setIcon(getRandomIcon(pantry.type));
    }
  };

  React.useEffect(() => {
    if (mapRef.current) {
      // Invalidate size after a short delay to ensure container is sized
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, []);

  return (
    <MapContainer
      ref={mapRef}
      center={[39.8283, -98.5795]}
      zoom={isPreview ? 3 : 4}
      scrollWheelZoom={!isPreview}
      className="h-full w-full z-0"
      zoomControl={!isPreview}
      attributionControl={!isPreview}
      dragging={!isPreview}
      doubleClickZoom={!isPreview}
      touchZoom={!isPreview}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pantries.map(pantry => (
        <Marker
          key={pantry.id}
          position={[pantry.lat, pantry.lng]}
          icon={getIconForPantry(pantry)}
          ref={el => { if(el) markerRefs.current[pantry.id] = el }}
          eventHandlers={{
            click: () => handleMarkerClick(pantry),
          }}
        >
          {!isPreview && (
            <Popup>
              <div className="font-sans bg-black text-white p-2 rounded-md">
                <h3 className="font-bold text-base mb-1">{pantry.name}</h3>
                <p className="text-sm text-slate-300 m-0">{pantry.address}</p>
                <p className="text-sm text-slate-100 mt-2 m-0">{pantry.notes}</p>
                <Button
                  size="sm"
                  className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => onViewDetails(pantry)}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
