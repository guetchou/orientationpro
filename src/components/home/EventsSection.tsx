import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EventsSection = () => {
  const events = [
    {
      title: "Salon de l'Orientation",
      date: "15 Mai 2024",
      location: "Brazzaville",
      time: "9h - 17h"
    },
    {
      title: "Forum des Métiers",
      date: "20 Mai 2024",
      location: "Pointe-Noire",
      time: "10h - 18h"
    },
    {
      title: "Conférence Carrières",
      date: "25 Mai 2024",
      location: "Brazzaville",
      time: "14h - 17h"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold text-center mb-12">
          Événements à venir
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.title} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-heading text-xl font-semibold mb-4">{event.title}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                S'inscrire
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};