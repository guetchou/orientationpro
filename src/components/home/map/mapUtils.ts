
import mapboxgl from 'mapbox-gl';
import { Establishment } from '@/types/establishments';

// Sample data for development purposes
const sampleEstablishments: Establishment[] = [
  {
    id: "1",
    name: "Université Marien Ngouabi",
    type: "university",
    city: "Brazzaville",
    address: "Avenue Marien Ngouabi",
    coordinates: { lat: -4.2626, lng: 15.2496 },
    description: "La plus grande université publique du Congo",
    programs: ["Sciences", "Médecine", "Droit", "Lettres"],
    website: "https://www.umng.cg"
  },
  {
    id: "2",
    name: "École Nationale Supérieure",
    type: "vocational",
    city: "Brazzaville",
    address: "Centre-ville",
    coordinates: { lat: -4.2780, lng: 15.2637 },
    description: "École spécialisée en formation technique et professionnelle",
    neighborhood: "Centre-ville"
  },
  {
    id: "3",
    name: "Lycée Savorgnan de Brazza",
    type: "highschool",
    city: "Brazzaville",
    address: "Plateau des 15 ans",
    coordinates: { lat: -4.2733, lng: 15.2472 },
    description: "Un des plus anciens lycées de Brazzaville",
    neighborhood: "Plateau"
  }
];

export const fetchEstablishments = (): Establishment[] => {
  // This would normally be an API call
  return sampleEstablishments;
};

export const initializeMap = (
  container: HTMLElement,
  center: [number, number],
  zoom: number
) => {
  // Initialize mapboxgl with access token
  if (!mapboxgl.accessToken) {
    mapboxgl.accessToken = 'pk.sample.token'; // Replace with your actual token in production
  }

  const map = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/streets-v11',
    center,
    zoom
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  return map;
};

export const addEstablishmentsToMap = (map: any, establishments: Establishment[]) => {
  const markers: any = {};

  establishments.forEach((est) => {
    const marker = new mapboxgl.Marker()
      .setLngLat([est.coordinates.lng, est.coordinates.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h3>${est.name}</h3>
          <p>${est.address}, ${est.city}</p>
          <p>${est.type}</p>`
        )
      )
      .addTo(map);

    markers[est.id] = marker;
  });

  return markers;
};

export const flyToEstablishment = (map: any, establishment: Establishment) => {
  map.flyTo({
    center: [establishment.coordinates.lng, establishment.coordinates.lat],
    zoom: 15,
    essential: true
  });
};
