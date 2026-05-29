/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize local trip database file if it doesn't exist
const DB_PATH = path.join(process.cwd(), 'trips_db.json');

const INITIAL_TRIP_DATA = [
  {
    id: 'tokyo-spring-2026',
    title: 'Tokyo Cherry Blossom Cruise',
    destination: 'Tokyo, Japan',
    startDate: '2026-03-25',
    endDate: '2026-03-29',
    budgetLimit: 3500,
    buddies: [
      { id: '1', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', color: '#10B981', isActive: true, cursorField: null },
      { id: '2', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', color: '#8B5CF6', isActive: true, cursorField: 'budgetLimit' },
      { id: '3', name: 'Kenji', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', color: '#3B82F6', isActive: false, cursorField: null }
    ],
    days: [
      {
        id: 'day-1',
        date: '2026-03-25',
        dayNumber: 1,
        items: [
          {
            id: 'item-1',
            title: 'Team Land Meet & Shibuya Sky Sunrise',
            description: 'Meet at Shibuya station Exit 8, head up to Shibuya Sky observation deck for panoramic cityscape photo sessions.',
            timeSlot: 'morning',
            cost: 22,
            duration: '2 hours',
            lat: 65, // 65% Y coordinate on SVG Map
            lng: 35, // 35% X coordinate on SVG Map
            address: 'Shibuya Sky, 2-24-12 Shibuya, Tokyo',
            category: 'sightseeing',
            comments: [
              { id: 'c1', buddyName: 'Sarah', text: 'Should we pre-book tickets online? I heard they sell out weeks in advance!', timestamp: '2026-05-29T10:14:00Z' },
              { id: 'c2', buddyName: 'Kenji', text: 'I booked mine already, let me link ours!', timestamp: '2026-05-29T10:45:00Z' }
            ]
          },
          {
            id: 'item-2',
            title: 'Sushizanmai lunch at Tsukiji Outer Market',
            description: 'Feast on fresh bluefin tuna sushi, sweet tamagoyaki omelettes, and street seafood stalls.',
            timeSlot: 'afternoon',
            cost: 45,
            duration: '1.5 hours',
            lat: 55,
            lng: 65,
            address: 'Tsukiji Outer Market, Chuo City, Tokyo',
            category: 'dining',
            comments: []
          },
          {
            id: 'item-3',
            title: 'Shinjuku Gyoen National Garden Cherry Blossoms',
            description: 'Relaxing stroll among hundreds of blooming pink Sakura trees. Picnic mats and photo walks.',
            timeSlot: 'afternoon',
            cost: 5,
            duration: '3 hours',
            lat: 42,
            lng: 34,
            address: '11 Naitomachi, Shinjuku City, Tokyo',
            category: 'activity',
            comments: [
              { id: 'c3', buddyName: 'Alex', text: 'Bring a light jacket, it can get breezy near the lake.', timestamp: '2026-05-29T11:20:00Z' }
            ]
          },
          {
            id: 'item-4',
            title: 'Omoide Yokocho Izakaya Dinner',
            description: 'Experience nostalgic, narrow alleys packed with rustic charcoal grilled yakitori and sake bars.',
            timeSlot: 'evening',
            cost: 35,
            duration: '2.5 hours',
            lat: 38,
            lng: 28,
            address: '1 Chome-2 Nishishinjuku, Shinjuku City, Tokyo',
            category: 'dining',
            comments: []
          }
        ]
      },
      {
        id: 'day-2',
        date: '2026-03-26',
        dayNumber: 2,
        items: [
          {
            id: 'item-5',
            title: 'Senso-ji Temple & Nakamise Dori walk',
            description: 'Explore Tokyos oldest Buddhist temple in historic Asakusa, pick up traditional snacks like Ningyo-yaki.',
            timeSlot: 'morning',
            cost: 0,
            duration: '2 hours',
            lat: 28,
            lng: 78,
            address: '2-3-1 Asakusa, Taito City, Tokyo',
            category: 'sightseeing',
            comments: []
          },
          {
            id: 'item-6',
            title: 'teamLab Borderless Digital Arts Museum',
            description: 'Immersive multi-sensory 3D light experience. Bring cameras and soft-soled shoes.',
            timeSlot: 'afternoon',
            cost: 38,
            duration: '3 hours',
            lat: 78,
            lng: 82,
            address: 'Azabudai Hills, Minato City, Tokyo',
            category: 'activity',
            comments: [
              { id: 'c4', buddyName: 'Sarah', text: 'Absolutely crucial to wear flat white or black shoes since some floors are mirrored!', timestamp: '2026-05-29T11:55:00Z' }
            ]
          }
        ]
      }
    ],
    expenses: [
      { id: 'exp-1', title: 'Shibuya Sky Tickets', amount: 66, category: 'activities', paidBy: 'Alex', splitWith: ['Alex', 'Sarah', 'Kenji'], date: '2026-03-25' },
      { id: 'exp-2', title: 'teamLab Borderless Booking', amount: 114, category: 'activities', paidBy: 'Sarah', splitWith: ['Alex', 'Sarah', 'Kenji'], date: '2026-03-26' },
      { id: 'exp-3', title: 'Tsukiji Market feast', amount: 135, category: 'food', paidBy: 'Kenji', splitWith: ['Alex', 'Sarah', 'Kenji'], date: '2026-03-25' },
      { id: 'exp-4', title: 'Tokyo Subway 72hr Pass', amount: 45, category: 'transportation', paidBy: 'Alex', splitWith: ['Alex', 'Sarah', 'Kenji'], date: '2026-03-25' },
      { id: 'exp-5', title: 'Hôtel Tokyo Ginza Stay', amount: 1200, category: 'lodging', paidBy: 'Sarah', splitWith: ['Alex', 'Sarah', 'Kenji'], date: '2026-03-25' }
    ],
    flights: [
      {
        id: 'f-1',
        flightNumber: 'NH117',
        airline: 'All Nippon Airways',
        logo: '✈️',
        departureCity: 'Seattle',
        departureCode: 'SEA',
        arrivalCity: 'Tokyo',
        arrivalCode: 'HND',
        departureTime: '15:15',
        arrivalTime: '18:15',
        status: 'On Time',
        terminal: 'International T3',
        gate: '147',
        delayMinutes: 0,
        progress: 65
      },
      {
        id: 'f-2',
        flightNumber: 'JL005',
        airline: 'Japan Airlines',
        logo: '✈️',
        departureCity: 'New York',
        departureCode: 'JFK',
        arrivalCity: 'Tokyo',
        arrivalCode: 'HND',
        departureTime: '11:45',
        arrivalTime: '15:25',
        status: 'Delayed',
        terminal: 'International T3',
        gate: '112',
        delayMinutes: 25,
        progress: 40
      }
    ]
  }
];

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_TRIP_DATA, null, 2));
      return INITIAL_TRIP_DATA;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return INITIAL_TRIP_DATA;
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Ensure the local file DB is initialized
readDB();

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Get all trips
app.get('/api/trips', (req, res) => {
  const trips = readDB();
  res.json(trips);
});

// Get single trip details
app.get('/api/trips/:id', (req, res) => {
  const trips = readDB();
  const trip = trips.find((t: any) => t.id === req.params.id);
  if (trip) {
    res.json(trip);
  } else {
    res.status(404).json({ error: 'Trip not found' });
  }
});

// Create a new trip
app.post('/api/trips', (req, res) => {
  const trips = readDB();
  const newTrip = req.body;
  if (!newTrip.id) {
    newTrip.id = 'trip-' + Date.now();
  }
  trips.push(newTrip);
  writeDB(trips);
  res.status(201).json(newTrip);
});

// Update an existing trip
app.post('/api/trips/:id/update', (req, res) => {
  const trips = readDB();
  const index = trips.findIndex((t: any) => t.id === req.params.id);
  if (index !== -1) {
    trips[index] = { ...trips[index], ...req.body };
    writeDB(trips);
    res.json(trips[index]);
  } else {
    res.status(404).json({ error: 'Trip not found' });
  }
});

// AI suggestions using Gemini API (server-side ONLY)
app.post('/api/ai/suggest', async (req, res) => {
  const { destination, daysCount = 3, preferences = '', budget = 2000 } = req.body;
  
  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === 'MY_GEMINI_API_KEY' || geminiKey.trim() === '') {
    // Graceful fallback for offline mode
    console.log('Skipping Gemini API due to absent or initial API Key. Providing mock fallback recommendations.');
    return res.json(getMockAISuggestions(destination, daysCount, preferences, budget));
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const userPrompt = `Generate a fully functional, creative, and highly specific daily travel itinerary for a trip to: ${destination}.
    - Number of Days: ${daysCount}
    - Budget Level: Under $${budget} USD
    - Travel preferences/styles: ${preferences || 'General sightseeing, local food, must-see spots, photo sessions'}
    
    Please provide appropriate custom visual coordinate variables (lat, lng from 10 to 90) representing relative positions on an SVG coordinate canvas map of the city. Also add categories (activity, sightseeing, dining, accommodation, or transport), titles, durations and sensible USD costs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: `You are an expert, local insider vacation planner. You generate structured holiday itineraries that map out exact coordinates (lat, lng range 10-90) so things can be plotted neatly in a custom localized 2D SVG canvas.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itinerarySuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  timeSlot: { type: Type.STRING, description: "Must be exactly one of: 'morning', 'afternoon', or 'evening'" },
                  cost: { type: Type.NUMBER, description: "Estimated cost per person in USD" },
                  duration: { type: Type.STRING, description: "Estimated duration, e.g., '2 hours' or '1 hour'" },
                  lat: { type: Type.INTEGER, description: "Estimated physical Map coordinate Y percent, value from 10 to 90" },
                  lng: { type: Type.INTEGER, description: "Estimated physical Map coordinate X percent, value from 10 to 90" },
                  category: { type: Type.STRING, description: "Must be exactly: activity, sightseeing, dining, accommodation, or transport" },
                  address: { type: Type.STRING, description: "Nearby address/district name" }
                },
                required: ["title", "description", "timeSlot", "cost", "duration", "lat", "lng", "category"]
              }
            },
            localBudgetTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 3 relevant budget or local convenience tips for this city."
            }
          },
          required: ["itinerarySuggestions", "localBudgetTips"]
        }
      }
    });

    if (response && response.text) {
      const parsedData = JSON.parse(response.text);
      return res.json(parsedData);
    } else {
      throw new Error('Empty response text from Gemini');
    }
  } catch (err: any) {
    console.error('Error calling Gemini API:', err);
    // Graceful fallback to maintain beautiful operational app state
    return res.json(getMockAISuggestions(destination, daysCount, preferences, budget));
  }
});

