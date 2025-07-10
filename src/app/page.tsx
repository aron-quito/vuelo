"use client";

import { useState, useEffect } from 'react';
import FlightSelection from '@/components/flight-selection';
import SeatMap from '@/components/seat-map';
import BookingSummary from '@/components/booking-summary';
import Confirmation from '@/components/confirmation';
import type { Flight, Seat } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';

type Step = 'flights' | 'seats' | 'summary' | 'confirmed';

export default function Home() {
  const [step, setStep] = useState<Step>('flights');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  
  // Use the store hooks to get data and actions
  const flights = useStore((state) => state.flights);
  const updateSeatStatus = useStore((state) => state.updateSeatStatus);
  const revertSeatStatus = useStore((state) => state.revertSeatStatus);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setStep('seats');
  };

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat);
    setStep('summary');
  };

  const handleBookingConfirm = (passengerName: string) => {
    if (selectedFlight && selectedSeat) {
      updateSeatStatus(selectedFlight.id, selectedSeat.id, 'taken', passengerName);
      // We need to find the latest state of the seat for the confirmation page
      const updatedFlight = useStore.getState().flights.find(f => f.id === selectedFlight.id);
      const confirmedSeat = updatedFlight?.seats.find(s => s.id === selectedSeat.id);
      setSelectedSeat(confirmedSeat || null);
      setStep('confirmed');
    }
  };

  const handleGoBack = () => {
    if (step === 'summary') {
      if (selectedFlight && selectedSeat) {
        // Revert status only if it was 'selected'
        const currentSeatState = flights.find(f=>f.id === selectedFlight.id)?.seats.find(s=>s.id === selectedSeat.id);
        if(currentSeatState?.status === 'selected') {
          revertSeatStatus(selectedFlight.id, selectedSeat.id);
        }
      }
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
    setStep('flights');
  }

  const renderStep = () => {
    if (!isClient) {
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
        return selectedFlight && selectedSeat && <Confirmation flight={selectedFlight} seat={selectedSeat} onNewBooking={handleNewBooking} />;
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
