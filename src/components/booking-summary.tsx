"use client"

import type { Flight, Seat } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, Clock, Armchair, ArrowLeft, DollarSign } from "lucide-react";

interface BookingSummaryProps {
  flight: Flight;
  seat: Seat;
  onConfirm: () => void;
  onGoBack: () => void;
}

export default function BookingSummary({ flight, seat, onConfirm, onGoBack }: BookingSummaryProps) {
  return (
    <Card className="w-full animate-fade-in">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <button onClick={onGoBack} className="p-1 rounded-full hover:bg-accent/20 transition-colors">
                    <ArrowLeft/>
                </button>
                Booking Summary
            </CardTitle>
            <CardDescription>Please review your flight and seat selection before confirming.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg bg-card/50">
                <h3 className="font-bold text-lg mb-2">Flight Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Plane size={16} className="text-primary"/> <span>Flight {flight.id}</span></div>
                    <div className="flex items-center gap-2"><Calendar size={16} className="text-primary"/> <span>{new Date(flight.departureTime).toLocaleDateString()}</span></div>
                    <div className="flex items-center gap-2"><Clock size={16} className="text-primary"/> <span>Departs: {new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                    <div className="flex items-center gap-2"><Clock size={16} className="text-primary"/> <span>Arrives: {new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                </div>
                <div className="mt-2 text-sm"><strong>Route:</strong> {flight.from} to {flight.to}</div>
            </div>
            <div className="p-4 border rounded-lg bg-card/50">
                <h3 className="font-bold text-lg mb-2">Seat &amp; Price</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-lg"><Armchair size={20} className="text-primary"/> <strong>Seat: {seat.id}</strong></div>
                    <div className="flex items-center gap-2 text-lg text-primary font-bold"><DollarSign size={20}/> {flight.price}</div>
                 </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={onConfirm} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                Confirm and Book
            </Button>
        </CardFooter>
    </Card>
  )
}
