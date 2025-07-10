import type { Flight, Seat } from './types';

const generateSeats = (rows: number, seatsPerRow: number): Seat[] => {
  const seats: Seat[] = [];
  const seatLetters = 'ABCDEF';
  for (let row = 1; row <= rows; row++) {
    for (let i = 0; i < seatsPerRow; i++) {
      seats.push({
        id: `${row}${seatLetters[i]}`,
        status: 'available',
      });
    }
  }
  return seats;
};

const mockFlightDetails = [
  { id: 'KT123', from: 'New York (JFK)', to: 'London (LHR)', departureTime: '2024-10-28 08:00', arrivalTime: '2024-10-28 20:00', price: 750, plane: { rows: 15, seatsPerRow: 6 } },
  { id: 'KT456', from: 'Paris (CDG)', to: 'Tokyo (HND)', departureTime: '2024-10-29 14:30', arrivalTime: '2024-10-30 09:00', price: 1200, plane: { rows: 20, seatsPerRow: 6 } },
  { id: 'KT789', from: 'Sydney (SYD)', to: 'Los Angeles (LAX)', departureTime: '2024-11-01 22:00', arrivalTime: '2024-11-01 17:00', price: 980, plane: { rows: 18, seatsPerRow: 6 } },
];


export const generateInitialFlights = (): Flight[] => {
  return mockFlightDetails.map(flightInfo => ({
    ...flightInfo,
    seats: generateSeats(flightInfo.plane.rows, flightInfo.plane.seatsPerRow),
  }));
};
