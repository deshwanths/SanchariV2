'use server';
/**
 * @fileOverview Generates a personalized travel itinerary based on an uploaded image.
 *
 * - generateItineraryFromImage - A function that generates an itinerary from an image.
 * - GenerateItineraryFromImageInput - The input type for the function.
 * - GenerateItineraryFromImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GeneratePersonalizedItineraryOutputSchema, ItineraryLocationSchema, GenerateItineraryFromImageInputSchema } from './schemas';

export type GenerateItineraryFromImageInput = z.infer<typeof GenerateItineraryFromImageInputSchema>;
export type GenerateItineraryFromImageOutput = z.infer<typeof GeneratePersonalizedItineraryOutputSchema>;


export async function generateItineraryFromImage(
  input: GenerateItineraryFromImageInput
): Promise<GenerateItineraryFromImageOutput> {
  return generateItineraryFromImageFlow(input);
}

// Define an intermediate schema that does NOT require the top-level 'locations' array.
const ItineraryGenerationResponseSchema = GeneratePersonalizedItineraryOutputSchema.omit({ locations: true });

const generateItineraryFromImagePrompt = ai.definePrompt({
  name: 'generateItineraryFromImagePrompt',
  input: {schema: GenerateItineraryFromImageInputSchema},
  output: {schema: ItineraryGenerationResponseSchema},
  config: {
    temperature: 0.7,
    maxOutputTokens: 8192,
  },
  prompt: `You are an expert AI travel planner who creates itineraries based on images.

A user has uploaded a photo. Your task is to generate a personalized, realistic, and well-structured travel itinerary inspired by the contents and mood of this image.

**Your output must be a single, valid JSON object that strictly conforms to the provided output schema. The entire output, including all titles, summaries, and descriptions, MUST be in English.**

### Image Context:
The user has provided this image as inspiration:
{{media url=photoDataUri}}

### Requirements:
1.  **Analyze the Image**: Determine the key elements, environment, and mood (e.g., "sunny beach," "historic temple," "mountainous landscape," "vibrant city nightlife").
2.  **Create an Itinerary**: Generate a day-by-day itinerary for 5 days that is thematically consistent with the image.
    - Suggest a realistic **'destination'** that matches the image.
    - Create a **'title'** for the trip that reflects the image's inspiration.
    - Include places to visit, recommended food, local experiences, and logistics.
3.  **Omit Location for Generic Activities**: For generic activities like "Check into your hotel" or "Enjoy a relaxing evening," you MUST OMIT the 'location' field for that activity.
4.  **Provide an 'estimatedCost'** in Indian Rupees (INR) for the entire trip, assuming a "Comfortable" travel style.
5.  **Return the result as a valid JSON object** that conforms to the schema.
`,
});

const generateItineraryFromImageFlow = ai.defineFlow(
  {
    name: 'generateItineraryFromImageFlow',
    inputSchema: GenerateItineraryFromImageInputSchema,
    outputSchema: GeneratePersonalizedItineraryOutputSchema,
  },
  async input => {
    // Step 1: Call the AI to get the main itinerary content from the image.
    const {output: partialItinerary} = await generateItineraryFromImagePrompt(input);
    if (!partialItinerary) {
        throw new Error("Failed to generate itinerary content from image.");
    }
    
    // Step 2: Manually extract all location objects from the daily plans.
    const locations: z.infer<typeof ItineraryLocationSchema>[] = [];
    partialItinerary.dailyPlans.forEach(plan => {
        plan.activities.forEach(activity => {
            if (activity.location) {
                if (!locations.some(l => l.name === activity.location!.name && l.day === activity.location!.day)) {
                    if (activity.location.name && activity.location.lat && activity.location.lng && activity.location.description && activity.location.day) {
                        locations.push(activity.location);
                    }
                }
            }
        });
    });

    // Step 3: Combine the AI-generated content with the manually extracted locations.
    const fullItinerary: GenerateItineraryFromImageOutput = {
        ...partialItinerary,
        locations: locations,
    };
    
    return fullItinerary;
  }
);