// Mock Flight searches
app.post('/api/flights/search', (req, res) => {
  const { flightNumber } = req.body;
  if (!flightNumber) {
    return res.status(400).json({ error: 'Flight number is required' });
  }

  const num = flightNumber.toUpperCase().replace(/\s/g, '');
  // Generate some plausible flight status dynamic data
  const airlines = ['All Nippon Airways', 'Japan Airlines', 'Delta Air Lines', 'United Airlines', 'Emirates', 'Singapore Airlines', 'Cathay Pacific'];
  const airline = airlines[Math.floor(Math.random() * airlines.length)];
  const cities = [
    { city: 'London', code: 'LHR' },
    { city: 'Los Angeles', code: 'LAX' },
    { city: 'Paris', code: 'CDG' },
    { city: 'Singapore', code: 'SIN' },
    { city: 'Sydney', code: 'SYD' },
    { city: 'Tokyo', code: 'HND' },
    { city: 'San Francisco', code: 'SFO' }
  ];
  const dep = cities[Math.floor(Math.random() * (cities.length - 1))];
  const arr = cities[Math.floor(Math.random() * cities.length)];
  
  const statusOptions: Array<'Scheduled' | 'On Time' | 'Delayed' | 'Landed' | 'Boarding'> = ['On Time', 'Delayed', 'Boarding', 'Scheduled'];
  const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
  const delayMinutes = status === 'Delayed' ? Math.floor(Math.random() * 45) + 10 : 0;

  const mockFlight = {
    id: 'f-search-' + Date.now(),
    flightNumber: num,
    airline: airline,
    logo: '✈️',
    departureCity: dep.city,
    departureCode: dep.code,
    arrivalCity: arr.city,
    arrivalCode: arr.code === dep.code ? 'NRT' : arr.code,
    departureTime: `${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`,
    arrivalTime: `${String(Math.floor(Math.random() * 12) + 12).padStart(2, '0')}:${String(Math.floor(Math.random() * 6) * 10).padStart(2, '0')}`,
    status: status,
    terminal: `Terminal ${Math.floor(Math.random() * 3) + 1}`,
    gate: String(Math.floor(Math.random() * 80) + 10),
    delayMinutes: delayMinutes,
    progress: status === 'Landed' ? 100 : status === 'Scheduled' ? 0 : Math.floor(Math.random() * 80) + 10
  };

  res.json(mockFlight);
});

