
import { z } from 'genkit';

export const ItineraryLocationSchema = z.object({
  name: z.string().describe('Name of the location or activity.'),
  lat: z.number().describe('The latitude of the location.'),
  lng: z.number().describe('The longitude of the location.'),
  description: z
    .string()
    .describe('A short description of the activity at this location.'),
  day: z.number().describe('The day number in the itinerary.'),
});

export const DailyItinerarySchema = z.object({
  day: z.number().describe('The day number of the itinerary.'),
  title: z.string().describe("A short title for the day's plan."),
  activities: z
    .array(
      z.object({
        time: z
          .string()
          .describe('e.g., Morning, Afternoon, Evening, 9:00 AM'),
        description: z
          .string()
          .describe('A description of the activity.'),
        location: ItineraryLocationSchema.optional().describe(
          'The location of the activity. Only include this if it is a specific, real-world place with coordinates. For generic activities like "check into hotel" or "relax", omit this field.'
        ),
      })
    )
    .describe('A list of activities for the day.'),
});

export const GeneratePersonalizedItineraryOutputSchema = z.object({
  title: z.string().describe("A creative and descriptive title for the overall trip."),
  summary: z.string().describe("A brief, engaging summary of the trip plan."),
  estimatedCost: z.number().describe("An estimated total cost for the trip in Indian Rupees (INR)."),
  dailyPlans: z
    .array(DailyItinerarySchema)
    .describe('The day-by-day itinerary.'),
  locations: z
    .array(ItineraryLocationSchema)
    .describe('An array of all unique locations with coordinates from the itinerary.'),
  userId: z.string().optional().describe("The ID of the user who created the itinerary."),
  createdAt: z.string().optional().describe("The timestamp when the itinerary was created."),
  startingLocation: z.string().optional().describe("The user's starting point for the journey."),
});

export const GenerateItineraryFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo for trip inspiration, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
    
