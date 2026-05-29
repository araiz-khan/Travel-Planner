/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Buddy {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isActive: boolean;
  cursorField?: string | null;
}

export interface Comment {
  id: string;
  buddyName: string;
  text: string;
  timestamp: string;
}

export interface ItineraryItem {
  id: string;
  title: string;
  description: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  cost: number;
  duration: string;
  lat: number; // custom SVG Map Y percent (0-100) or Leaflet Lat
  lng: number; // custom SVG Map X percent (0-100) or Leaflet Lng
  address?: string;
  comments: Comment[];
  category: 'activity' | 'sightseeing' | 'dining' | 'accommodation' | 'transport';
}

export interface TripDay {
  id: string;
  date: string;
  dayNumber: number;
  items: ItineraryItem[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'lodging' | 'food' | 'transportation' | 'activities' | 'shopping' | 'other';
  paidBy: string; // buddy ID or name
  splitWith: string[]; // array of buddy IDs/names
  date: string;
}

export interface FlightStatus {
  id: string;
  flightNumber: string;
  airline: string;
  logo?: string;
  departureCity: string;
  departureCode: string;
  arrivalCity: string;
  arrivalCode: string;
  departureTime: string; // HH:MM
  arrivalTime: string;   // HH:MM
  status: 'Scheduled' | 'On Time' | 'Delayed' | 'Landed' | 'Boarding';
  terminal?: string;
  gate?: string;
  delayMinutes?: number;
  progress: number; // percentage (0 to 100)
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  buddies: Buddy[];
  budgetLimit: number;
  days: TripDay[];
  expenses: Expense[];
  flights: FlightStatus[];
}