// Helper function to return beautiful fallbacks if offline or API key isn't provided
function getMockAISuggestions(destination: string, daysCount: number, preferences: string, budget: number) {
  const cleanDest = destination.trim().split(',')[0].toLowerCase();
  
  let itinerarySuggestions = [];
  let localBudgetTips = [
    `Buy local travel passes rather than single transit tickets to get unlimited multi-day subway trips.`,
    `Visit food markets or local convenience stores (like FamilyMart or convenience markets) for high-quality, budget-friendly quick lunches and snacks.`,
    `Pre-book core sightseeing decks and museums early online to secure skip-the-line deals or buddy discounts.`
  ];

  if (cleanDest.includes('paris')) {
    itinerarySuggestions = [
      {
        title: 'Louvre Museum Sunrise Session',
        description: 'Iconic glass pyramid photo walk, beat the massive museum lines early for the Mona Lisa.',
        timeSlot: 'morning',
        cost: 25,
        duration: '3 hours',
        lat: 48,
        lng: 42,
        address: 'Rue de Rivoli, 75001 Paris',
        category: 'sightseeing'
      },
      {
        title: 'Boulangerie Pastries & Seine River Picnic',
        description: 'Pick up hot chocolate, fresh buttery croissants, and cheese from local shop for a serene dockside lunch.',
        timeSlot: 'afternoon',
        cost: 15,
        duration: '1.5 hours',
        lat: 55,
        lng: 45,
        address: 'Quai de la Mégisserie, Paris',
        category: 'dining'
      },
      {
        title: 'Eiffel Tower Sunset Park stroll',
        description: 'Lay out blankets on Champ de Mars lawns to admire the sparkling gold lights sequence at the top of the hour.',
        timeSlot: 'evening',
        cost: 0,
        duration: '2.5 hours',
        lat: 62,
        lng: 25,
        address: 'Champ de Mars, 5 Avenue Anatole France',
        category: 'activity'
      },
      {
        title: 'Montmartre Artists & Sacré-Cœur walk',
        description: 'Vibrant cobblestone historic hilltop walk. Watch active local artists sketch or see spectacular peak city views.',
        timeSlot: 'morning',
        cost: 0,
        duration: '2 hours',
        lat: 22,
        lng: 58,
        address: '35 Rue du Chevalier de la Barre',
        category: 'sightseeing'
      }
    ];
  } else if (cleanDest.includes('london')) {
    itinerarySuggestions = [
      {
        title: 'Big Ben & Westminster Walking Tour',
        description: 'Classic exploration of Parliament Square, historic arches, and perfect Thames River angles.',
        timeSlot: 'morning',
        cost: 0,
        duration: '2 hours',
        lat: 60,
        lng: 45,
        address: 'Westminster, London SW1A 0AA',
        category: 'sightseeing'
      },
      {
        title: 'Borough Market Street Food Explorer',
        description: 'Taste artisan pork rolls, fresh visual strawberries with chocolates, and multi-cuisine lunch stands.',
        timeSlot: 'afternoon',
        cost: 18,
        duration: '2 hours',
        lat: 53,
        lng: 70,
        address: '8 Southwark St, London SE1 1TL',
        category: 'dining'
      },
      {
        title: 'British Museum Free Treasure hunt',
        description: 'Admire the legendary Great Court roof, Rosetta Stone, and ancient marble sculptures entirely free of admission fee.',
        timeSlot: 'afternoon',
        cost: 0,
        duration: '3 hours',
        lat: 35,
        lng: 48,
        address: 'Great Russell St, London WC1B 3DG',
        category: 'activity'
      }
    ];
  } else {
    // Default fallback for general destinations
    itinerarySuggestions = [
      {
        title: `Epic Discovery of ${destination} Landmark`,
        description: 'Marvel at outstanding architecture and capture historic sunrise photos over iconic public gardens.',
        timeSlot: 'morning',
        cost: 15,
        duration: '2.5 hours',
        lat: 30,
        lng: 40,
        address: `Downtown ${destination}`,
        category: 'sightseeing'
      },
      {
        title: 'Local Authentic Street Market Lunch',
        description: 'Explore gourmet snack vendors, traditional craft makers, and regional delicacy platters.',
        timeSlot: 'afternoon',
        cost: 20,
        duration: '1.5 hours',
        lat: 50,
        lng: 60,
        address: `Central Market, ${destination}`,
        category: 'dining'
      },
      {
        title: 'Starlit Skyline Viewpoint & Photo session',
        description: 'Reach a spectacular panoramic peak to look over the cityscape with light treats and drinks.',
        timeSlot: 'evening',
        cost: 10,
        duration: '3 hours',
        lat: 70,
        lng: 50,
        address: `Scenic Deckway, ${destination}`,
        category: 'activity'
      }
    ];
  }

  // Ensure returning structured JSON compliant
  return {
    itinerarySuggestions: itinerarySuggestions.slice(0, Math.min(itinerarySuggestions.length, daysCount * 2)),
    localBudgetTips: localBudgetTips
  };
}

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    // Mount Vite middleware so static resource bundling works automatically
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express] Travel Planner Server booting on port ${PORT}`);
  });
}

startServer();
