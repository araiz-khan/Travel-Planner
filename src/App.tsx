/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  DollarSign,
  MapPin,
  Plane,
  Users,
  Plus,
  Compass,
  Clock,
  Sparkles,
  PlusCircle,
  Check,
  TrendingUp,
  Send,
  Trash2,
  Loader2,
  Activity,
  X,
  Layers,
  PieChart as PieIcon,
  Smile,
  Bell,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Trip, ItineraryItem, Expense, FlightStatus, Comment, Buddy } from './types';
import InteractiveMap from './components/InteractiveMap';

// Quick static color array for category cells
const CATEGORY_COLORS: Record<string, string> = {
  lodging: '#EC4899', // pink-500
  food: '#F59E0B',    // amber-500
  transportation: '#6366F1', // indigo-500
  activities: '#3B82F6', // blue-500
  shopping: '#10B981', // emerald-500
  other: '#8B5CF6'    // purple-500
};

export default function App() {
  // Trips State
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // UI Toggles & Forms State
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'flights' | 'ai'>('itinerary');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [newTripDest, setNewTripDest] = useState('');
  const [newTripBudget, setNewTripBudget] = useState(3000);

  // New Itinerary Item form state
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemSlot, setNewItemSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [newItemCategory, setNewItemCategory] = useState<'activity' | 'sightseeing' | 'dining' | 'accommodation' | 'transport'>('activity');
  const [newItemCost, setNewItemCost] = useState(25);
  const [newItemDuration, setNewItemDuration] = useState('2 hours');
  const [newItemAddress, setNewItemAddress] = useState('');
  const [newItemLat, setNewItemLat] = useState(50);
  const [newItemLng, setNewItemLng] = useState(50);

  // New Expense form state
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmt, setNewExpenseAmt] = useState(40);
  const [newExpenseCat, setNewExpenseCat] = useState<'lodging' | 'food' | 'transportation' | 'activities' | 'shopping' | 'other'>('food');
  const [newExpensePaidBy, setNewExpensePaidBy] = useState('Alex');
  const [newExpenseSplit, setNewExpenseSplit] = useState<string[]>(['Alex', 'Sarah', 'Kenji']);

  // Collaborative simulation states
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string }[]>([]);
  const [activeBuddiesCount, setActiveBuddiesCount] = useState(3);
  const [buddyActivity, setBuddyActivity] = useState<string | null>(null);

  // Real-time Flight search states
  const [flightSearchNumber, setFlightSearchNumber] = useState('');
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightMessage, setFlightMessage] = useState<string | null>(null);

  // AI Generation inputs
  const [aiPreferences, setAiPreferences] = useState('Traditional shrines, local street markets, scenic views, coffee walks');
  const [aiDaysCount, setAiDaysCount] = useState(3);
  const [aiBudgetLimit, setAiBudgetLimit] = useState(2500);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Comment input
  const [commentTextValue, setCommentTextValue] = useState('');

  // Fetch all trips on load
  useEffect(() => {
    fetchTrips();
    // Start collaborative simulation updates
    const alertInterval = setInterval(() => {
      triggerRandomBuddyCollaboration();
    }, 14000);

    return () => {
      clearInterval(alertInterval);
    };
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      if (res.ok) {
        const data: Trip[] = await res.json();
        setTrips(data);
        if (data.length > 0) {
          // Default to the first trip
          setActiveTripId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveTrip = (): Trip | undefined => {
    return trips.find((t) => t.id === activeTripId);
  };

  // Push notifications block
  const addNotification = (text: string) => {
    const id = Date.now().toString();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setNotifications((prev) => [{ id, text, time: now }, ...prev.slice(0, 4)]);
  };

  // Simulates comments updates, budget limit adjustments or edits from friends
  const triggerRandomBuddyCollaboration = () => {
    const currentTrip = getActiveTrip();
    if (!currentTrip) return;

    const names = currentTrip.buddies.map((b) => b.name);
    if (names.length === 0) return;
    const buddyName = names[Math.floor(Math.random() * names.length)];

    const activities = [
      `${buddyName} is looking at the dynamic trip itinerary.`,
      `${buddyName} updated an expense split tracking details.`,
      `${buddyName} added a custom photo note to Day 1.`,
      `${buddyName} is searching for real-time flights details.`
    ];

    const randomText = activities[Math.floor(Math.random() * activities.length)];
    setBuddyActivity(randomText);
    addNotification(randomText);

    // Timeout to clear buddy activity typing display after a while
    setTimeout(() => {
      setBuddyActivity(null);
    }, 5000);
  };

  // Invite dynamic buddy simulation
  const handleInviteBuddy = () => {
    const freshNames = ['Diana', 'George', 'Elena', 'Mark', 'Lisa', 'Chloe'];
    const chosenName = freshNames[Math.floor(Math.random() * freshNames.length)];
    const colors = ['#EC4899', '#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const activeTrip = getActiveTrip();
    if (!activeTrip) return;

    const newBuddy: Buddy = {
      id: 'buddy-' + Date.now(),
      name: chosenName,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=100&auto=format&fit=crop&q=80`,
      color,
      isActive: true,
      cursorField: null
    };

    const updatedTrip = {
      ...activeTrip,
      buddies: [...activeTrip.buddies, newBuddy]
    };

    updateTripOnServer(updatedTrip);
    addNotification(`🎉 ${chosenName} joined the collaboration session!`);
  };

  // Send update to Backend
  const updateTripOnServer = async (updated: Trip) => {
    // Optimistic UI updates
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

    try {
      const res = await fetch(`/api/trips/${updated.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const fresh = await res.json();
        setTrips((prev) => prev.map((t) => (t.id === fresh.id ? fresh : t)));
      }
    } catch (err) {
      console.error('Error syncing trip with server:', err);
    }
  };

  // Add Day to current trip
  const handleAddDay = () => {
    const activeTrip = getActiveTrip();
    if (!activeTrip) return;

    const daysCount = activeTrip.days.length;
    const startNum = new Date(activeTrip.startDate);
    startNum.setDate(startNum.getDate() + daysCount);
    const dateStr = startNum.toISOString().split('T')[0];

    const newDay = {
      id: `day-${Date.now()}`,
      date: dateStr,
      dayNumber: daysCount + 1,
      items: []
    };

    const updatedTrip = {
      ...activeTrip,
      days: [...activeTrip.days, newDay]
    };

    updateTripOnServer(updatedTrip);
    setActiveDayIndex(daysCount); // switch to the newly created day
    addNotification(`📅 Added Day ${daysCount + 1} to the travel plan.`);
  };

  // Append itinerary item manually
  const handleAddItineraryItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeTrip = getActiveTrip();
    if (!activeTrip) return;

    const newItem: ItineraryItem = {
      id: 'item-' + Date.now(),
      title: newItemTitle || 'Charming Coffee break & Garden',
      description: newItemDesc || 'Enjoying native treats and scenic walks with friends.',
      timeSlot: newItemSlot,
      cost: Number(newItemCost),
      duration: newItemDuration || '2 hours',
      lat: Number(newItemLat),
      lng: Number(newItemLng),
      address: newItemAddress || 'Local cultural district',
      category: newItemCategory,
      comments: []
    };

    // Insertion target Day
    const targetDay = activeTrip.days[activeDayIndex];
    if (!targetDay) return;

    const updatedDays = activeTrip.days.map((day, idx) => {
      if (idx === activeDayIndex) {
        return {
          ...day,
          items: [...day.items, newItem]
        };
      }
      return day;
    });

    const updatedTrip: Trip = {
      ...activeTrip,
      days: updatedDays
    };

    updateTripOnServer(updatedTrip);
    setIsAddingItem(false);
    resetItineraryItemFields();
    addNotification(`📍 Added "${newItem.title}" to Day ${targetDay.dayNumber}!`);
  };

  const resetItineraryItemFields = () => {
    setNewItemTitle('');
    setNewItemDesc('');
    setNewItemAddress('');
    setNewItemCost(15);
    setNewItemDuration('1.5 hours');
    setNewItemSlot('morning');
    setNewItemCategory('activity');
    setNewItemLat(50);
    setNewItemLng(50);
  };

  // Add Item via clicking map coordinates
  const handleMapAddPoint = (lat: number, lng: number) => {
    setNewItemLat(lat);
    setNewItemLng(lng);
    setIsAddingItem(true);
    // Focus or default title helper
    setNewItemTitle('Custom Map Pin Spot');
    setNewItemDesc('Plotted spot coordinates on Interactive SVG grid.');
    addNotification(`📍 Pointed location latitude ${lat}% / longitude ${lng}% ! Complete detail options form.`);
  };

  // Remove individual Itinerary stop
  const handleDeleteStop = (itemId: string) => {
    const activeTrip = getActiveTrip();
    if (!activeTrip) return;

    const updatedDays = activeTrip.days.map((day) => {
      return {
        ...day,
        items: day.items.filter((item) => item.id !== itemId)
      };
    });

    const updatedTrip = {
      ...activeTrip,
      days: updatedDays
    };

    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }

    updateTripOnServer(updatedTrip);
    addNotification(`🗑️ Removed itinerary marker stop from the plan.`);
  };

  // Submit Comments regarding a stop
  const handleAddComment = (itemId: string) => {
    if (!commentTextValue.trim()) return;
    const activeTrip = getActiveTrip();
    if (!activeTrip) return;

    const activeBuddy = activeTrip.buddies[Math.floor(Math.random() * activeTrip.buddies.length)] || { name: 'You' };

    const newComment: Comment = {
      id: 'com-' + Date.now(),
      buddyName: activeBuddy.name,
      text: commentTextValue.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedDays = activeTrip.days.map((day) => {
      return {
        ...day,
        items: day.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              comments: [...item.comments, newComment]
            };
          }
          return item;
        })
      };
    });

    const updatedTrip = {
      ...activeTrip,
      days: updatedDays
    };

    updateTripOnServer(updatedTrip);
    setCommentTextValue('');
    addNotification(`💬 ${activeBuddy.name} commented on selection.`);
  };

  // Submit Budget Expense
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeTrip = getActiveTrip();
    if (!activeTrip) return;

    const newExpense: Expense = {
      id: 'exp-' + Date.now(),
      title: newExpenseTitle || 'Snacks & Street Food combo',
      amount: Number(newExpenseAmt),
      category: newExpenseCat,
      paidBy: newExpensePaidBy,
      splitWith: newExpenseSplit,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedTrip = {
      ...activeTrip,
      expenses: [...activeTrip.expenses, newExpense]
    };

    updateTripOnServer(updatedTrip);
    setIsAddingExpense(false);
    setNewExpenseTitle('');
    setNewExpenseAmt(40);
    setNewExpenseCat('food');
    addNotification(`💰 Added expense: $${newExpense.amount} for "${newExpense.title}".`);
  };

  const handleExpenseToggleSplit = (buddyId: string) => {
    if (newExpenseSplit.includes(buddyId)) {
      setNewExpenseSplit(newExpenseSplit.filter((id) => id !== buddyId));
    } else {
      setNewExpenseSplit([...newExpenseSplit, buddyId]);
    }
  };

  const calculateTotalExpenses = (trip: Trip) => {
    return trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getExpensesByCategory = (trip: Trip) => {
    const data: Record<string, number> = {
      lodging: 0,
      food: 0,
      transportation: 0,
      activities: 0,
      shopping: 0,
      other: 0
    };

    trip.expenses.forEach((exp) => {
      if (data[exp.category] !== undefined) {
        data[exp.category] += exp.amount;
      } else {
        data['other'] += exp.amount;
      }
    });

    return Object.keys(data).map((key) => ({
      name: key.toUpperCase(),
      value: data[key],
      fill: CATEGORY_COLORS[key] || '#94A3B8'
    })).filter(item => item.value > 0);
  };

  // Real-time Flight updates searching
  const handleSearchFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightSearchNumber.trim()) return;

    const activeTrip = getActiveTrip();
    if (!activeTrip) return;

    setFlightLoading(true);
    setFlightMessage(null);

    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightNumber: flightSearchNumber })
      });

      if (res.ok) {
        const flight: FlightStatus = await res.json();
        
        // Append or update flight to active Trip
        const updatedFlights = [
          flight,
          ...(activeTrip.flights || []).filter((f) => f.flightNumber !== flight.flightNumber)
        ];

        const updatedTrip = {
          ...activeTrip,
          flights: updatedFlights
        };

        updateTripOnServer(updatedTrip);
        setFlightSearchNumber('');
        setFlightMessage(`✈️ Flight ${flight.flightNumber} loaded successfully and tracking!`);
        addNotification(`✈️ Subscribed radar tracking for Flight ${flight.flightNumber}`);
      } else {
        setFlightMessage('Error: Flight lookup returned code ' + res.status);
      }
    } catch (err) {
      console.error(err);
      setFlightMessage('Failed lookup. Offline simulator fallback.');
    } finally {
      setFlightLoading(false);
    }
  };

  // Generate Trip using server side Gemini AI suggestions
  const handleGenerateAIItinerary = async () => {
    const destination = newTripDest || 'Paris, France';
    setAiGenerating(true);
    setAiSuccessMessage(null);
    addNotification(`✨ Contacting Gemini AI Expert for ${destination}...`);

    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination,
          daysCount: aiDaysCount,
          preferences: aiPreferences,
          budget: aiBudgetLimit
        })
      });

      if (res.ok) {
        const returnedData = await res.json();
        
        // Let's create a beautiful structured Trip structure based on result
        const suggestionItems: any[] = returnedData.itinerarySuggestions || [];
        const budgetTips: string[] = returnedData.localBudgetTips || [];

        // Build days distribution dynamically based on suggestions
        const generatedDays = Array.from({ length: aiDaysCount }).map((_, dIdx) => {
          const number = dIdx + 1;
          const dateRef = new Date();
          dateRef.setDate(dateRef.getDate() + 45 + dIdx);
          const dateStr = dateRef.toISOString().split('T')[0];

          // Distribute list items evenly
          const dayItems = suggestionItems.filter((_, itemIdx) => {
            return (itemIdx % aiDaysCount) === dIdx;
          }).map((sug, subIdx) => ({
            id: `ai-item-${dIdx}-${subIdx}-${Date.now()}`,
            title: sug.title || 'Sightseeing stop',
            description: sug.description || 'Discovered stunning local vistas and structures.',
            timeSlot: sug.timeSlot || (subIdx === 0 ? 'morning' : subIdx === 1 ? 'afternoon' : 'evening'),
            cost: Number(sug.cost) || 0,
            duration: sug.duration || '2 hours',
            lat: Number(sug.lat) || (30 + Math.random() * 40),
            lng: Number(sug.lng) || (30 + Math.random() * 40),
            address: sug.address || '',
            category: sug.category || 'sightseeing',
            comments: []
          }));

          return {
            id: `ai-day-${number}-${Date.now()}`,
            date: dateStr,
            dayNumber: number,
            items: dayItems
          };
        });

        // Generate base flight & expenses simulation based on AI suggestion
        const randomCode = () => String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const customFlightNumber = `${randomCode()}${Math.floor(Math.random() * 800) + 100}`;
        const flightAmt = Math.round(aiBudgetLimit * 0.35);

        const newTrip: Trip = {
          id: `trip-ai-${Date.now()}`,
          title: `Custom ${destination} Jetset`,
          destination: destination,
          startDate: generatedDays[0].date,
          endDate: generatedDays[generatedDays.length - 1].date,
          budgetLimit: aiBudgetLimit,
          buddies: [
            { id: '1', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', color: '#10B981', isActive: true },
            { id: '2', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', color: '#8B5CF6', isActive: true },
            { id: '3', name: 'Kenji', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', color: '#3B82F6', isActive: false }
          ],
          days: generatedDays,
          expenses: [
            { id: `exp-ai-1-${Date.now()}`, title: 'Base Flights Booking', amount: flightAmt, category: 'transportation', paidBy: 'Alex', splitWith: ['Alex', 'Sarah', 'Kenji'], date: generatedDays[0].date },
            { id: `exp-ai-2-${Date.now()}`, title: 'Local Insiders Lodge Deposit', amount: Math.round(aiBudgetLimit * 0.25), category: 'lodging', paidBy: 'Sarah', splitWith: ['Alex', 'Sarah', 'Kenji'], date: generatedDays[0].date }
          ],
          flights: [
            {
              id: `f-ai-${Date.now()}`,
              flightNumber: customFlightNumber,
              airline: 'Global Wingers',
              logo: '✈️',
              departureCity: 'Seattle',
              departureCode: 'SEA',
              arrivalCity: destination.split(',')[0],
              arrivalCode: destination.substring(0, 3).toUpperCase(),
              departureTime: '10:00',
              arrivalTime: '14:30',
              status: 'On Time',
              terminal: 'Terminal S',
              gate: 'A18',
              progress: 0
            }
          ]
        };

        // Add new trip to the records
        setTrips((prev) => [newTrip, ...prev]);
        setActiveTripId(newTrip.id);
        setActiveDayIndex(0);
        setIsAddingTrip(false);
        setNewTripDest('');

        setAiSuccessMessage(`✨ Generated amazing custom itinerary with ${suggestionItems.length} curated coordinates pinpoints! Populated budget suggestions too.`);
        addNotification(`✨ Beautiful collaborative trip "${newTrip.title}" generated!`);
        
        // Show budget tips as notification toasts
        budgetTips.forEach((tip, idx) => {
          setTimeout(() => {
            addNotification(`💡 Tip: ${tip}`);
          }, (idx + 1) * 2000);
        });

      } else {
        addNotification(`❌ Fulfiller encountered issue formatting suggestions grid.`);
      }
    } catch (err) {
      console.error(err);
      addNotification(`❌ API response failed. Double check key setups.`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateSimpleTrip = () => {
    if (!newTripDest.trim()) return;

    const baseId = `trip-${Date.now()}`;
    const startStr = new Date().toISOString().split('T')[0];
    const endStr = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const newTrip: Trip = {
      id: baseId,
      title: `${newTripDest} Getaway`,
      destination: newTripDest,
      startDate: startStr,
      endDate: endStr,
      budgetLimit: newTripBudget,
      buddies: [
        { id: '1', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', color: '#10B981', isActive: true },
        { id: '2', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', color: '#8B5CF6', isActive: true }
      ],
      days: [
        {
          id: `day-1-${Date.now()}`,
          dayNumber: 1,
          date: startStr,
          items: [
            {
              id: `item-s1-${Date.now()}`,
              title: `${newTripDest} Welcome Stroll`,
              description: 'Initial sightseeing walk around local town square and scenic areas.',
              timeSlot: 'afternoon',
              cost: 10,
              duration: '1.5 hours',
              lat: 44,
              lng: 55,
              address: 'Central Avenue',
              category: 'sightseeing',
              comments: []
            }
          ]
        }
      ],
      expenses: [],
      flights: []
    };

    // Save to server
    const saveTripOnServer = async () => {
      try {
        const res = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTrip)
        });
        if (res.ok) {
          const saved = await res.json();
          setTrips((prev) => [saved, ...prev]);
          setActiveTripId(saved.id);
          setActiveDayIndex(0);
        }
      } catch (err) {
        console.error(err);
        setTrips((prev) => [newTrip, ...prev]);
        setActiveTripId(newTrip.id);
      }
    };

    saveTripOnServer();
    setIsAddingTrip(false);
    setNewTripDest('');
    addNotification(`✈️ Welcomely created manual trip to ${newTripDest}!`);
  };

  const activeTrip = getActiveTrip();
  const currentDay = activeTrip && activeTrip.days ? activeTrip.days[activeDayIndex] : null;
  const currentItems = currentDay ? currentDay.items : [];
  const selectedItem = currentItems.find((i) => i.id === selectedItemId);

  // Flight ticks progress simulation (makes it look incredibly real-time and active!)
  useEffect(() => {
    const flightTimer = setInterval(() => {
      if (!activeTrip || !activeTrip.flights) return;
      let hasChange = false;
      const updatedFlights = activeTrip.flights.map((flight) => {
        if (flight.status === 'On Time' || flight.status === 'Delayed' || flight.status === 'Boarding') {
          const freshProgress = Math.min(100, flight.progress + 1);
          if (freshProgress !== flight.progress) {
            hasChange = true;
            return {
              ...flight,
              progress: freshProgress,
              status: freshProgress === 100 ? 'Landed' : flight.status
            };
          }
        }
        return flight;
      });

      if (hasChange) {
        setTrips((prev) =>
          prev.map((t) => (t.id === activeTrip.id ? { ...t, flights: updatedFlights } : t))
        );
      }
    }, 25000);

    return () => clearInterval(flightTimer);
  }, [activeTrip]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white font-sans overflow-x-hidden relative flex flex-col selection:bg-indigo-500/40">
      {/* Decorative Mesh Blurs */}
      <div className="absolute top-[-150px] left-[-150px] w-96 h-96 bg-blue-500 rounded-full blur-[140px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[100px] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[160px] opacity-25 pointer-events-none"></div>

      {/* Top Banner alert on colleague activity */}
      <AnimatePresence>
        {buddyActivity && (
          <motion.div
            initial={{ opacity: 0, y: -45 }}
            animate={{ opacity: 1, y: 15 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-[#10b981]/25 border border-[#10b981]/40 px-4 py-2 rounded-full backdrop-blur-xl shadow-lg shadow-[#10b981]/10 flex items-center gap-2 text-xs font-semibold text-emerald-200"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>{buddyActivity}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Wrap */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:p-8 flex flex-row gap-6 relative z-10">
        
        {/* Navigation Sidebar */}
        <nav className="w-18 md:w-20 hidden sm:flex flex-col items-center py-8 gap-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] shrink-0 self-start shadow-xl sticky top-6 md:top-8 z-30">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer hover:scale-105 transition-all">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div className="flex flex-col gap-8 opacity-75">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`p-3 rounded-2xl hover:text-indigo-200 hover:bg-white/5 transition-all ${
                activeTab === 'itinerary' ? 'text-indigo-400 bg-white/10' : 'text-white/60'
              }`}
              title="Itineraries Timeline"
            >
              <Calendar className="w-5.5 h-5.5" />
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`p-3 rounded-2xl hover:text-indigo-200 hover:bg-white/5 transition-all ${
                activeTab === 'budget' ? 'text-indigo-400 bg-white/10' : 'text-white/60'
              }`}
              title="Budget & Splits"
            >
              <DollarSign className="w-5.5 h-5.5" />
            </button>
            <button
              onClick={() => setActiveTab('flights')}
              className={`p-3 rounded-2xl hover:text-indigo-200 hover:bg-white/5 transition-all ${
                activeTab === 'flights' ? 'text-indigo-400 bg-white/10' : 'text-white/60'
              }`}
              title="Flight Status Tracker"
            >
              <Plane className="w-5.5 h-5.5" />
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`p-3 rounded-2xl hover:text-indigo-200 hover:bg-white/5 transition-all ${
                activeTab === 'ai' ? 'text-emerald-400 bg-white/10' : 'text-indigo-200/50'
              }`}
              title="Gemini AI Vacation Maker"
            >
              <Sparkles className="w-5.5 h-5.5" />
            </button>
          </div>
        </nav>

        {/* Core Main Area */}
        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* Header Bar */}
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 pb-2 border-b border-white/5">
            <div>
              {loading ? (
                <div className="h-10 w-64 bg-white/5 animate-pulse rounded-lg" />
              ) : activeTrip ? (
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                      {activeTrip.title}
                    </h1>
                    <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full">
                      Live Co-op
                    </span>
                  </div>
                  <p className="text-indigo-200/60 mt-1 uppercase text-[10px] tracking-widest font-semibold flex items-center gap-2">
                    <span>🗓️ {activeTrip.startDate} — {activeTrip.endDate}</span>
                    <span>•</span>
                    <span>📍 {activeTrip.destination}</span>
                    <span>•</span>
                    <span>👥 {activeTrip.buddies.length} Collaborators</span>
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold">No trips planned yet!</h1>
                  <p className="text-white/40 text-xs">Begin with your first manually created trip or leverage Gemini AI below.</p>
                </div>
              )}
            </div>

            {/* Quick Actions & Collaborators */}
            <div className="flex items-center flex-wrap gap-3 w-full xl:w-auto justify-between sm:justify-end">
              
              {/* Trip Selector Dropdown */}
              {!loading && trips.length > 0 && (
                <select
                  value={activeTripId}
                  onChange={(e) => {
                    setActiveTripId(e.target.value);
                    setActiveDayIndex(0);
                    setSelectedItemId(null);
                  }}
                  className="bg-white/10 border border-white/10 text-white text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
                  id="select-trip-dropdown"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      ✈️ {t.title} ({t.destination.split(',')[0]})
                    </option>
                  ))}
                </select>
              )}

              {/* Buddies avatars tracking online stats */}
              {activeTrip && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl">
                  <div className="flex -space-x-2">
                    {activeTrip.buddies.map((buddy) => (
                      <div
                        key={buddy.id}
                        className="relative w-8 h-8 rounded-full border border-indigo-900 group"
                        title={`${buddy.name} (${buddy.isActive ? 'Online editing' : 'Idle'})`}
                      >
                        <img src={buddy.avatar} alt={buddy.name} className="w-full h-full rounded-full object-cover" />
                        <span
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-slate-900 inline-block"
                          style={{ backgroundColor: buddy.isActive ? '#10B981' : '#94A3B8' }}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleInviteBuddy}
                    className="p-1.5 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 rounded-full transition-all"
                    title="Simulate inviting active buddy to board"
                    id="trigger-invite-buddy"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Big Action button */}
              <button
                onClick={() => setIsAddingTrip(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 transition-all flex items-center gap-1.5"
                id="create-new-trip-btn"
              >
                <PlusCircle className="w-4 h-4" />
                Add Trip
              </button>
            </div>
          </header>

          {/* Quick Tab control for mobile selectors */}
          <div className="flex sm:hidden overflow-x-auto gap-2 py-1 border-b border-white/5 scrollbar-thin">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'itinerary' ? 'bg-indigo-500/30 text-white' : 'text-white/60 bg-white/5'
              }`}
            >
              📅 Itinerary
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'budget' ? 'bg-indigo-500/30 text-white' : 'text-white/60 bg-white/5'
              }`}
            >
              💰 Budget Splits
            </button>
            <button
              onClick={() => setActiveTab('flights')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'flights' ? 'bg-indigo-500/30 text-white' : 'text-white/60 bg-white/5'
              }`}
            >
              ✈️ Flight Status
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'ai' ? 'bg-emerald-500/30 text-emerald-300' : 'text-white/60 bg-white/5'
              }`}
            >
              ✨ AI Generator
            </button>
          </div>

          {/* Mobile Notification Alert bar (latest note) */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 bg-indigo-950/40 border border-white/5 p-2 rounded-xl text-[10px] text-indigo-200">
              <Bell className="w-3.5 h-3.5 text-indigo-400 animate-bounce cursor-pointer flex-shrink-0" />
              <span className="font-mono text-indigo-400">[{notifications[0].time}]</span>
              <span className="truncate">{notifications[0].text}</span>
            </div>
          )}

          {/* Dashboard Main Grid Body */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-y-auto pr-1 scrollbar-thin overflow-x-hidden">
            
            {/* LEFT SECTION (Itinerary feed or alternative panels representing active perspective) */}
            <div className="lg:col-span-3 flex flex-col gap-6">

              {/* Perspective 1: Itinerary and Map coordinates */}
              {(activeTab === 'itinerary' || !activeTab) && (
                <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-4 md:p-6 shadow-2xl flex flex-col gap-4">
                  
                  {/* Itinerary Filter Header & Days tabs selection */}
                  {activeTrip ? (
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <h2 className="text-lg font-extrabold text-white">Daily Itinerary Feeds</h2>
                        </div>
                        
                        <div className="flex gap-1.5 items-center bg-white/5 p-1 rounded-xl border border-white/5">
                          <button
                            onClick={handleAddDay}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold px-2 py-1 transition-all flex items-center gap-1"
                            title="Insert next day in calendar"
                          >
                            <Plus className="w-3.5 h-3.5" /> Day
                          </button>
                        </div>
                      </div>

                      {/* Day Swapper tabs row */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                        {activeTrip.days.map((day, idx) => (
                          <button
                            key={day.id}
                            onClick={() => {
                              setActiveDayIndex(idx);
                              setSelectedItemId(null);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all relative whitespace-nowrap ${
                              idx === activeDayIndex
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                            }`}
                          >
                            <span className="block text-[8px] uppercase tracking-wider text-slate-300 text-opacity-80">Day {day.dayNumber}</span>
                            <span>{day.date.substring(5)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-sm">Please select or add a trip above.</div>
                  )}

                  {/* Day specific list itinerary items block */}
                  {currentDay && (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      
                      {currentItems.length === 0 ? (
                        <div className="py-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
                          <Compass className="w-10 h-10 text-white/20 animate-spin" style={{ animationDuration: '6s' }} />
                          <p className="text-xs text-slate-300 max-w-sm">No items scheduled for Day {currentDay.dayNumber} yet.</p>
                          <button
                            onClick={() => setIsAddingItem(true)}
                            className="mt-2 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-400/20"
                          >
                            Add First Stop
                          </button>
                        </div>
                      ) : (
                        currentItems.map((item, index) => {
                          const isSelected = item.id === selectedItemId;

                          // Categorical tags styling
                          let badgeBg = 'bg-blue-500/10 text-blue-300 border-blue-400/20';
                          if (item.category === 'dining') badgeBg = 'bg-amber-500/10 text-amber-300 border-amber-400/20';
                          if (item.category === 'accommodation') badgeBg = 'bg-pink-500/10 text-pink-300 border-pink-400/20';
                          if (item.category === 'sightseeing') badgeBg = 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20';
                          if (item.category === 'transport') badgeBg = 'bg-indigo-500/10 text-indigo-300 border-indigo-400/20';

                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                              className={`group cursor-pointer rounded-2xl border transition-all duration-300 ${
                                isSelected
                                  ? 'bg-indigo-600/25 border-indigo-500/50 shadow-xl'
                                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                              }`}
                            >
                              <div className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex gap-3">
                                  {/* Step Sequence Number Indicator */}
                                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-indigo-200 text-center shrink-0">
                                    {index + 1}
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-indigo-200">
                                        🕒 {item.timeSlot} • {item.duration}
                                      </span>
                                      <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${badgeBg}`}>
                                        {item.category}
                                      </span>
                                    </div>
                                    <h3 className="font-bold text-white text-sm md:text-base leading-snug">
                                      {item.title}
                                    </h3>
                                    {item.address && (
                                      <p className="text-white/40 text-[10px] flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-slate-400" /> {item.address}
                                      </p>
                                    )}
                                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Right Side Actions Controls */}
                                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 border-t md:border-t-0 p-2 md:p-0 border-white/5">
                                  <span className="text-xs font-black text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                    {item.cost === 0 ? 'FREE' : `$${item.cost}`}
                                  </span>
                                  
                                  <div className="flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteStop(item.id);
                                      }}
                                      className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                      title="Remove from itinerary list"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Collaborative comments interactive box */}
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-[#0a0f24]/60 border-t border-indigo-500/20 rounded-b-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="p-4 space-y-3">
                                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" /> Stop Collaboration Chat
                                      </h4>

                                      {/* Comments listing */}
                                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                        {item.comments.length === 0 ? (
                                          <p className="text-[10px] text-slate-400 italic">No notes posted on this stop. Post a query or recommendation below!</p>
                                        ) : (
                                          item.comments.map((comment) => (
                                            <div key={comment.id} className="bg-white/5 border border-white/5 p-2 rounded-xl text-xs flex flex-col gap-0.5">
                                              <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-slate-200">{comment.buddyName}</span>
                                                <span className="text-slate-400 font-mono scale-90">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                              </div>
                                              <p className="text-slate-300 font-medium">{comment.text}</p>
                                            </div>
                                          ))
                                        )}
                                      </div>

                                      {/* Comments Submission widget bar */}
                                      <div className="flex gap-2">
                                        <input
                                          value={commentTextValue}
                                          onChange={(e) => setCommentTextValue(e.target.value)}
                                          placeholder="Join suggestions or ask friends..."
                                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400/40"
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddComment(item.id);
                                          }}
                                        />
                                        <button
                                          onClick={() => handleAddComment(item.id)}
                                          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all"
                                        >
                                          <Send className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Manual add stop trigger panel collapsible */}
                  <div className="border-t border-white/5 pt-4">
                    {!isAddingItem ? (
                      <button
                        onClick={() => setIsAddingItem(true)}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 text-xs font-bold text-indigo-300 transition-all flex items-center justify-center gap-2"
                        id="add-itinerary-stop"
                      >
                        <Plus className="w-4 h-4 animate-pulse" /> Customize Stop & coordinates
                      </button>
                    ) : (
                      <motion.form
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleAddItineraryItemSubmit}
                        className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-4"
                        id="add-stop-form"
                      >
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h3 className="text-xs font-bold text-indigo-200">New Stop Details</h3>
                          <button
                            type="button"
                            onClick={() => setIsAddingItem(false)}
                            className="p-1 hover:bg-white/10 rounded-full"
                          >
                            <X className="w-4 h-4 text-slate-300" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-300">Stop Title</label>
                            <input
                              required
                              value={newItemTitle}
                              onChange={(e) => setNewItemTitle(e.target.value)}
                              placeholder="e.g. Asakusa Shrine Dinner"
                              className="w-full bg-[#0a0f24]/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-400"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-300">Category Tag</label>
                            <select
                              value={newItemCategory}
                              onChange={(e) => setNewItemCategory(e.target.value as any)}
                              className="w-full bg-[#0a0f24] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100"
                            >
                              <option value="sightseeing" className="bg-slate-900">🏞️ Sightseeing</option>
                              <option value="activity" className="bg-slate-900">🎮 Activity / Arts</option>
                              <option value="dining" className="bg-slate-900">🍣 Dining / food</option>
                              <option value="accommodation" className="bg-slate-900">🏨 Accommodation</option>
                              <option value="transport" className="bg-slate-900">🚊 Transport</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-slate-300">Description</label>
                          <textarea
                            value={newItemDesc}
                            onChange={(e) => setNewItemDesc(e.target.value)}
                            placeholder="Insiders details about local street foods, tickets, or meeting bounds."
                            className="w-full bg-[#0a0f24]/50 border border-white/10 rounded-xl px-3 py-2 text-xs h-16 focus:ring-1 focus:ring-indigo-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-300">Period Slot</label>
                            <select
                              value={newItemSlot}
                              onChange={(e) => setNewItemSlot(e.target.value as any)}
                              className="w-full bg-[#0a0f24] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                            >
                              <option value="morning">🌅 Morning</option>
                              <option value="afternoon">☀️ Afternoon</option>
                              <option value="evening">🌕 Evening</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-300">Cost (USD)</label>
                            <input
                              type="number"
                              value={newItemCost}
                              onChange={(e) => setNewItemCost(Number(e.target.value))}
                              className="w-full bg-[#0a0f24]/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-400"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-300">Duration</label>
                            <input
                              value={newItemDuration}
                              onChange={(e) => setNewItemDuration(e.target.value)}
                              placeholder="2 hours"
                              className="w-full bg-[#0a0f24]/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-300">Address / Spot</label>
                            <input
                              value={newItemAddress}
                              onChange={(e) => setNewItemAddress(e.target.value)}
                              placeholder="e.g. Asakusa, Tokyo"
                              className="w-full bg-[#0a0f24]/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs"
                            />
                          </div>
                        </div>

                        {/* Interactive map coordinates helper instruction */}
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex gap-2.5 items-center">
                          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                          <p className="text-[10px] text-slate-300">
                            Tip: You can also specify coordinates by clicking anywhere on the interactive map block underneath! Coordinates will populate automatically. Current: <span className="text-white font-mono font-bold">X:{newItemLng}%, Y:{newItemLat}%</span>
                          </p>
                        </div>

                        <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => setIsAddingItem(false)}
                            className="bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-xl text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold"
                          >
                            Save Stop
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </div>

                </section>
              )}

              {/* Perspective 2: Budget Tracking ledger & chart splits */}
              {activeTab === 'budget' && (
                <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-6">
                  
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-lg font-bold">Expense splits & Budget Tracking</h2>
                    </div>
                    <button
                      onClick={() => setIsAddingExpense(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-3 py-2 flex items-center gap-1.5"
                      id="add-expense-trigger"
                    >
                      <Plus className="w-4 h-4" /> Add Expense
                    </button>
                  </div>

                  {activeTrip ? (
                    <div className="space-y-6">
                      
                      {/* Budget visual grid header cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                          <p className="text-[10px] uppercase text-white/40 font-bold">Expenses Limit</p>
                          <p className="text-2xl font-black text-white">${activeTrip.budgetLimit}</p>
                        </div>
                        <div className="bg-[#10b981]/10 border border-[#10b981]/25 p-4 rounded-2xl">
                          <p className="text-[10px] uppercase text-emerald-400 font-bold">Total Spent</p>
                          <p className="text-2xl font-black text-emerald-300">${calculateTotalExpenses(activeTrip)}</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                          <p className="text-[10px] uppercase text-white/40 font-bold">Remaining Budget</p>
                          <p className="text-2xl font-black text-indigo-200">
                            ${Math.max(0, activeTrip.budgetLimit - calculateTotalExpenses(activeTrip))}
                          </p>
                        </div>
                      </div>

                      {/* Visual budget meter bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-slate-300">
                          <span>Progress Meter</span>
                          <span>{Math.round((calculateTotalExpenses(activeTrip) / activeTrip.budgetLimit) * 100)}% Used</span>
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (calculateTotalExpenses(activeTrip) / activeTrip.budgetLimit) * 100)}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Chart visual sector */}
                      {activeTrip.expenses.length > 0 && (
                        <div className="bg-slate-900/40 border border-white/5 p-4 rounded-[24px] flex flex-col md:flex-row items-center justify-around gap-4">
                          <div className="h-44 w-44">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getExpensesByCategory(activeTrip)}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {getExpensesByCategory(activeTrip).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="flex-1 space-y-2 max-w-sm">
                            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Share by category</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {getExpensesByCategory(activeTrip).map((item) => (
                                <div key={item.name} className="flex items-center gap-1.5 text-slate-300">
                                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.fill }} />
                                  <span className="truncate">{item.name}: <span className="font-bold text-white">${item.value}</span></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Expenses List ledger */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Payments Ledger</h4>
                        
                        {activeTrip.expenses.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-6">No expense transactions registered yet.</p>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {activeTrip.expenses.map((exp) => (
                              <div key={exp.id} className="bg-white/5 border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:bg-white/10 transition-all">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: CATEGORY_COLORS[exp.category] || '#6366f1' }} />
                                    <p className="font-bold text-sm text-white">{exp.title}</p>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    Paid by <span className="font-semibold text-slate-300">{exp.paidBy}</span> • Splitting among {exp.splitWith.length} buddies
                                  </p>
                                </div>

                                <span className="font-black text-slate-100 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-sm">
                                  ${exp.amount}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Collapsible New Expense Adding form */}
                      <AnimatePresence>
                        {isAddingExpense && (
                          <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handleAddExpenseSubmit}
                            className="bg-[#0a0f24]/50 border border-indigo-500/20 p-4 rounded-2xl overflow-hidden space-y-4"
                            id="add-expense-form"
                          >
                            <h3 className="text-xs font-bold text-indigo-300">Record New Transaction</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase text-slate-300">Expense Item</label>
                                <input
                                  required
                                  value={newExpenseTitle}
                                  onChange={(e) => setNewExpenseTitle(e.target.value)}
                                  placeholder="e.g. Ginza Lunch feast"
                                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] uppercase text-slate-300">Amount (USD)</label>
                                <input
                                  type="number"
                                  required
                                  value={newExpenseAmt}
                                  onChange={(e) => setNewExpenseAmt(Number(e.target.value))}
                                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] uppercase text-slate-300">Category</label>
                                <select
                                  value={newExpenseCat}
                                  onChange={(e) => setNewExpenseCat(e.target.value as any)}
                                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                                >
                                  <option value="lodging">🏨 Staying / Hotel</option>
                                  <option value="food">🍣 Foods & restaurants</option>
                                  <option value="transportation">🚊 Transportation</option>
                                  <option value="activities">🎮 Attractions & Passes</option>
                                  <option value="shopping">🛍️ Shopping</option>
                                  <option value="other">📦 Other</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase text-slate-300">Paid By Colleague</label>
                                <select
                                  value={newExpensePaidBy}
                                  onChange={(e) => setNewExpensePaidBy(e.target.value)}
                                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                                >
                                  {activeTrip.buddies.map((b) => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Splits selection checkboxes */}
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase text-slate-300 block">Split With</label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {activeTrip.buddies.map((b) => {
                                    const isIncluded = newExpenseSplit.includes(b.name);
                                    return (
                                      <button
                                        type="button"
                                        key={b.id}
                                        onClick={() => {
                                          if (newExpenseSplit.includes(b.name)) {
                                            setNewExpenseSplit(newExpenseSplit.filter(n => n !== b.name));
                                          } else {
                                            setNewExpenseSplit([...newExpenseSplit, b.name]);
                                          }
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                                          isIncluded ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                                        }`}
                                      >
                                        {isIncluded && <Check className="w-3 h-3" />}
                                        {b.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setIsAddingExpense(false)}
                                className="bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-xl text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold"
                              >
                                Save Expense
                              </button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>

                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center">Select active trip first.</p>
                  )}
                </section>
              )}

              {/* Perspective 3: Flight status searches dynamic tracker */}
              {activeTab === 'flights' && (
                <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-6">
                  
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <Plane className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-lg font-bold">Collaborative Flight Status Desk</h2>
                    </div>
                  </div>

                  {/* Flight input search panel */}
                  <form onSubmit={handleSearchFlight} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] uppercase text-indigo-200 font-bold">Trace Flight Number</p>
                      <input
                        required
                        value={flightSearchNumber}
                        onChange={(e) => setFlightSearchNumber(e.target.value)}
                        placeholder="e.g. NH117, JL005, DL850"
                        className="w-full bg-[#0a0f24]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        id="flight-lookup-input"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={flightLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl self-end transition-all flex items-center gap-2"
                      id="flight-lookup-submit"
                    >
                      {flightLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {flightLoading ? 'Querying Radar...' : 'Search Engine'}
                    </button>
                  </form>

                  {flightMessage && (
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-500/20 text-xs text-indigo-300">
                      {flightMessage}
                    </div>
                  )}

                  {/* Flight entries results display */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Boarding & Wings</h3>
                    
                    {!activeTrip || !activeTrip.flights || activeTrip.flights.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-8">Search flight number above to generate tracking logs.</p>
                    ) : (
                      activeTrip.flights.map((flight) => {
                        const isDelayed = flight.status === 'Delayed';
                        let statusColor = isDelayed ? 'bg-red-500/20 text-red-300 border-red-400/25' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/25';
                        if (flight.status === 'Boarding') statusColor = 'bg-blue-500/20 text-blue-300 border-blue-400/25';
                        if (flight.status === 'Scheduled') statusColor = 'bg-slate-500/20 text-slate-300 border-white/10';

                        return (
                          <div key={flight.id} className="bg-white/5 border border-white/10 rounded-[24px] p-5 space-y-4 hover:border-indigo-400/20 transition-all">
                            
                            {/* Card badge header */}
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{flight.airline}</span>
                                <h4 className="text-lg font-black font-mono tracking-tight">{flight.flightNumber}</h4>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                                {flight.status} {flight.delayMinutes ? `(+${flight.delayMinutes}m)` : ''}
                              </span>
                            </div>

                            {/* City layout route */}
                            <div className="flex justify-between items-center gap-2">
                              <div>
                                <p className="text-2xl font-black text-slate-100">{flight.departureCode}</p>
                                <p className="text-[10px] text-slate-400">{flight.departureCity}</p>
                                <p className="text-xs font-mono text-slate-200 mt-1">🕒 {flight.departureTime}</p>
                              </div>

                              <div className="flex-1 flex flex-col items-center px-4 relative">
                                <div className="text-[9px] text-indigo-300 font-mono mb-1">{flight.progress}% Progress</div>
                                <div className="w-full h-[2px] bg-white/10 relative rounded-full">
                                  <motion.div
                                    animate={{ left: `${flight.progress}%` }}
                                    className="absolute -top-[5px] -translate-x-1/2 text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                                  >
                                    ✈️
                                  </motion.div>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-2xl font-black text-white">{flight.arrivalCode}</p>
                                <p className="text-[10px] text-slate-400">{flight.arrivalCity}</p>
                                <p className="text-xs font-mono text-slate-200 mt-1">🕒 {flight.arrivalTime}</p>
                              </div>
                            </div>

                            {/* Gate detailed footer */}
                            {(flight.terminal || flight.gate) && (
                              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5 text-[10px] font-mono text-slate-400">
                                <div>Terminal: <span className="font-bold text-slate-200">{flight.terminal || 'Intl'}</span></div>
                                <div className="text-right">Gateway: <span className="font-bold text-emerald-300">{flight.gate || 'TBD'}</span></div>
                              </div>
                            )}

                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              )}

              {/* Perspective 4: AI Intelligent Curations Generator */}
              {activeTab === 'ai' && (
                <section className="bg-indigo-950/40 backdrop-blur-md border border-indigo-500/20 rounded-[32px] p-6 shadow-2xl space-y-6">
                  
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-300 to-indigo-200 bg-clip-text text-transparent">Gemini AI Insiders Planner</h2>
                  </div>

                  <p className="text-xs text-indigo-200 leading-relaxed">
                    Query Google Gemini directly server-side to construct a customized multi-day vacation. Your response will map out accurate relative coordinates so landmarks can be plotted beautifully in the custom 2D Map!
                  </p>

                  <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-indigo-200 font-bold block">Destination City</label>
                      <input
                        value={newTripDest}
                        onChange={(e) => setNewTripDest(e.target.value)}
                        placeholder="e.g. Paris, France"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        id="ai-dest-input"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-slate-300 font-bold block">Duration Days</label>
                        <select
                          value={aiDaysCount}
                          onChange={(e) => setAiDaysCount(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="1">1 Day Cruise</option>
                          <option value="2">2 Days Weekend</option>
                          <option value="3">3 Days Standard</option>
                          <option value="4">4 Days Explore</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-slate-300 font-bold block">Budget Cap (USD)</label>
                        <input
                          type="number"
                          value={aiBudgetLimit}
                          onChange={(e) => setAiBudgetLimit(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-slate-300 font-bold block">Insider Coordinates Style</label>
                        <div className="text-[10px] bg-slate-950 px-2 py-2 rounded-lg font-mono text-emerald-400">
                          🎯 Vector SVG Map (10-90)
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-indigo-200 font-bold block">Your Travel Desires / Style</label>
                      <textarea
                        value={aiPreferences}
                        onChange={(e) => setAiPreferences(e.target.value)}
                        placeholder="Traditional museums, local bakeries, Eiffel view strolls..."
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs h-16 text-white"
                      />
                    </div>

                    {aiGenerating ? (
                      <div className="py-2.5 text-center flex items-center justify-center gap-2.5 text-indigo-300 text-xs font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        <span>Curating live insider suggestions. Contacting Gemini models...</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleGenerateAIItinerary}
                        disabled={!newTripDest.trim()}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-indigo-600 hover:from-emerald-500 hover:to-indigo-700 disabled:from-slate-800 disabled:to-slate-800 text-white font-black text-xs rounded-xl transition-all shadow-lg"
                        id="ai-generate-submit"
                      >
                        Prompt Gemini AI Vacation Engine 🔮
                      </button>
                    )}

                    {aiSuccessMessage && (
                      <div className="bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs p-3 rounded-xl flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-400" />
                        <span>{aiSuccessMessage}</span>
                      </div>
                    )}

                  </div>
                </section>
              )}

            </div>

            {/* RIGHT SECTION: Interactive map coordinates & quick indicators (2/5 layout) */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Real SVG Interactive Map component mapping the current day bounds */}
              {activeTrip && currentDay ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs uppercase font-extrabold text-indigo-300 tracking-wider flex items-center gap-1.5 leading-none">
                      <MapPin className="w-4 h-4" /> Visual Map Co-ords
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">Day {currentDay.dayNumber} Spots</span>
                  </div>

                  <InteractiveMap
                    items={currentItems}
                    selectedItemId={selectedItemId}
                    onSelectItem={(id) => {
                      setSelectedItemId(id);
                      setActiveTab('itinerary'); // force itinerary tab to see Comments
                    }}
                    onAddPoint={handleMapAddPoint}
                  />

                  <p className="text-[10px] text-slate-400 italic text-center font-mono">
                    💡 Empty map point? Click anywhere on land features to plot customizable coordinates!
                  </p>
                </div>
              ) : (
                <div className="h-[300px] bg-white/5 border border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-2 p-6 text-center">
                  <Compass className="w-8 h-8 text-slate-500" />
                  <p className="text-xs text-slate-400">Collaborator map loader requires active trip selection.</p>
                </div>
              )}

              {/* Budget Quick Summary Card (Right Column) */}
              {activeTrip && (
                <div className="bg-indigo-600/10 backdrop-blur-md border border-white/10 rounded-[32px] p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Expenses Breakdown</span>
                    <span className="text-xs text-indigo-200/80 font-bold">${calculateTotalExpenses(activeTrip)} Spent</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Budget limit:</span>
                      <span className="font-bold text-white">${activeTrip.budgetLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Spent:</span>
                      <span className="font-bold text-emerald-300">${calculateTotalExpenses(activeTrip)}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between font-bold">
                      <span className="text-indigo-200">Balance:</span>
                      <span className={activeTrip.budgetLimit >= calculateTotalExpenses(activeTrip) ? 'text-emerald-300' : 'text-red-300'}>
                        ${activeTrip.budgetLimit - calculateTotalExpenses(activeTrip)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('budget');
                        setIsAddingExpense(true);
                      }}
                      className="w-full mt-2 bg-indigo-500/15 hover:bg-indigo-500/35 text-indigo-300 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                    >
                      View Budget Ledger & Splittings
                    </button>
                  </div>
                </div>
              )}

              {/* Real-time Notifications log ticker */}
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-5 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Live Logs Ticker
                  </span>
                  <span className="text-[10px] text-slate-400">Simulating active updates</span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No logging events yet. Simulating live activity soon...</p>
                  ) : (
                    notifications.map((note) => (
                      <div key={note.id} className="text-xs font-mono py-1.5 px-2 bg-slate-950/20 border border-white/5 rounded-xl break-words flex items-start gap-1 justify-between">
                        <span className="text-slate-300 tracking-tight leading-tight">{note.text}</span>
                        <span className="text-[9px] text-indigo-300 text-opacity-80 shrink-0 select-none">[{note.time}]</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* Adding manually customized Trip dialog overlay modal */}
      <AnimatePresence>
        {isAddingTrip && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#10132b]/95 border border-white/10 rounded-[32px] p-6 max-w-md w-full space-y-6 shadow-2xl relative"
              id="new-trip-modal"
            >
              <button
                onClick={() => setIsAddingTrip(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} /> Create Travel Plan
                </h3>
                <p className="text-xs text-slate-400">Initialize custom map routes manually, or leverage our advanced Gemini AI generator.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-indigo-200 font-bold block">Destination Country / City</label>
                  <input
                    required
                    value={newTripDest}
                    onChange={(e) => setNewTripDest(e.target.value)}
                    placeholder="e.g. Kyoto, Japan or London, UK"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    id="modal-dest-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-300 block">Initial Budget limit (USD)</label>
                  <input
                    type="number"
                    value={newTripBudget}
                    onChange={(e) => setNewTripBudget(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <p className="text-[10px] text-amber-300">💡 Leverage advanced automation: Click "Prompt Gemini AI Vacation Engine" to instantly structure a flawless multi-day holiday itinerary with custom interactive SVG coords pins, budget recommendations, and local insights!</p>
                  
                  <div className="flex gap-2 flex-col">
                    <button
                      type="button"
                      disabled={!newTripDest.trim() || aiGenerating}
                      onClick={() => {
                        setActiveTab('ai');
                        setIsAddingTrip(false);
                      }}
                      className="w-full py-2 px-4 bg-indigo-500/20 hover:bg-indigo-500/45 border border-indigo-400/30 rounded-xl text-xs font-bold text-indigo-200 transition-all text-center flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400 text-center" /> Prompt Gemini AI Assistant instead
                    </button>

                    <button
                      type="button"
                      disabled={!newTripDest.trim()}
                      onClick={handleCreateSimpleTrip}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10"
                    >
                      Manual Plan Itinerary
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



    </div>
  );
}
