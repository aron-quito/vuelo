import threading

class VuelosData:
    def __init__(self):
        self.vuelos = {
            "vuelo_123": {
                "asientos": {
                    "A1": None, "A2": None, "A3": None,
                    "B1": None, "B2": None, "B3": None
                }
            }
        }

        # Variables de sincronización
        self.mutex = threading.Semaphore(1)
        self.writer = threading.Semaphore(0)
        self.reader = threading.Semaphore(0)

        # Variables de estado
        self.lec = 0       # lectores activos
        self.nee = 0       # escritores esperando
        self.nle = 0       # lectores esperando
        self.writing = False  # True si hay escritor escribiendo

    # -------------------------
    # Sección LECTORA
    # -------------------------
    def leer_vuelos(self):
        # Entrada lector
        self.mutex.acquire()
        if self.writing or self.nee > 0:
            self.nle += 1
            self.mutex.release()
            self.reader.acquire()
        else:
            self.mutex.release()

        self.mutex.acquire()
        self.lec += 1
        if self.nle > 0:
            self.nle -= 1
            self.reader.release()
        else:
            self.mutex.release()

        # Sección crítica de lectura
        vuelos_copia = {
            vuelo: {"asientos": self.vuelos[vuelo]["asientos"].copy()}
            for vuelo in self.vuelos
        }

        # Salida lector
        self.mutex.acquire()
        self.lec -= 1
        if self.lec == 0 and self.nee > 0:
            self.writer.release()
        else:
            self.mutex.release()

        return vuelos_copia

    # -------------------------
    # Sección ESCRITORA: reservar
    # -------------------------
    def reservar(self, vuelo, asiento, nombre):
        # Entrada escritor
        self.mutex.acquire()
        if self.writing or self.lec > 0:
            self.nee += 1
            self.mutex.release()
            self.writer.acquire()
        self.writing = True
        self.mutex.release()

        # Sección crítica de escritura
        exito = False
        if self.vuelos[vuelo]["asientos"][asiento] is None:
            self.vuelos[vuelo]["asientos"][asiento] = nombre
            exito = True

        # Salida escritor
        self.mutex.acquire()
        self.writing = False
        if self.nee > 0:
            self.nee -= 1
            self.writer.release()
        elif self.nle > 0:
            self.nle -= 1
            self.reader.release()
        else:
            self.mutex.release()

        return exito

    # -------------------------
    # ESCRITORA: cancelar reserva
    # -------------------------
    def cancelar(self, vuelo, asiento):
        # Entrada escritor
        self.mutex.acquire()
        if self.writing or self.lec > 0:
            self.nee += 1
            self.mutex.release()
            self.writer.acquire()
        self.writing = True
        self.mutex.release()

        # Sección crítica
        exito = False
        if self.vuelos[vuelo]["asientos"][asiento] is not None:
            self.vuelos[vuelo]["asientos"][asiento] = None
            exito = True

        # Salida escritor
        self.mutex.acquire()
        self.writing = False
        if self.nee > 0:
            self.nee -= 1
            self.writer.release()
        elif self.nle > 0:
            self.nle -= 1
            self.reader.release()
        else:
            self.mutex.release()

        return exito

    # -------------------------
    # ESCRITORA: reiniciar todo
    # -------------------------
    def reiniciar_asientos(self):
        # Entrada escritor
        self.mutex.acquire()
        if self.writing or self.lec > 0:
            self.nee += 1
            self.mutex.release()
            self.writer.acquire()
        self.writing = True
        self.mutex.release()

        # Sección crítica
        for vuelo in self.vuelos:
            for asiento in self.vuelos[vuelo]["asientos"]:
                self.vuelos[vuelo]["asientos"][asiento] = None

        # Salida escritor
        self.mutex.acquire()
        self.writing = False
        if self.nee > 0:
            self.nee -= 1
            self.writer.release()
        elif self.nle > 0:
            self.nle -= 1
            self.reader.release()
        else:
            self.mutex.release()
