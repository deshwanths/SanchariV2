# Sanchari: AI-Powered Trip Planner

This is a Next.js starter project for an AI-powered trip planner called Sanchari, built within Firebase Studio. It uses Google's Gemini model via Genkit to generate personalized travel itineraries.

## Getting Started: Running the Project Locally

Follow these steps to set up and run the Sanchari application on your local machine.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm (or a compatible package manager like yarn or pnpm)

### 1. Set Up Environment Variables

The application requires API keys for Google Maps (for place autocomplete) and the Google Gemini model (for AI itinerary generation). You'll need to create a local environment file to store these keys securely.

**A. Create the File**

In the root directory of the project, create a new file named `.env.local`.

**B. Add API Keys**

Copy and paste the following content into your new `.env.local` file:

```env
# Get your key from the Google Cloud Console: https://console.cloud.google.com/google/maps-apis/credentials
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"

# Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

**C. Obtain and Add Your Keys**

1.  **Google Maps API Key**:
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials).
    *   Create or select a project.
    *   Ensure the **Places API** is enabled for your project.
    *   Create a new API key and copy it.
    *   Replace `"YOUR_GOOGLE_MAPS_API_KEY"` with the key you just copied.

2.  **Gemini API Key**:
    *   Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Click "Create API key in new project".
    *   Copy the generated API key.
    *   Replace `"YOUR_GEMINI_API_KEY"` with the key you just copied.

### 2. Install Dependencies

Before you can run the app, you need to install all the required Node.js packages listed in the `package.json` file.

Open your terminal in the project's root directory and run the following command:

```bash
npm install
```

### 3. Run the Development Servers

This application has two main parts that must run at the same time in separate terminal windows: the Next.js frontend and the Genkit AI backend.

**Terminal 1: Start the Next.js Frontend**

In your first terminal window, run the following command. This starts the main web application that you will interact with in your browser.

```bash
npm run dev
```

By default, this will make the application available at `http://localhost:9002`.

**Terminal 2: Start the Genkit AI Server**

In a second, separate terminal window, run this command. This starts the server that handles all requests to the Gemini AI model.

```bash
npm run genkit:watch
```

This command starts the Genkit server and also watches for any changes you make to the AI flow files (in `src/ai/flows/`), automatically restarting when they are updated.

### 4. Access the Application

Once both servers are running without errors, open your web browser and navigate to:

[http://localhost:9002](http://localhost:9002)

You should now be able to use the Sanchari application, from planning a trip to generating a full AI-powered itinerary.
