"use client"

import { useState, useEffect } from "react";
import type { Flight } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaneTakeoff, Clock, Landmark, DollarSign } from "lucide-react";

const mockFlights: Flight[] = [
  { id: 'KT123', from: 'New York (JFK)', to: 'London (LHR)', departureTime: '2024-10-28 08:00', arrivalTime: '2024-10-28 20:00', price: 750, plane: { rows: 15, seatsPerRow: 6 } },
  { id: 'KT456', from: 'Paris (CDG)', to: 'Tokyo (HND)', departureTime: '2024-10-29 14:30', arrivalTime: '2024-10-30 09:00', price: 1200, plane: { rows: 20, seatsPerRow: 6 } },
  { id: 'KT789', from: 'Sydney (SYD)', to: 'Los Angeles (LAX)', departureTime: '2024-11-01 22:00', arrivalTime: '2024-11-01 17:00', price: 980, plane: { rows: 18, seatsPerRow: 6 } },
];

interface FlightSelectionProps {
  onFlightSelect: (flight: Flight) => void;
}

const FlightCard = ({ flight, onFlightSelect }: { flight: Flight, onFlightSelect: (flight: Flight) => void }) => {
  const [departure, setDeparture] = useState(flight.departureTime);
  const [arrival, setArrival] = useState(flight.arrivalTime);

  useEffect(() => {
    setDeparture(new Date(flight.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }));
    setArrival(new Date(flight.arrivalTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }));
  }, [flight.departureTime, flight.arrivalTime]);

  return (
    <Card className="transition-all hover:shadow-lg hover:shadow-primary/20">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <PlaneTakeoff className="text-primary" />
            Flight {flight.id}
          </span>
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
              <DollarSign size={24} /> {flight.price}
          </div>
        </CardTitle>
        <CardDescription>{flight.from} to {flight.to}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Landmark className="text-muted-foreground" size={16} />
          <div>
            <p className="font-semibold">From</p>
            <p>{flight.from}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Landmark className="text-muted-foreground" size={16} />
          <div>
            <p className="font-semibold">To</p>
            <p>{flight.to}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="text-muted-foreground" size={16} />
          <div>
            <p className="font-semibold">Departure</p>
            <p>{departure}</p>
          </div>
        </div>
          <div className="flex items-center gap-2">
          <Clock className="text-muted-foreground" size={16} />
          <div>
            <p className="font-semibold">Arrival</p>
            <p>{arrival}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onFlightSelect(flight)} className="w-full">
          Select Seats
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function FlightSelection({ onFlightSelect }: FlightSelectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-primary/80">Select Your Flight</h2>
      {mockFlights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} onFlightSelect={onFlightSelect} />
      ))}
    </div>
  );
}