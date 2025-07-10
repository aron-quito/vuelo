"use client";

import { useState } from 'react';
import FlightSelection from '@/components/flight-selection';
import SeatMap from '@/components/seat-map';
import BookingSummary from '@/components/booking-summary';
import Confirmation from '@/components/confirmation';
import type { Flight, Seat } from '@/lib/types';

type Step = 'flights' | 'seats' | 'summary' | 'confirmed';

export default function Home() {
  const [step, setStep] = useState<Step>('flights');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setStep('seats');
  };

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat);
    setStep('summary');
  };

  const handleBookingConfirm = () => {
    // In a real application, this would involve an API call to finalize the booking.
    // For this demonstration, we will just move to the confirmation step.
    if(selectedFlight && selectedSeat) {
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
        return <FlightSelection onFlightSelect={handleFlightSelect} />;
      case 'seats':
        return selectedFlight && <SeatMap flight={selectedFlight} onSeatSelect={handleSeatSelect} onGoBack={handleGoBack} />;
      case 'summary':
        return selectedFlight && selectedSeat && <BookingSummary flight={selectedFlight} seat={selectedSeat} onConfirm={handleBookingConfirm} onGoBack={handleGoBack} />;
      case 'confirmed':
        return selectedFlight && selectedSeat && <Confirmation flight={selectedFlight} seat={selectedSeat} onNewBooking={handleNewBooking} />;
      default:
        return <FlightSelection onFlightSelect={handleFlightSelect} />;
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
