
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { adjustItineraryForRealTimeConditions } from "@/ai/flows/adjust-itinerary-for-real-time-conditions";
import jsPDF from "jspdf";
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { useSearchParams } from "next/navigation";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Copy, WandSparkles, Wind, MapPin, Clock, ExternalLink, Download, Wallet } from "lucide-react";
import type { GeneratePersonalizedItineraryOutput } from "@/ai/flows/generate-personalized-itinerary";

type Itinerary = GeneratePersonalizedItineraryOutput | null;

type ItineraryDisplayProps = {
  itinerary: Itinerary;
  isLoading: boolean;
  onItineraryAdjusted: (newItinerary: GeneratePersonalizedItineraryOutput) => void;
};

const adjustmentSchema = z.object({
  weatherConditions: z.string().optional(),
  currentLocation: z.string().optional(),
  delays: z.string().optional(),
});

function ItineraryToText(itinerary: Itinerary, includeLink: boolean = false): string {
  if (!itinerary) return "";

  let text = `Trip: ${itinerary.title}\n\nSummary: ${itinerary.summary}\n\n`;
  if (itinerary.estimatedCost) {
    text += `Estimated Cost: ₹${itinerary.estimatedCost.toLocaleString('en-IN')}\n\n`;
  }
  itinerary.dailyPlans.forEach(day => {
    text += `Day ${day.day}: ${day.title}\n`;
    day.activities.forEach(activity => {
      text += `- ${activity.time}: ${activity.description}`;
      if (activity.location) {
        text += ` at ${activity.location.name}`;
      }
      text += `\n`;
    });
    text += `\n`;
  });

  if (includeLink && typeof window !== 'undefined') {
    text += `\n\nView your full interactive itinerary online:\n${window.location.href}`;
  }

  return text;
}


