
import { Pantry } from './types';

export const initialPantries: Pantry[] = [
  // USA
  { id: 1, name: 'LA Food Bank', address: 'Los Angeles, CA, USA', notes: 'Open M-F 9am-5pm', lat: 34.0522, lng: -118.2437, hours: 'M-F 9am-5pm' },
  { id: 2, name: 'Greater Chicago Food Depository', address: 'Chicago, IL, USA', notes: 'Check website for hours', lat: 41.8781, lng: -87.6298, hours: 'Varies' },
  { id: 3, name: 'Houston Food Bank', address: 'Houston, TX, USA', notes: 'Volunteers welcome', lat: 29.7604, lng: -95.3698, hours: 'See website' },
  { id: 4, name: 'Philabundance', address: 'Philadelphia, PA, USA', notes: 'Serving the Delaware Valley', lat: 39.9526, lng: -75.1652, hours: 'Varies' },
  { id: 5, name: 'St. Mary\'s Food Bank', address: 'Phoenix, AZ, USA', notes: 'First food bank in the US', lat: 33.4484, lng: -112.0740, hours: 'M-F 9am-4pm' },
  { id: 6, name: 'Food Bank For New York City', address: 'New York, NY, USA', notes: 'Multiple locations', lat: 40.7128, lng: -74.0060, hours: 'Varies by location' },
  { id: 7, name: 'Second Harvest of Silicon Valley', address: 'San Jose, CA, USA', notes: 'Serving Santa Clara and San Mateo counties', lat: 37.3382, lng: -121.8863, hours: 'Check website' },
  { id: 8, name: 'North Texas Food Bank', address: 'Dallas, TX, USA', notes: 'Fighting hunger in North Texas', lat: 32.7767, lng: -96.7970, hours: 'Varies' },
  { id: 9, name: 'Feeding San Diego', address: 'San Diego, CA, USA', notes: 'Healthy food for all', lat: 32.7157, lng: -117.1611, hours: 'See website' },
  { id: 10, name: 'Capital Area Food Bank', address: 'Washington, D.C., USA', notes: 'Serving the greater Washington area', lat: 38.9072, lng: -77.0369, hours: 'M-F 8am-4:30pm' },

  // Canada
  { id: 11, name: 'Daily Bread Food Bank', address: 'Toronto, ON, Canada', notes: 'Leading the fight against hunger.', lat: 43.6532, lng: -79.3832, hours: 'M-F 9am-4:30pm' },
  { id: 12, name: 'Greater Vancouver Food Bank', address: 'Vancouver, BC, Canada', notes: 'Accessible, healthy, and sustainable food for all.', lat: 49.2827, lng: -123.1207, hours: 'Check website for distribution times' },
  { id: 13, name: 'Moisson Montréal', address: 'Montreal, QC, Canada', notes: 'Largest food bank in Canada.', lat: 45.5017, lng: -73.5673, hours: 'M-F 7:30am-3:30pm' },

  // Mexico
  { id: 14, name: 'Banco de Alimentos de México', address: 'Mexico City, Mexico', notes: 'Red nacional de bancos de alimentos.', lat: 19.4326, lng: -99.1332, hours: 'Varies by location' },
  { id: 15, name: 'Alimento Para Todos', address: 'Iztapalapa, Mexico City, Mexico', notes: 'Rescatamos alimento para combatir el hambre.', lat: 19.3554, lng: -99.0622, hours: 'M-F 8am-5pm' },
];
