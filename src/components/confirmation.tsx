"use client"

import type { Flight, Seat } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plane, Calendar, Armchair, DollarSign } from "lucide-react";

interface ConfirmationProps {
  flight: Flight;
  seat: Seat;
  onNewBooking: () => void;
}

export default function Confirmation({ flight, seat, onNewBooking }: ConfirmationProps) {
  return (
    <Card className="w-full text-center animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <CardTitle className="text-3xl">Booking Confirmed!</CardTitle>
            <CardDescription>Your flight is booked. Have a great trip!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
             <div className="p-4 border rounded-lg bg-card/50">
                <h3 className="font-bold text-lg mb-2">Your Itinerary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Plane size={16} className="text-primary"/> <span>Flight {flight.id}</span></div>
                    <div className="flex items-center gap-2"><Calendar size={16} className="text-primary"/> <span>{new Date(flight.departureTime).toLocaleDateString()}</span></div>
                    <p className="md:col-span-2"><strong>Route:</strong> {flight.from} to {flight.to}</p>
                    <div className="flex items-center gap-2"><Armchair size={16} className="text-primary"/> <span>Seat {seat.id}</span></div>
                    <div className="flex items-center gap-2 font-bold"><DollarSign size={16} className="text-primary"/> <span>Total: ${flight.price}</span></div>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={onNewBooking} className="w-full">
                Book Another Flight
            </Button>
        </CardFooter>
    </Card>
  )
}
