
'use server';

/**
 * @fileOverview Adjusts the itinerary based on real-time conditions such as weather or delays.
 *
 * - adjustItineraryForRealTimeConditions - A function that adjusts the itinerary based on real-time conditions.
 * - AdjustItineraryInput - The input type for the adjustItineraryForRealTimeConditions function.
 * - AdjustItineraryOutput - The return type for the adjustItineraryForRealTimeConditions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GeneratePersonalizedItineraryOutputSchema } from './schemas';
import { GeneratePersonalizedItineraryOutput } from './generate-personalized-itinerary';


const AdjustItineraryInputSchema = z.object({
  itinerary: z.string().describe('The current itinerary as a JSON string.'),
  weatherConditions: z.string().optional().describe('The current weather conditions.'),
  currentLocation: z.string().optional().describe('The current location of the traveler.'),
  delays: z.string().optional().describe('Information about any delays in transportation.'),
});
export type AdjustItineraryInput = z.infer<typeof AdjustItineraryInputSchema>;

export type AdjustItineraryOutput = GeneratePersonalizedItineraryOutput;

export async function adjustItineraryForRealTimeConditions(input: AdjustItineraryInput): Promise<AdjustItineraryOutput> {
  return adjustItineraryForRealTimeConditionsFlow(input);
}

const adjustItineraryForRealTimeConditionsPrompt = ai.definePrompt({
  name: 'adjustItineraryForRealTimeConditionsPrompt',
  input: {schema: AdjustItineraryInputSchema},
  output: {schema: GeneratePersonalizedItineraryOutputSchema},
  prompt: `You are a personalized trip adjustment expert. Your task is to take an existing travel itinerary and modify it based on real-time conditions provided by the user (e.g., weather, delays).

**Crucially, you must return a complete, valid JSON object that represents the *entire* updated itinerary, strictly conforming to the provided output schema. Do not just return the changes; return the full, revised plan.**

The user may provide one or more of the following conditions. Use the information available to make intelligent adjustments. If a piece of information isn't provided (e.g., no delays), you don't need to account for it.

Here is the original itinerary:
{{{itinerary}}}

Here are the real-time conditions to consider:
{{#if weatherConditions}}
- Weather: {{weatherConditions}}
{{/if}}
{{#if currentLocation}}
- Current Location: {{currentLocation}}
{{/if}}
{{#if delays}}
- Delays: {{delays}}
{{/if}}

Based on these conditions, regenerate the itinerary. For example, if it's raining, replace an outdoor activity with a suitable indoor alternative. If there's a delay, shift the timeline of subsequent activities.

Remember to provide accurate names and coordinates for any new locations you add. The response must be a single, complete JSON object of the entire adjusted trip plan.`,
});

const adjustItineraryForRealTimeConditionsFlow = ai.defineFlow(
  {
    name: 'adjustItineraryForRealTimeConditionsFlow',
    inputSchema: AdjustItineraryInputSchema,
    outputSchema: GeneratePersonalizedItineraryOutputSchema,
  },
  async input => {
    const {output} = await adjustItineraryForRealTimeConditionsPrompt(input);
    return output!;
  }
);
