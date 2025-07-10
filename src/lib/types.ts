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
}

export interface Seat {
  id: string; // e.g., "1A"
  status: 'available' | 'taken' | 'selected';
}
