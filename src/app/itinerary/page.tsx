"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { format, parse, differenceInCalendarDays } from "date-fns";

import { ItineraryDisplay } from "@/components/itinerary-display";
import { MapDisplay } from "@/components/map-display";
import { generatePersonalizedItinerary } from "@/ai/flows/generate-personalized-itinerary";
import { generateItineraryFromImage } from "@/ai/flows/generate-itinerary-from-image";
import type { GeneratePersonalizedItineraryOutput } from "@/ai/flows/generate-personalized-itinerary";
import { useToast } from "@/hooks/use-toast";

type Itinerary = GeneratePersonalizedItineraryOutput | null;
type ItineraryLocation = GeneratePersonalizedItineraryOutput["locations"][0];

function ItineraryPageContent() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [locations, setLocations] = useState<ItineraryLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const itineraryQueryData = sessionStorage.getItem('itineraryQuery');
    const storedItineraryData = sessionStorage.getItem('selectedItinerary');

    if (itineraryQueryData) {
      // This is a new itinerary generation
      setIsNew(true);
      const fetchItinerary = async (query: any) => {
        setIsLoading(true);
        try {
          let result;
          const fromDate = parse(query.startDate, "yyyy-MM-dd", new Date());
          const toDate = parse(query.endDate, "yyyy-MM-dd", new Date());
          const numberOfDays = differenceInCalendarDays(toDate, fromDate) + 1;

          if (query.photoDataUri) {
            result = await generateItineraryFromImage({
              photoDataUri: query.photoDataUri,
              languages: query.languages.join(','),
            });
          } else {
            result = await generatePersonalizedItinerary({
              travelDestination: query.destination,
              startingLocation: query.startingLocation,
              travelStyle: query.travelStyle,
              travelDates: `${format(fromDate, "PPP")} to ${format(toDate, "PPP")}`,
              interests: query.interests.join(','),
              moods: query.moods.join(','),
              languages: query.languages.join(','),
              numberOfDays: numberOfDays,
            });
          }

          if (result?.dailyPlans) {
            result.dailyPlans.sort((a, b) => a.day - b.day);
          }
          
          setItinerary(result);
          setLocations(result.locations);
        } catch (e) {
          console.error(e);
          toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "Could not generate an itinerary. Please try again later.",
          });
        } finally {
          setIsLoading(false);
          sessionStorage.removeItem('itineraryQuery');
        }
      };
      try {
        const parsedQuery = JSON.parse(itineraryQueryData);
        fetchItinerary(parsedQuery);
      } catch (e) {
        console.error("Failed to parse itinerary query from sessionStorage", e);
        setIsLoading(false);
      }
    } else if (storedItineraryData) {
      // This is a saved itinerary being viewed
      setIsNew(false);
      try {
        const parsedItinerary = JSON.parse(storedItineraryData);
        if (parsedItinerary?.dailyPlans) {
          parsedItinerary.dailyPlans.sort((a, b) => a.day - b.day);
        }
        setItinerary(parsedItinerary);
        setLocations(parsedItinerary.locations);
        setIsLoading(false);
        sessionStorage.removeItem('selectedItinerary');
      } catch (e) {
        console.error("Failed to parse itinerary data from sessionStorage", e);
        toast({
          variant: "destructive",
          title: "Error Loading Itinerary",
          description: "Could not load the saved itinerary from session.",
        });
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
    
  }, [toast]);

  const handleItineraryAdjusted = (adjustedItinerary: GeneratePersonalizedItineraryOutput) => {
    if (adjustedItinerary?.dailyPlans) {
      adjustedItinerary.dailyPlans.sort((a, b) => a.day - b.day);
    }
    setItinerary(adjustedItinerary);
    setLocations(adjustedItinerary.locations);
    setIsNew(true); // An adjusted itinerary should be treated as new for saving purposes.
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <main className="flex-grow grid md:grid-cols-2 grid-cols-1">
        <div className="md:h-screen h-[40vh] md:sticky top-0">
          <MapDisplay locations={locations} />
        </div>
        <div className="p-4 md:p-8">
          <ItineraryDisplay
            itinerary={itinerary}
            isLoading={isLoading}
            onItineraryAdjusted={handleItineraryAdjusted}
            isNew={isNew}
          />
        </div>
      </main>
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ItineraryPageContent />
    </Suspense>
  );
}
