{/*
  File: /client/src/pages/home/map.tsx
  Folder: /client/src/pages/home

  Purpose:
  This component renders the interactive map using `react-leaflet`. It is responsible for displaying markers for pantries, politicians, and candidates.
  It receives filtered data as props and renders the appropriate markers with custom icons and popups. It also handles click events on markers to
  trigger actions in the parent component, like showing details.

  Connections:
  - `react-leaflet`: The core library for rendering the map.
  - `./types`: Imports `Pantry`, `Politician`, `Candidate` type definitions.
  - `@/components/ui/button`: Uses the `Button` component inside the popups.
  - `./marker-icons`: Imports functions to get custom icons for different marker types.
  - `client/src/pages/pantry-feature/the-food-pantry-feature.tsx`: This component is rendered by `TheFoodPantryFeature` and receives data and callbacks as props.
  - `client/src/index.css`: The `.popup-dark` class used for styling popups is defined here.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - This is a highly specialized client-side component.
  - HTML: A single `<div id="map"></div>`.
  - JS: A large JavaScript file that initializes a Leaflet or Google Maps instance on the map div. It would then iterate through data (fetched via AJAX) and create marker objects, add them to the map, and attach click listeners and popup content.
  - CSS: Styles for the map container and custom styles for the popups.
*/}
import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Pantry, Politician, Candidate } from './types';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { getIconForPantry, getRandomIcon, getIconForPolitician, getIconForCandidate } from './marker-icons';

interface PantryMapProps {
  pantries: Pantry[];
  politicians?: Politician[];
  candidates?: Candidate[];
  onViewDetails: (pantry: Pantry) => void;
  isPreview?: boolean;
}

export function PantryMap({ pantries = [], politicians = [], candidates = [], onViewDetails, isPreview = false }: PantryMapProps) {
  const mapRef = React.useRef<L.Map>(null);
  const markerRefs = React.useRef<{ [key: string]: L.Marker | null }>({});

  const handleMarkerClick = (pantry: Pantry) => {
    if (isPreview) return;
    const marker = markerRefs.current[`pantry-${pantry.id}`];
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

  const getBallotpediaUrl = (name: string) => {
    const formattedName = name.replace(/\s+/g, '_');
    return `https://ballotpedia.org/${formattedName}`;
  };

  const getSenatorMarkers = () => {
    if (!politicians) return [];
    const senators = politicians.filter(p => p.office === 'Senate');
    const markers: JSX.Element[] = [];
    senators.forEach((senator, index) => {
      // First senator marker
      markers.push(
        <Marker
          key={`politician-${senator.id}-1`}
          position={[senator.lat, senator.lng]}
          icon={getIconForPolitician(senator)}
        >
          <Popup className="popup-dark">
            <div className="p-2 space-y-1">
              <h3 className="font-bold text-base">{senator.name}</h3>
              <p className="text-sm m-0">{senator.office} for {senator.state}</p>
              <a href={getBallotpediaUrl(senator.name)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 underline">
                View on Ballotpedia
              </a>
            </div>
          </Popup>
        </Marker>
      );
      // Second senator marker with a slight offset
      markers.push(
        <Marker
          key={`politician-${senator.id}-2`}
          position={[senator.lat + 0.01, senator.lng + 0.01]}
          icon={getIconForPolitician(senator)}
        >
          <Popup className="popup-dark">
            <div className="p-2 space-y-1">
              <h3 className="font-bold text-base">{senator.name}</h3>
              <p className="text-sm m-0">{senator.office} for {senator.state}</p>
              <a href={getBallotpediaUrl(senator.name)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 underline">
                View on Ballotpedia
              </a>
            </div>
          </Popup>
        </Marker>
      );
    });
    return markers;
  };

  const getHouseMarkers = () => {
    if (!politicians) return [];
    return politicians
      .filter(p => p.office === 'House')
      .map(politician => (
        <Marker
          key={`politician-${politician.id}`}
          position={[politician.lat, politician.lng]}
          icon={getIconForPolitician(politician)}
        >
          <Popup className="popup-dark">
            <div className="p-2 space-y-1">
              <h3 className="font-bold text-base">{politician.name}</h3>
              <p className="text-sm m-0">{politician.office} for {politician.state}{politician.district ? `-${politician.district}` : ''}</p>
              <a href={getBallotpediaUrl(politician.name)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 underline">
                View on Ballotpedia
              </a>
            </div>
          </Popup>
        </Marker>
      ));
  };

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
          key={`pantry-${pantry.id}`}
          position={[pantry.lat, pantry.lng]}
          icon={getIconForPantry(pantry)}
          ref={el => { if(el) markerRefs.current[`pantry-${pantry.id}`] = el }}
          eventHandlers={{
            click: () => handleMarkerClick(pantry),
          }}
        >
          {!isPreview && (
            <Popup className="popup-dark">
              <div className="p-2">
                <h3 className="font-bold text-base mb-1">{pantry.name}</h3>
                <p className="text-sm text-muted-foreground m-0">{pantry.address}</p>
                <p className="text-sm mt-2 m-0">{pantry.notes}</p>
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => onViewDetails(pantry)}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
      {!isPreview && getHouseMarkers()}
      {!isPreview && getSenatorMarkers()}
      {!isPreview && candidates.map(candidate => (
        <Marker
          key={`candidate-${candidate.id}`}
          position={[candidate.lat, candidate.lng]}
          icon={getIconForCandidate(candidate)}
          className="golden-glow"
        >
          <Popup className="popup-dark">
            <div className="p-2 space-y-1">
              <h3 className="font-bold text-base">{candidate.name}</h3>
              <p className="text-sm m-0">Running for {candidate.office_type || candidate.office}</p>
              <p className="text-sm m-0">{candidate.state}{candidate.district ? `-${candidate.district}` : ''}</p>
              <a href="https://uminion.com" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 underline">
                Website
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
{/*
  Connections Summary:
  - line 38: import { Button } from '@/components/ui/button'; -> Connects to `client/src/components/ui/button.tsx`.
  - line 39: import { getIconForPantry, ... } from './marker-icons'; -> Connects to `client/src/pages/home/marker-icons.ts`.
  - line 173: `onClick={() => onViewDetails(pantry)}` -> Calls the `onViewDetails` function passed from `TheFoodPantryFeature`.
*/}
