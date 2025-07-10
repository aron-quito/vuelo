"use client";

import { useState, useEffect } from 'react';
// *** Importamos las nuevas funciones del store ***
import { useStore } from '@/lib/store';
import type { Flight } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// *** Importamos el icono de Basura para eliminar ***
import { Armchair, User, XCircle, RefreshCw, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast'; // Para mostrar notificaciones

// *** Componente AdminSeatMap modificado para eliminar reservas ***
const AdminSeatMap = ({ flight }: { flight: Flight }) => {
  // *** Obtenemos la función cancelBooking del store ***
  const { cancelBooking, isLoading: isBookingActionLoading } = useStore(state => ({
    cancelBooking: state.cancelBooking,
    // Aquí podríamos añadir otros estados de carga si los tuviéramos definidos en el store para acciones específicas
    // Por ahora, usaremos isLoading general para deshabilitar botones si se está cargando algo
    isLoading: state.isLoading,
    // Sin embargo, para acciones de administración, podríamos necesitar un estado de carga específico
    // Vamos a crear un estado local para controlar el estado de carga de las acciones individuales de asientos
    // Esto es un ejemplo, en una app más grande, podrías querer un manejo de estado más sofisticado
    isBookingActionLoading: state.isLoading // Usamos el estado general isLoading por simplicidad
  }));
   const { toast } = useToast(); // Para mostrar notificaciones


  const seatRows = [];
  for (let i = 0; i < flight.seats.length; i += flight.plane.seatsPerRow) {
    seatRows.push(flight.seats.slice(i, i + flight.plane.seatsPerRow));
  }
  const aisleIndex = Math.ceil(flight.plane.seatsPerRow / 2);

  const totalSeats = flight.seats.length;
  const takenSeats = flight.seats.filter(s => s.status === 'taken').length;
  const availableSeats = totalSeats - takenSeats;

  // *** Función para manejar la eliminación de una reserva ***
  const handleCancelBooking = async (seatId: string) => {
      // Podríamos añadir una confirmación al usuario aquí (ej: un AlertDialog)
      if (window.confirm(`Are you sure you want to cancel the booking for seat ${seatId} on flight ${flight.id}?`)) {
         // Aquí podríamos necesitar un estado de carga local para el asiento específico que se está cancelando
         // Para simplificar, nos basaremos en el refresco general de datos
        const success = await cancelBooking(flight.id, seatId);
        if (success) {
            toast({
              title: "Success!",
              description: `Booking for seat ${seatId} cancelled.`,
            });
          } else {
             // El store ya maneja la actualización del estado de error, el toast mostrará el mensaje
          }
      }
  };


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
                    <div key={seat.id} className="flex items-center"> {/* Añadimos items-center para alinear */}
                      {seatIndex === aisleIndex && <div className="w-6" aria-hidden="true"></div>}
                       <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            aria-label={`Seat ${seat.id}, status: ${seat.status}`}
                            className={cn(
                              "w-7 h-7 rounded-md flex items-center justify-center",
                              seat.status === 'available' && "bg-primary/20 text-primary",
                              seat.status === 'taken' && "bg-muted text-muted-foreground cursor-pointer", // Hacemos el cursor pointer para asientos ocupados
                            )}
                             // Permite clic solo si el asiento está ocupado y no hay acción global en curso
                            onClick={() => seat.status === 'taken' && !isBookingActionLoading && handleCancelBooking(seat.id)}
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
                       {/* *** Botón para eliminar si el asiento está tomado *** */}
                       {seat.status === 'taken' && (
                           <Button
                               variant="ghost"
                               size="icon"
                               className="h-6 w-6 text-muted-foreground hover:text-destructive"
                               onClick={() => handleCancelBooking(seat.id)}
                               disabled={isBookingActionLoading} // Deshabilitar durante la acción
                           >
                               <Trash2 size={14} />
                           </Button>
                       )}
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


// *** Página de Administración modificada para el botón de Reinicio ***
export default function AdminPage() {
  // *** Obtenemos todas las funciones y estado necesarios del store ***
  const { flights, isLoading, fetchFlights, resetAllSeats, error } = useStore();
  const { toast } = useToast(); // Para mostrar notificaciones

  // Efecto para mostrar errores del store
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);


  useEffect(() => {
    fetchFlights();
    // Mantenemos el refresco automático para la vista de administración
    const interval = setInterval(() => {
      fetchFlights();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [fetchFlights]);

  // *** Función para manejar el reinicio de todas las reservas ***
  const handleResetAllSeats = async () => {
      // Podríamos añadir una confirmación al usuario aquí (ej: un AlertDialog)
      if (window.confirm("Are you sure you want to reset all seat bookings? This action cannot be undone.")) {
          const success = await resetAllSeats();
           if (success) {
            toast({
              title: "Success!",
              description: "All seat bookings have been reset.",
            });
          } else {
             // El store ya maneja la actualización del estado de error, el toast mostrará el mensaje
          }
      }
  };


  return (
    <main className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-6xl mb-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2 text-lg">Seat status is refreshed automatically</p>
            </div>
            <div className="flex items-center gap-4">
                 {/* *** Botón para Reiniciar Todas las Reservas *** */}
                <Button
                    onClick={handleResetAllSeats}
                    variant="destructive" // Usamos variante destructiva para indicar acción de borrado
                    disabled={isLoading} // Deshabilitar durante cualquier carga del store
                >
                    <Trash2 className={cn("h-4 w-4 mr-2", isLoading && "animate-pulse")} /> {/* Usamos Trash2 para resetear */}
                    Reset All Seats
                </Button>
                <Button onClick={() => fetchFlights()} variant="outline" size="icon" disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin\")} />
                </Button>
                <Button asChild>
                    <Link href="/">Go to Booking Page</Link>
                </Button>
            </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-6 justify-start">
            <div className="flex items-center gap-2 text-sm"><Armchair size={16} className="text-primary/80"/> Available</div>
             {/* Actualizamos la leyenda para incluir la opción de eliminar */}
            <div className="flex items-center gap-2 text-sm"><Armchair size={16} className="text-muted-foreground"/> Taken (<Trash2 size={14} className="inline-block align-text-bottom"/> to Cancel)</div>
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
            // Pasamos las funciones del store al componente AdminSeatMap si las necesita para acciones a nivel de asiento
            // En este caso, cancelBooking se llama dentro de AdminSeatMap, por lo que no necesita pasarse como prop si se obtiene directamente allí
            flights.map(flight => <AdminSeatMap key={flight.id} flight={flight} />)
          ) : (
            <p className="text-center text-muted-foreground">No flights found.</p>
          )
        )}
      </div>
    </main>
  );
}
