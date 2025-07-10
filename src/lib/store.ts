import { create } from 'zustand';
import type { Flight, Seat } from './types'; // Importamos los tipos

interface FlightState {
  flights: Flight[];
  isLoading: boolean;
  error: string | null;
  fetchFlights: () => Promise<void>;
  bookSeat: (flightId: string, seatId: string, passengerName: string) => Promise<boolean>;
  cancelBooking: (flightId: string, seatId: string) => Promise<boolean>;
  resetAllSeats: () => Promise<boolean>;
}

// Asegúrate de que esta función adaptFlightsData coincida con la estructura de Flight[]
const adaptFlightsData = (data: any): Flight[] => {
  const staticFlightDetails: { [key: string]: Partial<Flight> } = {
      "vuelo_123": { from: 'New York (JFK)', to: 'London (LHR)', departureTime: '2024-10-28T08:00:00Z', arrivalTime: '2024-10-28T20:00:00Z', price: 750, plane: { rows: 4, seatsPerRow: 4 } },
      "vuelo_456": { from: 'London (LHR)', to: 'Paris (CDG)', departureTime: '2024-10-29T10:00:00Z', arrivalTime: '2024-10-29T12:00:00Z', price: 150, plane: { rows: 4, seatsPerRow: 2 } }, // Detalles para vuelo_456
    };

  return Object.entries(data).map(([flightId, flightData]: [string, any]) => {
    const seats: Seat[] = Object.entries(flightData.asientos).map(([seatId, passengerName]) => ({
      id: seatId,
      // Asegúrate de que 'available' y 'taken' coincidan con los literales de cadena en tu tipo Seat
      status: passengerName ? 'taken' : 'available',
      passengerName: passengerName as string | undefined,
    }));

    const details = staticFlightDetails[flightId] || {};

    // Asegúrate de que la estructura del objeto retornado coincida exactamente con la interfaz Flight
    return {
      id: flightId,
      from: details.from || 'Unknown Origin',
      to: details.to || 'Unknown Destination',
      departureTime: details.departureTime || new Date().toISOString(),
      arrivalTime: details.arrivalTime || new Date().toISOString(),
      price: details.price || 0,
      plane: {
          rows: details.plane?.rows || 1,
          seatsPerRow: details.plane?.seatsPerRow || 6,
      },
      seats, // Asegúrate de que esto sea el array de objetos Seat
    };
  });
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';


export const useStore = create<FlightState>()((set, get) => ({
  // Estado inicial
  flights: [],
  isLoading: true,
  error: null,

  // Definiciones ÚNICAS y completas de las funciones
  fetchFlights: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${BACKEND_URL}/api/vuelos`);
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch flights: ${response.status} ${response.statusText} - ${errorBody}`);
      }
      const data = await response.json();
      const adaptedFlights = adaptFlightsData(data);
      set({ flights: adaptedFlights, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching flights';
      console.error("Fetch flights error:", errorMessage);
      set({ isLoading: false, error: errorMessage });
    }
  },

  bookSeat: async (flightId, seatId, passengerName) => {
    set({ error: null });
    try {
      const body = new URLSearchParams();
      body.append('vuelo', flightId);
      body.append('asiento', seatId);
      body.append('nombre', passengerName);

      const response = await fetch(`${BACKEND_URL}/api/reservar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        throw new Error(result.mensaje || 'Booking failed');
      }

      await get().fetchFlights();
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during booking';
      console.error("Booking error:", errorMessage);
      set({ error: errorMessage });
      return false;
    }
  },

  cancelBooking: async (flightId, seatId) => {
      set({ error: null });
      try {
          const body = new URLSearchParams();
          body.append('vuelo', flightId);
          body.append('asiento', seatId);

          const response = await fetch(`${BACKEND_URL}/api/eliminar`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: body.toString(),
          });

          const result = await response.json();

          if (!response.ok || result.status === 'error') {
              throw new Error(result.mensaje || 'Cancellation failed');
          }

          await get().fetchFlights();
          return true;

      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during cancellation';
          console.error("Cancellation error:", errorMessage);
          set({ error: errorMessage });
          return false;
      }
  },

  resetAllSeats: async () => {
      set({ error: null });
      try {
          const response = await fetch(`${BACKEND_URL}/api/reiniciar`, {
              method: 'POST',
          });

          const result = await response.json();

          if (!response.ok || result.status === 'error') {
               throw new Error(result.mensaje || 'Reset failed');
          }

          await get().fetchFlights();
          return true;

      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during reset';
          console.error("Reset error:", errorMessage);
          set({ error: errorMessage });
          return false;
      }
  }
}));
