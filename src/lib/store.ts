import { create } from 'zustand';
import { generateInitialFlights } from './flight-data';
import type { Flight, Seat } from './types';

interface FlightState {
  flights: Flight[];
  setFlights: (flights: Flight[]) => void;
  updateSeatStatus: (flightId: string, seatId: string, newStatus: Seat['status']) => void;
  revertSeatStatus: (flightId: string, seatId: string) => void;
}

const initialFlights = generateInitialFlights();

export const useStore = create<FlightState>((set, get) => ({
  flights: initialFlights,
  setFlights: (flights) => set({ flights }),
  
  updateSeatStatus: (flightId, seatId, newStatus) => {
    set((state) => ({
      flights: state.flights.map((flight) => {
        if (flight.id === flightId) {
          const updatedSeats = flight.seats.map((seat) => {
            if (seat.id === seatId) {
              return { ...seat, status: newStatus };
            }
            // if we are selecting a new seat, deselect any previously selected one
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
}));
