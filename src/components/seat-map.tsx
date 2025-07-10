"use client"

import React, { useState, useMemo } from "react";
import type { Flight, Seat } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Armchair, ArrowLeft, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  flight: Flight;
  onSeatSelect: (seat: Seat) => void;
  onGoBack: () => void;
  setAllFlights: React.Dispatch<React.SetStateAction<Flight[]>>;
}

export default function SeatMap({ flight, onSeatSelect, onGoBack, setAllFlights }: SeatMapProps) {
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'taken') return;

    const newSelectedSeatId = selectedSeatId === seat.id ? null : seat.id;
    
    // Update the local seat status for immediate visual feedback
    setAllFlights(currentFlights =>
      currentFlights.map(f => {
        if (f.id === flight.id) {
          const updatedSeats = f.seats.map(s => {
            // Deselect old seat
            if (s.id === selectedSeatId && s.status === 'selected') {
              return { ...s, status: 'available' };
            }
            // Select new seat
            if (s.id === seat.id) {
              return { ...s, status: newSelectedSeatId ? 'selected' : 'available' };
            }
            return s;
          });
          return { ...f, seats: updatedSeats };
        }
        return f;
      })
    );
    
    setSelectedSeatId(newSelectedSeatId);
  };

  const seatRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < flight.seats.length; i += flight.plane.seatsPerRow) {
      rows.push(flight.seats.slice(i, i + flight.plane.seatsPerRow));
    }
    return rows;
  }, [flight.seats, flight.plane.seatsPerRow]);

  const aisleIndex = Math.ceil(flight.plane.seatsPerRow / 2);
  const finalSelectedSeat = flight.seats.find(s => s.id === selectedSeatId);

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <button onClick={onGoBack} className="p-1 rounded-full hover:bg-accent/20 transition-colors">
                <ArrowLeft/>
            </button>
            Select Your Seat
        </CardTitle>
        <CardDescription>Flight {flight.id} from {flight.from} to {flight.to}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="p-4 bg-muted/50 rounded-lg w-full max-w-md md:max-w-xl lg:max-w-2xl overflow-x-auto">
          <div className="flex flex-col gap-3 min-w-max p-4">
            {seatRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 justify-center items-center">
                 <span className="w-8 text-center font-mono text-muted-foreground">{rowIndex + 1}</span>
                 <div className="flex gap-2">
                    {row.map((seat, seatIndex) => (
                        <React.Fragment key={seat.id}>
                          {seatIndex === aisleIndex && <div className="w-8" aria-hidden="true"></div>}
                          <button
                            aria-label={`Seat ${seat.id}, status: ${seat.status}`}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'taken'}
                            className={cn(
                                "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                seat.status === 'available' && "bg-primary/20 text-primary hover:bg-primary/40",
                                seat.status === 'taken' && "bg-muted text-muted-foreground cursor-not-allowed",
                                seat.status === 'selected' && "bg-accent text-accent-foreground scale-110 ring-2 ring-accent ring-offset-background",
                            )}
                          >
                            <Armchair size={20} />
                          </button>
                        </React.Fragment>
                    ))}
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <div className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-primary/80"/> Available</div>
            <div className="flex items-center gap-2 text-sm"><XCircle size={16} className="text-muted-foreground"/> Taken</div>
            <div className="flex items-center gap-2 text-sm"><Armchair size={16} className="text-accent"/> Selected</div>
        </div>

      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={() => onSeatSelect(finalSelectedSeat!)} disabled={!finalSelectedSeat}>
          Confirm Seat {finalSelectedSeat?.id}
        </Button>
      </CardFooter>
    </Card>
  );
}
