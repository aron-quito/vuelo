import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateInitialFlights } from './flight-data';
import type { Flight, Seat } from './types';

interface FlightState {
  flights: Flight[];
  setFlights: (flights: Flight[]) => void;
  updateSeatStatus: (flightId: string, seatId: string, newStatus: Seat['status'], passengerName?: string) => void;
  revertSeatStatus: (flightId: string, seatId: string) => void;
  isHydrated: boolean;
}

const initialFlights = generateInitialFlights();

export const useStore = create<FlightState>()(
  persist(
    (set, get) => ({
      flights: initialFlights,
      isHydrated: false,
      setFlights: (flights) => set({ flights }),
      
      updateSeatStatus: (flightId, seatId, newStatus, passengerName) => {
        set((state) => ({
          flights: state.flights.map((flight) => {
            if (flight.id === flightId) {
              const updatedSeats = flight.seats.map((seat) => {
                if (seat.id === seatId) {
                  const updatedSeat = { ...seat, status: newStatus };
                  if (newStatus === 'taken' && passengerName) {
                    updatedSeat.passengerName = passengerName;
                  }
                  if (newStatus === 'available') {
                    delete updatedSeat.passengerName;
                  }
                  return updatedSeat;
                }
                // When selecting a new seat, deselect any previously selected one
                if (newStatus === 'selected' && seat.status === 'selected') {
                  return { ...seat, status: 'available' };
                }
                return seat;
              });
              return { ...flight, seats: updatedSeats };
            }
            return flight;
          }),
        }));
      },
      
      revertSeatStatus: (flightId, seatId) => {
        set((state) => ({
            flights: state.flights.map(f => {
                if (f.id === flightId) {
                    const updatedSeats = f.seats.map(s => {
                        if (s.id === seatId && s.status === 'selected') {
                             return {...s, status: 'available' };
                        }
                        return s;
                    });
                    return {...f, seats: updatedSeats};
                }
                return f;
            })
        }))
      }
    }),
    {
      name: 'flight-booking-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
      // Only persist the 'flights' part of the state
      partialize: (state) => ({ flights: state.flights }),
    }
  )
);
