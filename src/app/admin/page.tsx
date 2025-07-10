
"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Flight } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Armchair, User, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from '@/components/ui/skeleton';

const AdminSeatMap = ({ flight }: { flight: Flight }) => {
  const seatRows = [];
  for (let i = 0; i < flight.seats.length; i += flight.plane.seatsPerRow) {
    seatRows.push(flight.seats.slice(i, i + flight.plane.seatsPerRow));
  }
  const aisleIndex = Math.ceil(flight.plane.seatsPerRow / 2);

  const totalSeats = flight.seats.length;
  const takenSeats = flight.seats.filter(s => s.status === 'taken').length;
  const availableSeats = totalSeats - takenSeats;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flight {flight.id}: {flight.from} to {flight.to}</CardTitle>
        <div className="text-sm text-muted-foreground">
          {takenSeats} / {totalSeats} seats taken. {availableSeats} available.
        </div>
      </CardHeader>
      <CardContent>
      <TooltipProvider>
        <div className="p-2 bg-muted/50 rounded-lg w-full overflow-x-auto">
          <div className="flex flex-col gap-2 min-w-max">
            {seatRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 justify-center items-center">
                <span className="w-6 text-center font-mono text-muted-foreground text-xs">{rowIndex + 1}</span>
                <div className="flex gap-1.5">
                  {row.map((seat, seatIndex) => (
                    <div key={seat.id} className="flex">
                      {seatIndex === aisleIndex && <div className="w-6" aria-hidden="true"></div>}
                       <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            aria-label={`Seat ${seat.id}, status: ${seat.status}`}
                            className={cn(
                              "w-7 h-7 rounded-md flex items-center justify-center",
                              seat.status === 'available' && "bg-primary/20 text-primary",
                              seat.status === 'taken' && "bg-muted text-muted-foreground",
                            )}
                          >
                            <Armchair size={16} />
                          </div>
                        </TooltipTrigger>
                        {seat.status === 'taken' && seat.passengerName && (
                          <TooltipContent>
                            <p>Booked by: {seat.passengerName}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default function AdminPage() {
  const { flights, isLoading, fetchFlights } = useStore();

  useEffect(() => {
    fetchFlights();
    // For a true real-time experience, you would use WebSockets here.
    // For now, we'll add a manual refresh and an interval poll as a simulation.
    const interval = setInterval(() => {
      fetchFlights();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [fetchFlights]);

  return (
    <main className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-6xl mb-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2 text-lg">Seat status is refreshed automatically</p>
            </div>
            <div className="flex items-center gap-4">
                <Button onClick={() => fetchFlights()} variant="outline" size="icon" disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
                <Button asChild>
                    <Link href="/">Go to Booking Page</Link>
                </Button>
            </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-6 justify-start">
            <div className="flex items-center gap-2 text-sm"><Armchair size={16} className="text-primary/80"/> Available</div>
            <div className="flex items-center gap-2 text-sm"><XCircle size={16} className="text-muted-foreground"/> Taken</div>
            <div className="flex items-center gap-2 text-sm"><User size={16} className="text-muted-foreground"/> Hover for passenger</div>
        </div>
      </header>
      
      <div className="w-full max-w-6xl space-y-6">
        {isLoading && flights.length === 0 ? (
           <div className="space-y-4">
             <Skeleton className="h-48 w-full" />
             <Skeleton className="h-48 w-full" />
           </div>
        ) : (
          flights.length > 0 ? (
            flights.map(flight => <AdminSeatMap key={flight.id} flight={flight} />)
          ) : (
            <p className="text-center text-muted-foreground">No flights found.</p>
          )
        )}
      </div>
    </main>
  );
}
