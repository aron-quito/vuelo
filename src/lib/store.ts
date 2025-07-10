
import { create } from 'zustand';
import type { Flight, Seat } from './types';

interface FlightState {
  flights: Flight[];
  isLoading: boolean;
  error: string | null;
  fetchFlights: () => Promise<void>;
  bookSeat: (flightId: string, seatId: string, passengerName: string) => Promise<boolean>;
}

// Adapta la estructura de datos del backend a la que espera el frontend.
const adaptFlightsData = (data: any): Flight[] => {
  return Object.entries(data).map(([flightId, flightData]: [string, any]) => {
    const seats = Object.entries(flightData.asientos).map(([seatId, passengerName]) => ({
      id: seatId,
      status: passengerName ? 'taken' : 'available',
      passengerName: passengerName as string | undefined,
    }));
    
    // Asumimos algunos datos estáticos que no vienen del backend,
    // puedes expandir tu backend para que también los proporcione.
    const details = staticFlightDetails[flightId] || {};

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
      seats,
    };
  });
};

// Datos estáticos para enriquecer la respuesta del backend
const staticFlightDetails: { [key: string]: Partial<Flight> } = {
    "vuelo_123": { from: 'New York (JFK)', to: 'London (LHR)', departureTime: '2024-10-28 08:00', arrivalTime: '2024-10-28 20:00', price: 750, plane: { rows: 2, seatsPerRow: 3 } },
    // Añade más detalles si tu backend tiene más vuelos
};


export const useStore = create<FlightState>()((set, get) => ({
  flights: [],
  isLoading: true,
  error: null,
  
  fetchFlights: async () => {
    set({ isLoading: true, error: null });
    try {
      // Usamos el endpoint /consultar que definiste en server.py
      const response = await fetch('/api/consultar');
      if (!response.ok) {
        throw new Error('Failed to fetch flights from backend');
      }
      const data = await response.json();
      const adaptedFlights = adaptFlightsData(data);
      set({ flights: adaptedFlights, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ isLoading: false, error: errorMessage });
    }
  },
  
  bookSeat: async (flightId, seatId, passengerName) => {
    try {
      // Tu backend espera datos de formulario, así que usamos URLSearchParams
      const body = new URLSearchParams();
      body.append('vuelo', flightId);
      body.append('asiento', seatId);
      body.append('nombre', passengerName);

      // Usamos el endpoint /reservar que definiste en server.py
      const response = await fetch(`/api/reservar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
         const errorText = await response.text();
        throw new Error(errorText || 'Booking failed');
      }
      
      // Después de una reserva exitosa, actualizamos los datos
      await get().fetchFlights();
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Booking error:", errorMessage);
      set({ error: errorMessage });
      return false;
    }
  },
}));

