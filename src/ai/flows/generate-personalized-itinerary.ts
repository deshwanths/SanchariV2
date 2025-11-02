
// src/ai/flows/generate-personalized-itinerary.ts
'use server';
/**
 * @fileOverview Generates a personalized travel itinerary based on user inputs.
 *
 * - generatePersonalizedItinerary - A function that generates a personalized travel itinerary.
 * - GeneratePersonalizedItineraryInput - The input type for the generatePersonalizedItinerary function.
 * - GeneratePersonalizedItineraryOutput - The return type for the generatePersonalizedItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GeneratePersonalizedItineraryOutputSchema, ItineraryLocationSchema } from './schemas';

const GeneratePersonalizedItineraryInputSchema = z.object({
  travelStyle: z.string().describe('The travel style, e.g., budget, comfortable, luxury.'),
  interests: z
    .string()
    .describe(
      'A comma-separated list of interests, e.g., cultural heritage, nightlife, adventure.'
    ),
  moods: z.string().describe('A comma-separated list of desired moods for the trip, e.g., calm, inspired, exhilarated.'),
  travelDates: z.string().describe('The start and end dates for the trip.'),
  numberOfDays: z.number().describe('The total number of days for the trip.'),
  travelDestination: z.string().describe('The destination for the trip.'),
  languages: z.string().describe('A comma-separated list of preferred languages for the trip, e.g., hindi, english.'),
  startingLocation: z.string().describe("The user's starting point for the journey, e.g., Bangalore, India."),
});
export type GeneratePersonalizedItineraryInput = z.infer<
  typeof GeneratePersonalizedItineraryInputSchema
>;

export type GeneratePersonalizedItineraryOutput = z.infer<
  typeof GeneratePersonalizedItineraryOutputSchema
>;

export async function generatePersonalizedItinerary(
  input: GeneratePersonalizedItineraryInput
): Promise<GeneratePersonalizedItineraryOutput> {
  return generatePersonalizedItineraryFlow(input);
}

// Define an intermediate schema that does NOT require the top-level 'locations' array.
const ItineraryGenerationResponseSchema = GeneratePersonalizedItineraryOutputSchema.omit({ locations: true });

const generatePersonalizedItineraryPrompt = ai.definePrompt({
  name: 'generatePersonalizedItineraryPrompt',
  input: {schema: GeneratePersonalizedItineraryInputSchema},
  // The prompt now only needs to generate the parts it's good at.
  output: {schema: ItineraryGenerationResponseSchema},
  config: {
    temperature: 0.7,
    maxOutputTokens: 8192,
  },
  prompt: `You are an expert AI travel planner.

Generate a personalized, realistic, and well-structured travel itinerary based on the following user input.

**Your output must be a single, valid JSON object that strictly conforms to the provided output schema. The entire output, including all titles, summaries, and descriptions, MUST be in the primary language specified in the 'Preferred Languages' section below.**

### User Preferences:
- Destination: {{travelDestination}}
- Travel Dates: {{travelDates}}
- Travel Style: {{travelStyle}}
- User Interests: {{interests}}
- Preferred Moods: {{moods}}
- Starting Location: {{startingLocation}}
- Preferred Languages: {{languages}}

### Requirements:
1.  **Create a day-by-day itinerary** for exactly {{numberOfDays}} days that includes:
    - Places to visit (with short descriptions and precise location data including name, lat, lng, and day number).
    - Recommended food/local experiences.
    - Travel routes or logistics between stops.
    - Optional evening activities.
2.  **Omit Location for Generic Activities**: For generic activities like "Check into your hotel" or "Enjoy a relaxing evening," you MUST OMIT the 'location' field for that activity.
3.  **Ensure the itinerary fits the budget and travel style**.
4.  **Mention approximate travel times** where useful.
5.  **Keep it local, realistic, and culturally authentic**.
6.  Provide an **'estimatedCost' in Indian Rupees (INR)** for the entire trip. This cost should be a reasonable approximation based on the selected 'travelStyle', the 'destination', and the 'numberOfDays'.
7.  Return the result as a **valid JSON object** that conforms to the schema.
`,
});

const generatePersonalizedItineraryFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedItineraryFlow',
    inputSchema: GeneratePersonalizedItineraryInputSchema,
    outputSchema: GeneratePersonalizedItineraryOutputSchema,
  },
  async input => {
    // Step 1: Call the AI to get the main itinerary content.
    const {output: partialItinerary} = await generatePersonalizedItineraryPrompt(input);
    if (!partialItinerary) {
        throw new Error("Failed to generate itinerary content.");
    }
    
    // Step 2: Manually extract all location objects from the daily plans.
    const locations: z.infer<typeof ItineraryLocationSchema>[] = [];
    partialItinerary.dailyPlans.forEach(plan => {
        plan.activities.forEach(activity => {
            if (activity.location) {
                // Ensure the location is not already in the list to avoid duplicates
                if (!locations.some(l => l.name === activity.location!.name && l.day === activity.location!.day)) {
                    // Make sure the location object is complete before adding it
                    if (activity.location.name && activity.location.lat && activity.location.lng && activity.location.description && activity.location.day) {
                        locations.push(activity.location);
                    }
                }
            }
        });
    });

    // Step 3: Combine the AI-generated content with the manually extracted locations.
    const fullItinerary: GeneratePersonalizedItineraryOutput = {
        ...partialItinerary,
        locations: locations,
    };
    
    // This now perfectly matches the required schema.
    return fullItinerary;
  }
);
