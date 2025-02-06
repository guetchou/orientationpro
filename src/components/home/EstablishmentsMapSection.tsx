import { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

interface Neighborhood {
  id: string;
  name: string;
  city: string;
  description: string;
}

export const EstablishmentsMapSection = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("all");

  console.log("EstablishmentsMapSection rendered");

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        console.log("Fetching neighborhoods...");
        const { data, error } = await supabase
          .from("neighborhoods")
          .select("*")
          .order("city", { ascending: true });

        if (error) {
          console.error("Error fetching neighborhoods:", error);
          return;
        }

        console.log("Neighborhoods fetched:", data);
        setNeighborhoods(data);
      } catch (error) {
        console.error("Error in fetchNeighborhoods:", error);
      }
    };

    fetchNeighborhoods();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    console.log("Initializing map...");
    
    // Congo coordinates (centered on Brazzaville)
    const center: LngLatLike = [15.2832, -4.2699];

    // Use the MAPBOX_PUBLIC_TOKEN from Supabase secrets
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2Vzc25ndWllIiwiYSI6ImNscnlwbWVzZjE2dDQya3BjOGxqZnJtbXIifQ.2pKV0_5V6KhqHPUY-rMYBw';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: center,
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    // Add markers for each neighborhood
    neighborhoods.forEach((neighborhood) => {
      // Add marker
      const marker = document.createElement("div");
      marker.className = "custom-marker";
      marker.innerHTML = `<div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
        </svg>
      </div>`;

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h3 class="font-semibold">${neighborhood.name}</h3>
         <p>${neighborhood.city}</p>
         <p class="text-sm text-gray-600">${neighborhood.description}</p>`
      );

      // Add marker to map
      new mapboxgl.Marker(marker)
        .setLngLat([15.2832, -4.2699] as LngLatLike) // You would need actual coordinates for each neighborhood
        .setPopup(popup)
        .addTo(map.current);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [neighborhoods]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (!map.current) return;

    // Update map view based on selected city
    const cityCoordinates: { [key: string]: LngLatLike } = {
      "Brazzaville": [15.2832, -4.2699],
      "Pointe-Noire": [11.8635, -4.7761],
      "Dolisie": [12.6666, -4.2],
    };

    if (cityCoordinates[city]) {
      map.current.flyTo({
        center: cityCoordinates[city],
        zoom: 12,
        essential: true
      });
    }
  };

  const uniqueCities = Array.from(new Set(neighborhoods.map(n => n.city)));

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading mb-4">
            Établissements Scolaires et Universitaires
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les établissements d'enseignement au Congo. Utilisez la carte interactive
            pour explorer les différentes régions et trouver les institutions près de chez vous.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-xs">
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {uniqueCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <div ref={mapContainer} className="w-full h-[600px]" />
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {neighborhoods
            .filter((n) => selectedCity === "all" || n.city === selectedCity)
            .map((neighborhood) => (
              <div
                key={neighborhood.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary mt-1 mr-2" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {neighborhood.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">{neighborhood.city}</p>
                    <p className="text-gray-500 text-sm">
                      {neighborhood.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};