export function ItineraryDisplay({
  itinerary,
  isLoading,
  onItineraryAdjusted,
}: ItineraryDisplayProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const { user } = useUser();
  const db = getFirestore();

  const form = useForm<z.infer<typeof adjustmentSchema>>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      weatherConditions: "",
      currentLocation: "",
      delays: "",
    },
  });

  const handleShare = () => {
    if (itinerary) {
      const itineraryText = ItineraryToText(itinerary, true);
      navigator.clipboard.writeText(itineraryText);
      toast({
        title: "Itinerary Copied!",
        description: "The itinerary and a shareable link have been copied to your clipboard.",
      });
    }
  };

  const handleDownload = () => {
    if (itinerary) {
      const doc = new jsPDF();
      let y = 15; // Vertical position in PDF

      // Function to add text and handle line breaks
      const addText = (text: string, x: number, startY: number, options: any = {}) => {
        const lines = doc.splitTextToSize(text, 180);
        doc.text(lines, x, startY, options);
        return startY + lines.length * 6; // Adjust y position
      };

      doc.setFontSize(18);
      y = addText(itinerary.title, 10, y, { maxWidth: 180 });
      y += 5;

      if (itinerary.estimatedCost) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        y = addText(`Estimated Cost: ₹${itinerary.estimatedCost.toLocaleString('en-IN')}`, 10, y, { maxWidth: 180 });
        y += 5;
        doc.setFont("helvetica", "normal");
      }

      doc.setFontSize(12);
      y = addText(`Summary: ${itinerary.summary}`, 10, y, { maxWidth: 180 });
      y += 10;

      itinerary.dailyPlans.forEach(plan => {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        y = addText(`Day ${plan.day}: ${plan.title}`, 10, y, { maxWidth: 180 });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        y += 2;
        plan.activities.forEach(activity => {
          let activityText = `- ${activity.time}: ${activity.description}`;
          if (activity.location) {
            activityText += ` at ${activity.location.name}`;
          }
          y = addText(activityText, 15, y, { maxWidth: 170 });
        });
        y += 5;
      });

      doc.save("sanchari-itinerary.pdf");

      toast({
        title: "Download Started",
        description: "Your itinerary is being downloaded as a PDF.",
      });
    }
  };

  const handleSaveItinerary = async () => {
    if (!user || !itinerary || !db || isSaving || hasBeenSaved) return;

    setIsSaving(true);
    
    // Create the new data structure based on user's recommended pattern
    const destination = itinerary.startingLocation ?? "Unknown";
    const itineraryWithMeta = {
      userId: user.uid,
      title: itinerary.title,
      destination: destination,
      createdAt: serverTimestamp(),
      itineraryData: itinerary, // Nest the full AI JSON
    };

    const userItinerariesRef = collection(db, "users", user.uid, "itineraries");
    
    // Add the new structured document to Firestore
    addDoc(userItinerariesRef, itineraryWithMeta)
      .then(() => {
        setHasBeenSaved(true); // Mark as saved
        toast({
            title: "Itinerary Saved!",
            description: "Your trip has been automatically saved to your profile.",
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userItinerariesRef.path,
            operation: 'create',
            requestResourceData: itineraryWithMeta,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };
  
  useEffect(() => {
    // This effect runs when a new itinerary is generated or adjusted.
    // We only want to auto-save if the user is logged in and it hasn't been saved yet.
    if (itinerary && !isLoading && user && !hasBeenSaved) {
        handleSaveItinerary();
    }
    // We intentionally don't include handleSaveItinerary in the dependency array
    // to prevent re-runs from its own state changes (isSaving, hasBeenSaved).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itinerary, isLoading, user]);

  useEffect(() => {
    // Reset the save status whenever a new itinerary is loaded (from planner or adjustment).
    // This allows the new itinerary to be saved.
    setHasBeenSaved(false);
  }, [itinerary]);


  async function onAdjustmentSubmit(values: z.infer<typeof adjustmentSchema>) {
    if (!itinerary) return;

    setIsAdjusting(true);
    try {
      const result = await adjustItineraryForRealTimeConditions({
        itinerary: JSON.stringify(itinerary),
        ...values,
      });
      onItineraryAdjusted(result); // This will trigger the useEffect above to reset hasBeenSaved
      toast({
        title: "Itinerary Adjusted",
        description: "Your trip has been updated based on real-time conditions.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Adjustment Failed",
        description: "Could not adjust the itinerary. Please try again.",
      });
    } finally {
      setIsAdjusting(false);
    }
  }

  return (
    <Card className="shadow-2xl hover:shadow-2xl hover:-translate-y-0 max-w-4xl mx-auto bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
           {isLoading ? (
            <Skeleton className="h-6 w-3/4" />
          ) : itinerary ? (
            <span>{itinerary.title}</span>
          ) : (
            <span>Your Trip Itinerary</span>
          )}
          {itinerary && (
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleDownload}>
                    <Download className="h-5 w-5" />
                    <span className="sr-only">Download Itinerary</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Copy className="h-5 w-5" />
                    <span className="sr-only">Copy Itinerary</span>
                </Button>
            </div>
          )}
        </CardTitle>
         {isLoading ? (
            <div className="space-y-2 mt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4 mt-2" />
            </div>
          ) : itinerary ? (
            <div className="space-y-2">
                <CardDescription>{itinerary.summary}</CardDescription>
                {itinerary.estimatedCost && (
                    <div className="flex items-center gap-2 text-lg font-semibold text-primary pt-2">
                        <Wallet className="w-5 h-5"/>
                        <span>Estimated Cost: ₹{itinerary.estimatedCost.toLocaleString('en-IN')}</span>
                    </div>
                )}
            </div>
          ) : (
            <CardDescription>Here is your AI-generated travel plan.</CardDescription>
          )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 pt-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-full mt-2" />
          </div>
        ) : itinerary ? (
          <>
            <Accordion type="single" collapsible defaultValue="day-1" className="w-full">
              {itinerary.dailyPlans.map((plan, index) => (
                <AccordionItem value={`day-${plan.day}`} key={`day-${plan.day}-${index}`}>
                  <AccordionTrigger className="text-lg font-medium">
                    Day {plan.day}: {plan.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      {plan.activities.map((activity, j) => (
                         <li key={j}>
                           <span className="font-semibold text-foreground">{activity.time}:</span> {activity.description}
                           {activity.location && (
                             <a
                               href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location.name)}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-primary hover:underline text-xs flex items-center gap-1 ml-4 mt-1"
                            >
                                <MapPin className="w-3 h-3"/>
                                {activity.location.name}
                                <ExternalLink className="w-3 h-3"/>
                            </a>
                           )}
                         </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Accordion type="single" collapsible className="w-full mt-6">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <WandSparkles className="h-5 w-5 text-primary" />
                    <span>Real-time Adjustments</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Facing unexpected changes? Let AI adjust your plan on the fly.
                  </p>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onAdjustmentSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="weatherConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Wind className="w-4 h-4" /> Weather Conditions</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Sunny with a high of 25°C" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currentLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Current Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Near India Gate, Delhi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="delays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Clock className="w-4 h-4" /> Delays</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Metro delayed by 20 minutes" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isAdjusting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        {isAdjusting ? "Adjusting..." : "Adjust Itinerary"}
                      </Button>
                    </form>
                  </Form>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        ) : (
          <div className="text-center py-12">
            <WandSparkles className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">Let's Plan Your Adventure</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Go to the planner page to generate your personalized itinerary.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
