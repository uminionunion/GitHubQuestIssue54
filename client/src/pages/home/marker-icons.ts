/*
  File: /client/src/pages/home/marker-icons.ts
  Folder: /client/src/pages/home

  Purpose:
  This file is responsible for creating and providing custom map marker icons for the Leaflet map.
  It defines functions that return different `L.Icon` instances based on the type of data being displayed
  (e.g., a green icon for a food pantry, a gold one for a candidate). This centralizes the icon logic,
  making it easy to manage marker appearance across the application.

  Connections:
  - `leaflet`: Imports the core Leaflet library to create `L.Icon` instances.
  - `./types`: Imports `Pantry`, `Politician`, `Candidate` type definitions to determine which icon to use.
  - `client/src/pages/home/map.tsx`: This is the primary consumer of this file. The `PantryMap` component imports and uses `getIconForPantry`, `getIconForPolitician`, etc., to set the icon for each marker.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - This is a client-side utility module. In a traditional stack, this logic would be part of the main JavaScript file that handles the map. It would contain functions that return different icon image URLs or configuration objects based on the data type.
*/
import L from 'leaflet';
import { Pantry, PantryType, Politician, Candidate } from './types';

const createIcon = (color: string, shape: string = 'default') => {
    // Using a simple trick for shape: different icon URLs.
    // For a real app, you'd use custom SVG icons.
    // These URLs point to different colored markers from a public repo.
    // The shape is simulated by using different marker sets if available, but here we just vary color.
    // A better approach would be L.divIcon with custom HTML/SVG.
    
    // For simplicity, we'll use different colors for now.
    // Shape differentiation is complex without custom SVG assets.
    // Let's map types to colors.
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const iconColors = ['red', 'orange', 'yellow', 'violet', 'grey', 'gold', 'blue', 'purple'];

const pantryTypeColors: Record<PantryType, string> = {
    food: 'green',
    clothing: 'blue',
    resource: 'purple', // light-purple is not a standard color name in the marker set
    library: 'black',
};

const typeIcons: Record<PantryType, L.Icon> = {
    food: createIcon(pantryTypeColors.food),
    clothing: createIcon(pantryTypeColors.clothing),
    resource: createIcon(pantryTypeColors.resource),
    library: createIcon(pantryTypeColors.library),
};

export const getIconForPantry = (pantry: Pantry): L.Icon => {
    return typeIcons[pantry.type] || createIcon('blue'); // Default to blue
};

const coloredIcons: Record<string, L.Icon> = iconColors.reduce((acc, color) => {
    acc[color] = createIcon(color);
    return acc;
}, {});

export const getRandomIcon = (type: PantryType): L.Icon => {
    const availableColors = iconColors.filter(c => c !== pantryTypeColors[type]);
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const randomColor = availableColors[randomIndex];
    return coloredIcons[randomColor];
};

const politicianIcons = {
    'House': createIcon('grey'),
    'Senate': createIcon('black'),
};

export const getIconForPolitician = (politician: Politician): L.Icon => {
    return politician.office === 'House' ? politicianIcons.House : politicianIcons.Senate;
};

const candidateIcon = createIcon('gold');

export const getIconForCandidate = (candidate: Candidate): L.Icon => {
    return candidateIcon;
};
/*
  Connections Summary:
  - This file is imported and used by `client/src/pages/home/map.tsx` to get map marker icons.
*/
