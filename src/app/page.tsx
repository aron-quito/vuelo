"use client";

import { useState, useEffect } from 'react';
import FlightSelection from '@/components/flight-selection';
import SeatMap from '@/components/seat-map';
import BookingSummary from '@/components/booking-summary';
import Confirmation from '@/components/confirmation';
import type { Flight, Seat } from '@/lib/types';
import { generateInitialFlights } from '@/lib/flight-data';

type Step = 'flights' | 'seats' | 'summary' | 'confirmed';

export default function Home() {
  const [step, setStep] = useState<Step>('flights');
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [userBookings, setUserBookings] = useState<Record<string, string>>({}); // { flightId: seatId }

  useEffect(() => {
    // Initialize flights only once on the client
    setAllFlights(generateInitialFlights());
  }, []);

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
      // Update the global state of the seat to 'taken'
      const updatedFlights = allFlights.map(flight => {
        if (flight.id === selectedFlight.id) {
          const updatedSeats = flight.seats.map(seat => {
            if (seat.id === selectedSeat.id) {
              return { ...seat, status: 'taken' as const };
            }
            return seat;
          });
          return { ...flight, seats: updatedSeats };
        }
        return flight;
      });
      setAllFlights(updatedFlights);

      // Track the user's booking
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
      // Revert seat status to 'available' if it was marked as 'selected'
       if (selectedFlight && selectedSeat) {
        const updatedFlights = allFlights.map(f => {
            if (f.id === selectedFlight.id) {
                const updatedSeats = f.seats.map(s => {
                    if (s.id === selectedSeat.id) {
                        return {...s, status: 'available' };
                    }
                    return s;
                });
                return {...f, seats: updatedSeats};
            }
            return f;
        });
        setAllFlights(updatedFlights);
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
        return <FlightSelection flights={allFlights} onFlightSelect={handleFlightSelect} userBookings={userBookings} />;
      case 'seats':
        return selectedFlight && <SeatMap flight={selectedFlight} onSeatSelect={handleSeatSelect} onGoBack={handleGoBack} setAllFlights={setAllFlights} />;
      case 'summary':
        return selectedFlight && selectedSeat && <BookingSummary flight={selectedFlight} seat={selectedSeat} onConfirm={handleBookingConfirm} onGoBack={handleGoBack} />;
      case 'confirmed':
        return selectedFlight && selectedSeat && <Confirmation flight={selectedFlight} seat={selectedSeat} onNewBooking={handleNewBooking} />;
      default:
        return <FlightSelection flights={allFlights} onFlightSelect={handleFlightSelect} userBookings={userBookings} />;
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
