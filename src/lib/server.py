import eventlet  # Importar eventlet primero
eventlet.monkey_patch() # Llamar a monkey_patch() lo antes posible

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from .data import VuelosData # Importación relativa de data

# La creación de la instancia de Flask y VuelosData después del monkey_patch
app = Flask(__name__)
CORS(app)

datos = VuelosData()

@app.route("/api/vuelos", methods=["GET"])
def consultar_vuelos():
    """
    Endpoint para consultar el estado actual de los vuelos y asientos.
    Retorna: JSON con el estado de los vuelos.
    """
    vuelos = datos.leer_vuelos()
    return jsonify(vuelos)

@app.route("/api/reservar", methods=["POST"])
def reservar_asiento():
    """
    Endpoint para reservar un asiento.
    Espera en el cuerpo de la petición (form-data o JSON):
    - vuelo: ID del vuelo
    - asiento: ID del asiento
    - nombre: Nombre del pasajero
    Retorna: JSON indicando el éxito o fracaso de la reserva.
    """
    vuelo = request.form.get("vuelo")
    asiento = request.form.get("asiento")
    nombre = request.form.get("nombre")

    if not vuelo or not asiento or not nombre:
        data = request.get_json()
        if data:
            vuelo = data.get("vuelo")
            asiento = data.get("asiento")
            nombre = data.get("nombre")

    if not vuelo or not asiento or not nombre:
        return jsonify({"status": "error", "mensaje": "Faltan datos (vuelo, asiento, nombre)"}), 400

    if datos.reservar(vuelo, asiento, nombre):
        return jsonify({"status": "ok", "mensaje": f"Asiento {asiento} en vuelo {vuelo} reservado por {nombre}"})
    else:
        return jsonify({"status": "error", "mensaje": f"El asiento {asiento} en vuelo {vuelo} ya está reservado"}), 400

@app.route("/api/eliminar", methods=["POST"])
def eliminar_reserva():
    """
    Endpoint para eliminar una reserva.
    Espera en el cuerpo de la petición (form-data o JSON):
    - vuelo: ID del vuelo
    - asiento: ID del asiento
    Retorna: JSON indicando el éxito o fracaso de la eliminación.
    """
    vuelo = request.form.get("vuelo")
    asiento = request.form.get("asiento")

    if not vuelo or not asiento:
        data = request.get_json()
        if data:
            vuelo = data.get("vuelo")
            asiento = data.get("asiento")

    if not vuelo or not asiento:
         return jsonify({"status": "error", "mensaje": "Faltan datos (vuelo, asiento)"}), 400

    if datos.cancelar(vuelo, asiento):
        return jsonify({"status": "ok", "mensaje": f"Reserva para asiento {asiento} en vuelo {vuelo} eliminada"})
    else:
        return jsonify({"status": "error", "mensaje": f"No se encontró reserva para asiento {asiento} en vuelo {vuelo}"}), 400

@app.route("/api/reiniciar", methods=["POST"])
def reiniciar_asientos():
    """
    Endpoint para reiniciar todos los asientos a estado disponible.
    Retorna: JSON indicando que los asientos han sido reiniciados.
    """
    datos.reiniciar_asientos()
    return jsonify({"status": "ok", "mensaje": "Todos los asientos han sido reiniciados"})

# Eliminamos el bloque __main__ ya que Gunicorn lo maneja
# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5000))
#     app.run(host="0.0.0.0", port=port)
