import { config } from 'dotenv';
config({ path: '.env' });

import '@/ai/flows/generate-personalized-itinerary.ts';
import '@/ai/flows/adjust-itinerary-for-real-time-conditions.ts';
import '@/ai/flows/get-place-autocomplete.ts';
import '@/ai/flows/generate-itinerary-from-image.ts';
import '@/ai/flows/schemas.ts';
