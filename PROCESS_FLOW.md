# Sanchari - Application Process Flow

This document outlines the user and data flow for the Sanchari application, from initial user interaction to itinerary generation and management.

## High-Level User Journey

The primary user journey involves a user landing on the homepage, planning a new trip, viewing the AI-generated itinerary, and optionally managing their saved trips in their profile.

```
(Start) --> [Homepage] --> [Planner Page] --> [Itinerary Generation] --> [Itinerary Page]
   |            ^                                                           |
   |            |                                                           |
   +------> [Login/Signup] ------> [Profile Page] --------------------------+

```

---

## Detailed Step-by-Step Flow

This diagram breaks down the main processes into smaller, more detailed steps.

### 1. User Authentication (Optional but Recommended)

```
[Homepage / Direct Access]
     |
     +--> [Login Page] OR [Signup Page]
     |      |                     |
     |      +----(Credentials)----+
     |      |
     V      V
 [Firebase Auth] <---(Validates email/password)
     |
     +----(Success)---> [Redirect to Profile Page]
     |
     +----(Failure)---> [Show Toast Error on Login/Signup Page]

```
*   **Demo Login**: A special path on the Login/Signup pages uses pre-defined credentials (`demo@gmail.com`) to allow quick access.

### 2. Itinerary Planning (The `PlannerPage`)

This is a multi-step form that collects user preferences.

```
[Homepage] OR [Profile Page]
     |
     +----(Click "Start Dreaming" / "Plan New Trip")----> [Planner Page - Step 1: Destination]
                                                                  |
           /------------------------------------------------------/
          /
  [User Chooses Path]
   |
   +---[PATH A: Text Input]-------------------------------------------------+
   |      |                                                                 |
   |      V                                                                 V
   |  (User types destination) --> [Google Places API] --> (Show Autocomplete) |
   |      |                                                                 |
   |      V                                                                 |
   |  (User selects a destination)                                          |
   |                                                                        |
   +---[PATH B: Image Upload]-----------------------------------------------+
          |
          V
      (User clicks "Upload Photo") --> (Selects image file) --> [Convert to Data URI]
          |
          V
      (Store Data URI in form state)


[Both Paths Converge Here]
     |
     V
[Step 2: Starting Location] --> [Google Places API for Autocomplete]
     |
     V
[Step 3: Date Range Selection]
     |
     V
[Step 4: Travel Style Selection (Budget, Comfort, Luxury)]
     |
     V
[Step 5: Vibe Selection (Interests & Moods)]
     |
     V
[Step 6: Language Selection]
     |
     V
[Step 7: Summary & Confirmation]
     |
     +----(Click "Create My Itinerary")----> [Proceed to Itinerary Generation]

```

### 3. AI Itinerary Generation

This process happens after the user submits the planner form. The data is passed via `sessionStorage` to the Itinerary Page.

```
[Itinerary Page - On Load]
     |
     +--> [Read planner data from sessionStorage]
     |
     +--> [Check if `photoDataUri` exists]
     |      |
     |      +----(YES)---> Call `generateItineraryFromImage` Genkit Flow
     |      |                  |
     |      |                  V
     |      |             [Gemini 2.5 Flash] --(Analyzes image, generates JSON)--> [Return Itinerary]
     |      |
     |      +----(NO)----> Call `generatePersonalizedItinerary` Genkit Flow
     |                         |
     |                         V
     |                    [Gemini 2.5 Flash] --(Analyzes text inputs, generates JSON)--> [Return Itinerary]
     |
     V
[Receive Structured Itinerary JSON]
     |
     +-->(If User is Logged In)--> [Auto-save to Firestore]
     |      |
     |      V
     |  [Firebase Firestore] --> (Save under `/users/{userId}/itineraries/{itineraryId}`)
     |
     V
[Update UI State with Itinerary Data] ---> [Render ItineraryDisplay & MapDisplay]

```

### 4. Viewing and Managing Itineraries

```
[Profile Page]
     |
     +--> (On Load, if user is logged in) --> [Query Firestore for Itineraries]
     |      |
     |      +--> `collection(/users/{userId}/itineraries).orderBy("createdAt").limit(...)`
     |      |
     |      V
     |  (Display list of saved trips in cards)
     |
     +---(Click "View Full Itinerary")---> [Save data to sessionStorage] --> [Redirect to Itinerary Page]
     |
     +---(Click "Edit Title")------------> [Open Edit Dialog] --> (Update Firestore doc)
     |
     +---(Click "Delete")----------------> [Open Confirmation Dialog] --> (Delete from Firestore)
     |
     +---(Click "Load More")-------------> [Re-query Firestore with `startAfter()`]

```
