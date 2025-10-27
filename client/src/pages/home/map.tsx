
import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Pantry } from './types';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Fix for default icon path issue with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


interface PantryMapProps {
  pantries: Pantry[];
}

export function PantryMap({ pantries = [] }: PantryMapProps) {
  const navigate = useNavigate();

  const handleMarkerClick = (pantryId: number) => {
    navigate(`/pantry/${pantryId}`);
  };

  return (
    <MapContainer
      center={[39.8283, -98.5795]}
      zoom={4}
      scrollWheelZoom={true}
      className="h-full w-full rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pantries.map(pantry => (
        <Marker key={pantry.id} position={[pantry.lat, pantry.lng]}>
          <Popup>
            <div className="font-sans">
              <h3 className="font-bold text-base mb-1">{pantry.name}</h3>
              <p className="text-sm text-slate-600 m-0">{pantry.address}</p>
              <p className="text-sm text-slate-800 mt-2 m-0">{pantry.notes}</p>
              <Button size="sm" className="mt-2 w-full" onClick={() => handleMarkerClick(pantry.id)}>
                View Details
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
