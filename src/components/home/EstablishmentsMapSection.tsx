import { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Search, School2, Building2, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Neighborhood {
  id: string;
  name: string;
  city: string;
  description: string | null;
  type: 'university' | 'school' | 'institute' | null;
  coordinates: [number, number] | null;
  created_at: string | null;
  updated_at: string | null;
}

export const EstablishmentsMapSection = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const { toast } = useToast();
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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
          toast({
            title: "Erreur",
            description: "Impossible de charger les établissements",
            variant: "destructive",
          });
          return;
        }

        console.log("Neighborhoods fetched:", data);
        setNeighborhoods(data || []);
      } catch (error) {
        console.error("Error in fetchNeighborhoods:", error);
      }
    };

    fetchNeighborhoods();
  }, [toast]);

  useEffect(() => {
    if (!mapContainer.current) return;

    console.log("Initializing map...");
    
    // Congo coordinates (centered on Brazzaville)
    const center: LngLatLike = [15.2832, -4.2699];

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

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each neighborhood
    neighborhoods.forEach((neighborhood) => {
      const coordinates: LngLatLike = neighborhood.coordinates || [15.2832, -4.2699];
      
      // Create custom marker element
      const markerEl = document.createElement("div");
      markerEl.className = "custom-marker";
      markerEl.innerHTML = `
        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white transform hover:scale-110 transition-transform">
          ${getMarkerIcon(neighborhood.type)}
        </div>
      `;

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <h3 class="font-semibold text-lg">${neighborhood.name}</h3>
          <p class="text-sm text-gray-600">${neighborhood.city}</p>
          <p class="text-sm mt-2">${neighborhood.description}</p>
        </div>`
      );

      // Add marker to map
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
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
    } else if (city === "all") {
      // Show all Congo
      map.current.flyTo({
        center: [15.2832, -4.2699],
        zoom: 6,
        essential: true
      });
    }
  };

  const getMarkerIcon = (type?: string) => {
    switch (type) {
      case 'university':
        return '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor"/></svg>';
      case 'school':
        return '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      default:
        return '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    }
  };

  const filteredNeighborhoods = neighborhoods.filter((n) => {
    const matchesCity = selectedCity === "all" || n.city === selectedCity;
    const matchesType = selectedType === "all" || n.type === selectedType;
    const matchesSearch = n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         n.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCity && matchesType && matchesSearch;
  });

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

        <div className="mb-8 grid md:grid-cols-3 gap-4">
          <div>
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

          <div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type d'établissement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="university">Universités</SelectItem>
                <SelectItem value="school">Écoles</SelectItem>
                <SelectItem value="institute">Instituts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Rechercher un établissement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden shadow-lg mb-8">
          <div ref={mapContainer} className="w-full h-[600px]" />
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {filteredNeighborhoods.map((neighborhood) => (
            <div
              key={neighborhood.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start">
                {neighborhood.type === 'university' && <GraduationCap className="w-5 h-5 text-primary mt-1 mr-2" />}
                {neighborhood.type === 'school' && <School2 className="w-5 h-5 text-primary mt-1 mr-2" />}
                {neighborhood.type === 'institute' && <Building2 className="w-5 h-5 text-primary mt-1 mr-2" />}
                {!neighborhood.type && <MapPin className="w-5 h-5 text-primary mt-1 mr-2" />}
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {neighborhood.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">{neighborhood.city}</p>
                  <p className="text-gray-500 text-sm">
                    {neighborhood.description}
                  </p>
                  <Button variant="link" className="mt-2 p-0 h-auto">
                    En savoir plus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
