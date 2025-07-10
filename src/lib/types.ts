export interface Flight {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  plane: {
    rows: number;
    seatsPerRow: number;
  };
  seats: Seat[];
}

export interface Seat {
  id: string; // e.g., "1A"
  status: 'available' | 'taken' | 'selected';
  passengerName?: string;
}
