import { create } from 'zustand';
import type { Flight, Seat } from './types';

interface FlightState {
  flights: Flight[];
  isLoading: boolean;
  error: string | null;
  fetchFlights: () => Promise<void>;
  bookSeat: (flightId: string, seatId: string, passengerName: string) => Promise<boolean>;
  // Opcional: Añadir funciones para cancelar y reiniciar si la UI lo permite
  // cancelBooking: (flightId: string, seatId: string) => Promise<boolean>;
  // resetAllSeats: () => Promise<boolean>;
}

// Adapta la estructura de datos del backend a la que espera el frontend.
// La estructura esperada del backend para /api/vuelos es como:
// { "vuelo_123": { "asientos": { "A1": "Nombre", "A2": null, ... } } }
const adaptFlightsData = (data: any): Flight[] => {
  // Usamos datos estáticos para la información del vuelo (origen, destino, precio, etc.)
  // Puedes expandir tu backend para que también proporcione estos detalles por vuelo.
  const staticFlightDetails: { [key: string]: Partial<Flight> } = {
      "vuelo_123": { from: 'New York (JFK)', to: 'London (LHR)', departureTime: '2024-10-28T08:00:00Z', arrivalTime: '2024-10-28T20:00:00Z', price: 750, plane: { rows: 2, seatsPerRow: 3 } },
      // Añade más detalles si tu backend tiene más vuelos en el futuro
  };

  return Object.entries(data).map(([flightId, flightData]: [string, any]) => {
    const seats = Object.entries(flightData.asientos).map(([seatId, passengerName]) => ({
      id: seatId,
      status: passengerName ? 'taken' : 'available',
      passengerName: passengerName as string | undefined,
    }));

    const details = staticFlightDetails[flightId] || {};

    return {
      id: flightId,
      from: details.from || 'Unknown Origin',
      to: details.to || 'Unknown Destination',
      departureTime: details.departureTime || new Date().toISOString(),
      arrivalTime: details.arrivalTime || new Date().toISOString(),
      price: details.price || 0,
      plane: {
          rows: details.plane?.rows || 1, // Asegúrate de que tu UI pueda manejar diferentes configuraciones de filas/asientos
          seatsPerRow: details.plane?.seatsPerRow || 6,
      },
      seats,
    };
  });
};


export const useStore = create<FlightState>()((set, get) => ({
  flights: [],
  isLoading: true,
  error: null,

  fetchFlights: async () => {
    set({ isLoading: true, error: null });
    try {
      // *** CAMBIO: Usamos el endpoint correcto para consultar vuelos ***
      const response = await fetch('/api/vuelos');
      if (!response.ok) {
        // Intenta leer un mensaje de error del cuerpo si está disponible
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
    set({ error: null }); // Limpiar errores anteriores antes de intentar reservar
    try {
      // Tu backend espera datos de formulario o JSON.
      // Mantendremos form-data ya que es lo que el código original usaba.
      const body = new URLSearchParams();
      body.append('vuelo', flightId);
      body.append('asiento', seatId);
      body.append('nombre', passengerName);

      // *** CAMBIO: Usamos el endpoint correcto para reservar asientos ***
      const response = await fetch(`/api/reservar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const result = await response.json(); // Esperamos un JSON de respuesta

      if (!response.ok || result.status === 'error') {
        // *** MEJORA: Leer el mensaje de error del JSON de respuesta ***
        throw new Error(result.mensaje || 'Booking failed');
      }

      // Después de una reserva exitosa, actualizamos los datos llamando a fetchFlights
      await get().fetchFlights();
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during booking';
      console.error("Booking error:", errorMessage);
      set({ error: errorMessage });
      // Propagar el error para que el componente que llama pueda manejarlo si es necesario
      // throw new Error(errorMessage); // Podrías lanzar el error si quieres que el componente lo capture
      return false; // Retornar false para indicar que la reserva falló
    }
  },

  // Puedes añadir funciones similares para cancelar y reiniciar si la UI las necesita
  // cancelBooking: async (flightId, seatId) => { /* ... */ },
  // resetAllSeats: async () => { /* ... */ },

}));
