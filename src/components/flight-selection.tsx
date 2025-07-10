"use client"

import { useState, useEffect } from "react";
import type { Flight } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaneTakeoff, Clock, Landmark, DollarSign } from "lucide-react";

interface FlightCardProps {
  flight: Flight;
  onFlightSelect: (flight: Flight) => void;
  isBooked: boolean;
}

const FlightCard = ({ flight, onFlightSelect, isBooked }: FlightCardProps) => {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');

  useEffect(() => {
    setDeparture(new Date(flight.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }));
    setArrival(new Date(flight.arrivalTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }));
  }, [flight.departureTime, flight.arrivalTime]);

  return (
    <Card className={`transition-all ${isBooked ? 'opacity-50' : 'hover:shadow-lg hover:shadow-primary/20'}`}>
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
        <Button onClick={() => onFlightSelect(flight)} className="w-full" disabled={isBooked}>
          {isBooked ? 'Already Booked' : 'Select Seats'}
        </Button>
      </CardFooter>
    </Card>
  )
}

interface FlightSelectionProps {
  flights: Flight[];
  onFlightSelect: (flight: Flight) => void;
  userBookings: Record<string, string>;
}

export default function FlightSelection({ flights, onFlightSelect, userBookings }: FlightSelectionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-primary/80">Select Your Flight</h2>
      {flights.length === 0 ? (
        <p className="text-center text-muted-foreground">Loading flights...</p>
      ) : (
        flights.map((flight) => (
          <FlightCard 
            key={flight.id} 
            flight={flight} 
            onFlightSelect={onFlightSelect}
            isBooked={!!userBookings[flight.id]} 
          />
        ))
      )}
    </div>
  );
}
