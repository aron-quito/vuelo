import { create } from 'zustand';
import { generateInitialFlights } from './flight-data';
import type { Flight, Seat } from './types';

interface FlightState {
  flights: Flight[];
  setFlights: (flights: Flight[]) => void;
  updateSeatStatus: (flightId: string, seatId: string, newStatus: Seat['status']) => void;
  revertSeatStatus: (flightId: string, seatId: string, newStatus: Seat['status']) => void;
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
            return seat;
          });
          return { ...flight, seats: updatedSeats };
        }
        return flight;
      }),
    }));
  },
  
  revertSeatStatus: (flightId, seatId, newStatus) => {
    set((state) => ({
        flights: state.flights.map(f => {
            if (f.id === flightId) {
                const updatedSeats = f.seats.map(s => {
                    if (s.id === seatId && s.status !== 'taken') {
                         return {...s, status: newStatus };
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