"use client";

import { useState, useEffect } from 'react';
import FlightSelection from '@/components/flight-selection';
import SeatMap from '@/components/seat-map';
import BookingSummary from '@/components/booking-summary';
import Confirmation from '@/components/confirmation';
import type { Flight, Seat } from '@/lib/types';
import { useStore } from '@/lib/store';

type Step = 'flights' | 'seats' | 'summary' | 'confirmed';

export default function Home() {
  const [step, setStep] = useState<Step>('flights');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [userBookings, setUserBookings] = useState<Record<string, string>>({}); 
  
  // Use the global store
  const { flights, setFlights, updateSeatStatus, revertSeatStatus } = useStore();

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setStep('seats');
  };

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat);
    setStep('summary');
  };

  const handleBookingConfirm = () => {
    if (selectedFlight && selectedSeat) {
      // Update the seat status to 'taken' in the global store
      updateSeatStatus(selectedFlight.id, selectedSeat.id, 'taken');

      // Track the user's booking locally
      setUserBookings(prev => ({ ...prev, [selectedFlight.id]: selectedSeat.id }));
      
      console.log('Booking confirmed for:', { flight: selectedFlight.id, seat: selectedSeat.id });
      setStep('confirmed');
    }
  };

  const handleGoBack = () => {
    if (step === 'seats') {
      setSelectedFlight(null);
      setSelectedSeat(null);
      setStep('flights');
    } else if (step === 'summary') {
       if (selectedFlight && selectedSeat) {
         // Revert seat status to 'available' in the global store
         revertSeatStatus(selectedFlight.id, selectedSeat.id, 'available');
       }
      setSelectedSeat(null);
      setStep('seats');
    }
  };

  const handleNewBooking = () => {
    setSelectedFlight(null);
    setSelectedSeat(null);
    setStep('flights');
  }

  const renderStep = () => {
    switch(step) {
      case 'flights':
        return <FlightSelection flights={flights} onFlightSelect={handleFlightSelect} userBookings={userBookings} />;
      case 'seats':
        // Find the latest flight details from the store
        const currentFlight = flights.find(f => f.id === selectedFlight?.id) || null;
        return currentFlight && <SeatMap flight={currentFlight} onSeatSelect={handleSeatSelect} onGoBack={handleGoBack} />;
      case 'summary':
        return selectedFlight && selectedSeat && <BookingSummary flight={selectedFlight} seat={selectedSeat} onConfirm={handleBookingConfirm} onGoBack={handleGoBack} />;
      case 'confirmed':
        return selectedFlight && selectedSeat && <Confirmation flight={selectedFlight} seat={selectedSeat} onNewBooking={handleNewBooking} />;
      default:
        return <FlightSelection flights={flights} onFlightSelect={handleFlightSelect} userBookings={userBookings} />;
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