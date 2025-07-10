
"use client";

import { useState, useEffect } from 'react';
import FlightSelection from '@/components/flight-selection';
import SeatMap from '@/components/seat-map';
import BookingSummary from '@/components/booking-summary';
import Confirmation from '@/components/confirmation';
import type { Flight, Seat } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type Step = 'flights' | 'seats' | 'summary' | 'confirmed';

export default function Home() {
  const [step, setStep] = useState<Step>('flights');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState<{ flight: Flight, seat: Seat } | null>(null);

  const { flights, isLoading, error, fetchFlights, bookSeat } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error,
      });
    }
  }, [error, toast]);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setStep('seats');
  };

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat);
    setStep('summary');
  };

  const handleBookingConfirm = async (passengerName: string) => {
    if (selectedFlight && selectedSeat) {
      const success = await bookSeat(selectedFlight.id, selectedSeat.id, passengerName);
      if (success) {
        // Prepare details for the confirmation screen
        setConfirmedBookingDetails({ 
          flight: selectedFlight, 
          seat: { ...selectedSeat, passengerName }
        });
        setStep('confirmed');
      }
    }
  };

  const handleGoBack = () => {
    if (step === 'summary') {
      setSelectedSeat(null);
      setStep('seats');
    } else if (step === 'seats') {
      setSelectedFlight(null);
      setSelectedSeat(null);
      setStep('flights');
    }
  };

  const handleNewBooking = () => {
    setSelectedFlight(null);
    setSelectedSeat(null);
    setConfirmedBookingDetails(null);
    setStep('flights');
    fetchFlights(); // Refresh flights for new booking
  }

  const renderStep = () => {
    if (isLoading && flights.length === 0) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3 mx-auto" />
          <div className="space-y-4">
             <Skeleton className="h-48 w-full" />
             <Skeleton className="h-48 w-full" />
          </div>
        </div>
      )
    }

    switch(step) {
      case 'flights':
        return <FlightSelection flights={flights} onFlightSelect={handleFlightSelect} />;
      case 'seats':
        const currentFlight = flights.find(f => f.id === selectedFlight?.id) || null;
        return currentFlight && <SeatMap flight={currentFlight} onSeatSelect={handleSeatSelect} onGoBack={handleGoBack} />;
      case 'summary':
        return selectedFlight && selectedSeat && <BookingSummary flight={selectedFlight} seat={selectedSeat} onConfirm={handleBookingConfirm} onGoBack={handleGoBack} />;
      case 'confirmed':
        return confirmedBookingDetails && <Confirmation flight={confirmedBookingDetails.flight} seat={confirmedBookingDetails.seat} onNewBooking={handleNewBooking} />;
      default:
        return <FlightSelection flights={flights} onFlightSelect={handleFlightSelect} />;
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <header className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">Kтари Airlines</h1>
        <p className="text-muted-foreground mt-2 text-lg">Your journey begins here.</p>
      </header>
      
      <div className="w-full max-w-5xl">
        {renderStep()}
      </div>
    </main>
  );
}
