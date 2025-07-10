
import { create } from 'zustand';
import type { Flight, Seat } from './types';

interface FlightState {
  flights: Flight[];
  isLoading: boolean;
  error: string | null;
  fetchFlights: () => Promise<void>;
  bookSeat: (flightId: string, seatId: string, passengerName: string) => Promise<boolean>;
}

// The store now manages client-side state like loading/error and caches data from the backend.
// It is no longer the single source of truth, but a client-side interface to the backend API.
export const useStore = create<FlightState>()((set) => ({
  flights: [],
  isLoading: true,
  error: null,
  
  // Fetches all flight data from the backend
  fetchFlights: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real deployment, this URL would be your Render backend URL
      const response = await fetch('/api/flights'); 
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }
      const flights: Flight[] = await response.json();
      set({ flights, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ isLoading: false, error: errorMessage });
    }
  },
  
  // Sends a booking request to the backend
  bookSeat: async (flightId, seatId, passengerName) => {
    try {
      // In a real deployment, this URL would be your Render backend URL
      const response = await fetch(`/api/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flightId, seatId, passengerName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Booking failed');
      }
      
      // After a successful booking, refresh the flight data to show the change
      const fetchFlights = useStore.getState().fetchFlights;
      await fetchFlights();
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Booking error:", errorMessage);
      set({ error: errorMessage });
      return false;
    }
  },
}));
