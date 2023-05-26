const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tp",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
});

const reservationProtoPath = "reservation.proto";
const reservationProtoDefinition = protoLoader.loadSync(reservationProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const reservationProto = grpc.loadPackageDefinition(
  reservationProtoDefinition
).reservation;

const reservationService = {
  getFlightReservation: (call, callback) => {
    const reservationId = call.request.reservation_id;
    console.log("Received reservation ID:", reservationId);
    
    const query = "SELECT * FROM f_reservations WHERE reservation_id = ?";
    connection.query(query, [reservationId], (error, results) => {
      if (error) {
        console.error(error);
        callback(error);
        return;
      }
  
      if (results.length === 0) {
        callback(new Error(`Flight reservation with ID ${reservationId} not found`));
        return;
      }
  
      const flightReservation = results[0];
  
      const flightQuery = "SELECT * FROM flights WHERE id = ?";
      connection.query(flightQuery, [flightReservation.flight_id], (error, flightResults) => {
        if (error) {
          console.error(error);
          callback(error);
          return;
        }
  
        if (flightResults.length === 0) {
          callback(new Error(`Flight with ID ${flightReservation.flight_id} not found`));
          return;
        }
  
        const flight = flightResults[0];
  
        callback(null, {
          reservation: {
            reservation_id: flightReservation.reservation_id,
            flight_id: flightReservation.flight_id,
            flight: {
              id: flight.id,
              airline: flight.airline,
              destination: flight.destination,
              status: flight.status
            }
          }
        });
      });
    });
  },  
  //To Be Modified
  getHotelReservation: (call, callback) => {
    const reservationId = call.request.reservation_id;
    console.log("Received reservation ID:", reservationId);
    const query = "SELECT * FROM hotels WHERE id = ?";
    connection.query(query, [reservationId], (error, results) => {
      if (error) {
        console.error(error);
        callback(error);
        return;
      }

      if (results.length === 0) {
        callback(
          new Error(`Hotel reservation with ID ${reservationId} not found`)
        );
        return;
      }

      const hotel = results[0];

      callback(null, {
        hotel: {
          id: hotel.id,
          name: hotel.name,
          location: hotel.location,
        },
      });
    });
  },
  
  searchFlights: (call, callback) => {
    const { query } = call.request;
    const searchQuery = `SELECT * FROM flights WHERE destination LIKE '%${query}%' ORDER BY id DESC`;
    connection.query(searchQuery, (error, results) => {
      if (error) {
        console.error(error);
        callback(error);
        return;
      }
      const flights = results.map((flight) => ({
        id: flight.id,
        airline: flight.airline,
        destination: flight.destination,
        status: flight.status
      }));
      callback(null, { flights });
    });
  },  
  searchHotels: (call, callback) => {
    const { query } = call.request;
    const searchQuery = `SELECT * FROM hotels WHERE name LIKE '%${query}%' OR location LIKE '%${query}%'`;
    connection.query(searchQuery, (error, results) => {
      if (error) {
        console.error(error);
        callback(error);
        return;
      }
      const hotels = results.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
      }));
      callback(null, { hotels });
    });
  },
  createFlightReservation: (call, callback) => {
    const { reservation_id, flight_id } = call.request;
  
    // Check if the reservation already exists
    const reservationQuery = "SELECT * FROM f_reservations WHERE reservation_id = ?";
    connection.query(reservationQuery, [reservation_id], (error, results) => {
      if (error) {
        console.error(error);
        callback(error);
        return;
      }
  
      if (results.length > 0) {
        callback(new Error(`Reservation with ID ${reservation_id} already exists`));
        return;
      }
  
      const flightQuery = "SELECT * FROM flights WHERE id = ?";
      connection.query(flightQuery, [flight_id], (error, results) => {
        if (error) {
          console.error(error);
          callback(error);
          return;
        }
  
        if (results.length === 0) {
          callback(new Error(`Flight with ID ${flight_id} not found`));
          return;
        }
  
        const flight = results[0];
  
        const insertQuery =
          "INSERT INTO f_reservations (reservation_id, flight_id) VALUES (?, ?)";
        connection.query(
          insertQuery,
          [reservation_id, flight_id],
          (error, results) => {
            if (error) {
              console.error(error);
              callback(error);
              return;
            }
  
            callback(null, {
              flight: {
                id: flight.id,
                airline: flight.airline,
                destination: flight.destination,
                status: flight.status
              },
            });
          }
        );
      });
    });
  },  
  createHotelReservation: (call, callback) => {
    const { reservation_id, hotel_id } = call.request;
    const hotelQuery = "SELECT * FROM hotels WHERE id = ?";
    connection.query(hotelQuery, [hotel_id], (error, results) => {
      if (error) {
        console.error(error);
        callback(error);
        return;
      }

      if (results.length === 0) {
        callback(new Error(`Hotel with ID ${hotel_id} not found`));
        return;
      }

      const hotel = results[0];

      const insertQuery =
        "INSERT INTO h_reservations (reservation_id, hotel_id) VALUES (?, ?)";
      connection.query(
        insertQuery,
        [reservation_id, hotel_id],
        (error, results) => {
          if (error) {
            console.error(error);
            callback(error);
            return;
          }

          callback(null, {
            hotel: {
              id: hotel.id,
              name: hotel.name,
              location: hotel.location,
            },
          });
        }
      );
    });
  },
  createFlight: (call, callback) => {
    const { airline, destination, status, FlightId } = call.request;

    // Insert the new flight into the database
    const insertQuery = "INSERT INTO flights (airline, destination, status, id) VALUES (?, ?, ?, ?)";
    connection.query(insertQuery, [airline, destination, status, FlightId], (error, results) => {
      if (error) {
        console.error(error);
        callback(error);
        return;
      }

      const newFlightId = results.id;

      // Retrieve the newly created flight from the database
      const selectQuery = "SELECT * FROM flights WHERE id = ?";
      connection.query(selectQuery, [newFlightId], (error, results) => {
        if (error) {
          console.error(error);
          callback(error);
          return;
        }

        if (results.length === 0) {
          callback(new Error(`Failed to retrieve the newly created flight`));
          return;
        }

        const createdFlight = results[0];

        // Return the created flight as the response
        callback(null, {
          flight: {
            id: createdFlight.id,
            airline: createdFlight.airline,
            destination: createdFlight.destination,
            status: createdFlight.status,
          },
        });
      });
    });
  },
};
const server = new grpc.Server();
server.addService(
  reservationProto.ReservationService.service,
  reservationService
);
const port = 50051;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Failed to bind server:", err);
      return;
    }

    console.log(`Server is running on port ${port}`);
    server.start();
  }
);
console.log(`Port ${port}`);
