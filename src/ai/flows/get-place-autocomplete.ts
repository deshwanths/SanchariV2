'use server';

/**
 * @fileOverview Fetches place autocomplete suggestions from Google Places API.
 * 
 * - getPlaceAutocomplete - A function that fetches place autocomplete suggestions.
 * - GetPlaceAutocompleteInput - The input type for the getPlaceAutocomplete function.
 * - GetPlaceAutocompleteOutput - The return type for the getPlaceAutocomplete function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for the input of the tool
const GetPlaceAutocompleteInputSchema = z.object({
  query: z.string().describe('The partial query for which to fetch autocomplete suggestions.'),
});
export type GetPlaceAutocompleteInput = z.infer<typeof GetPlaceAutocompleteInputSchema>;

// Define the schema for the output of the tool
const GetPlaceAutocompleteOutputSchema = z.object({
    predictions: z.array(z.string()).describe('A list of autocomplete predictions.'),
});
export type GetPlaceAutocompleteOutput = z.infer<typeof GetPlaceAutocompleteOutputSchema>;


async function fetchPlacePredictions(query: string): Promise<string[]> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured.');
      return [];
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&types=(cities)&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Places API error:', data.status, data.error_message);
        return [];
      }

      return data.predictions.map((p: any) => p.description);
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
      return [];
    }
}


export const getPlaceAutocompleteFlow = ai.defineFlow(
  {
    name: 'getPlaceAutocompleteFlow',
    inputSchema: GetPlaceAutocompleteInputSchema,
    outputSchema: GetPlaceAutocompleteOutputSchema,
  },
  async ({ query }) => {
    const predictions = await fetchPlacePredictions(query);
    return { predictions };
  }
);


export async function getPlaceAutocomplete(input: GetPlaceAutocompleteInput): Promise<GetPlaceAutocompleteOutput> {
  return getPlaceAutocompleteFlow(input);
}
