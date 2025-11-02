
import { z } from "zod";

export const ItinerarySchema = z.object({
  destination: z.string(),
  startingLocation: z.string().min(3, { message: "Starting location must be at least 3 characters long." }),
  travelStyle: z.enum(["budget", "comfortable", "luxury"]),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
  interests: z.array(z.string()),
  moods: z.array(z.string()),
  languages: z.array(z.string()).min(1, { message: "Please select at least one language." }),
  photoDataUri: z.string().optional(),
}).refine((data) => {
  // Must have either a destination that is not the dummy value, or a photo
  return (data.destination && data.destination !== 'Generated from image') || !!data.photoDataUri;
}, {
  message: "Please either enter a destination or upload a photo.",
  path: ["destination"], // Point error to the destination field
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date cannot be before the start date.",
  path: ["endDate"],
}).refine((data) => data.interests.length > 0 || data.moods.length > 0, {
    message: "You have to select at least one vibe for your trip.",
    path: ["interests"],
});

    