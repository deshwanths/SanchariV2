
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindow,
} from "@react-google-maps/api";
import { Skeleton } from "./ui/skeleton";
import type { GeneratePersonalizedItineraryOutput } from "@/ai/flows/generate-personalized-itinerary";
import { ExternalLink } from "lucide-react";


type ItineraryLocation = GeneratePersonalizedItineraryOutput["locations"][0];

const containerStyle = {
  width: "100%",
  height: "100%",
};

const indiaCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

type MapDisplayProps = {
  locations: ItineraryLocation[];
};

export function MapDisplay({ locations }: MapDisplayProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<ItineraryLocation | null>(null);

  useEffect(() => {
    if (map && locations.length > 0 && isLoaded) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach(loc => {
        bounds.extend(new window.google.maps.LatLng(loc.lat, loc.lng));
      });
      map.fitBounds(bounds, 100);
    } else if (map) {
      map.panTo(indiaCenter);
      map.setZoom(5);
    }
  }, [map, locations, isLoaded]);

  const locationToMarkerIndex = useMemo(() => {
      const dailyCounters: {[key: number]: number} = {};
      return locations.map(location => {
          if (dailyCounters[location.day] === undefined) {
              dailyCounters[location.day] = 0;
          }
          dailyCounters[location.day]++;
          return `${location.day}.${dailyCounters[location.day]}`;
      });
  }, [locations]);

  return (
    <div className="h-full w-full relative">
        {loadError && (
        <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center z-10">
            <p className="text-destructive font-semibold text-lg drop-shadow-md">
            Error loading map. Please check the API key.
            </p>
        </div>
        )}

        {isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={indiaCenter}
            zoom={5}
            onLoad={setMap}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              styles: [
                  {
                      "featureType": "poi",
                      "stylers": [
                          { "visibility": "off" }
                      ]
                  },
                   {
                      "featureType": "transit",
                      "stylers": [
                          { "visibility": "off" }
                      ]
                  },
                   {
                      "featureType": "road",
                      "elementType": "labels.icon",
                      "stylers": [
                          { "visibility": "off" }
                      ]
                   }
              ]
            }}
        >
            {locations.map((location, index) => (
            <MarkerF
                key={`${location.day}-${location.name}-${index}`}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => setSelectedLocation(location)}
                label={{
                  text: locationToMarkerIndex[index],
                  color: 'white',
                  fontWeight: 'bold',
                }}
            />
            ))}

            {selectedLocation && (
            <InfoWindow
                position={{
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
                }}
                onCloseClick={() => setSelectedLocation(null)}
            >
                <div className="p-1 max-w-xs">
                <h3 className="font-bold text-md mb-1">
                    {selectedLocation.name}
                </h3>
                <p className="text-sm mb-2">{selectedLocation.description}</p>
                 <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs flex items-center gap-1"
                >
                    View on Google Maps <ExternalLink className="w-3 h-3"/>
                </a>
                </div>
            </InfoWindow>
            )}
        </GoogleMap>
        ) : (
        <Skeleton className="h-full w-full" />
        )}
    </div>
  );
}
