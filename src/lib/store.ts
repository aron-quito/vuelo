import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateInitialFlights } from './flight-data';
import type { Flight, Seat } from './types';

interface FlightState {
  flights: Flight[];
  // "Read" operation
  getFlights: () => Flight[];
  // "Write" operations
  updateSeatStatus: (flightId: string, seatId: string, newStatus: Seat['status'], passengerName?: string) => void;
  revertSeatStatus: (flightId: string, seatId: string) => void;
}

const initialFlights = generateInitialFlights();

// This store now acts as our "single source of truth", similar to the VuelosData class.
// The functions inside are analogous to the methods that acquire locks.
export const useStore = create<FlightState>()(
  persist(
    (set, get) => ({
      flights: initialFlights,
      
      // A "read" operation. In a real backend, this would be a reader function.
      getFlights: () => {
        return get().flights;
      },
      
      // A "write" operation. In a real backend, this would be a writer function.
      updateSeatStatus: (flightId, seatId, newStatus, passengerName) => {
        set((state) => {
          const newFlights = state.flights.map((flight) => {
            if (flight.id === flightId) {
              const updatedSeats = flight.seats.map((seat) => {
                // When selecting a new seat, deselect any previously selected one in this session
                if (newStatus === 'selected' && seat.status === 'selected') {
                  return { ...seat, status: 'available' };
                }
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
                return seat;
              });
              return { ...flight, seats: updatedSeats };
            }
            return flight;
          });
          return { flights: newFlights };
        });
      },
      
      // A "write" operation to revert a temporary selection.
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
      name: 'flight-booking-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ flights: state.flights }),
    }
  )
);
