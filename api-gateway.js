const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const resolvers = require("./resolvers");
const typeDefs = require("./schema");
const reservationProtoPath = "reservation.proto";

//database
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

const app = express();
app.use(bodyParser.json());

app.set("view engine", "ejs");

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
const clientReservations = new reservationProto.ReservationService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);
const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(() => {
  app.use(cors(), bodyParser.json(), expressMiddleware(server));
});

/** Functions */
function generateRandomReservationId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 8;
  let reservationId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    reservationId += characters.charAt(randomIndex);
  }

  return reservationId;
}


app.get("/Flights", (req, res) => {
  const reservationId = generateRandomReservationId();
  const query = "SELECT * FROM f_reservations";
  connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send(error.message);
      return;
    }
    clientReservations.searchFlights({}, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        //res.json(response.flights);
        res.render("flights", {
          flights: response.flights,
          reservationId,
          reservations: results,
        });
      }
    });
  });
});

app.get("/Flights/All", (req, res) => {
  const reservationId = generateRandomReservationId();
    clientReservations.searchFlights({}, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        //res.json(response.flights);
        res.render("allflights", {
          flights: response.flights,
          reservationId,
        });
      }
  });
});

// app.js

app.put("/Flights/updateFlightStatus", (req, res) => {
  const flightId = req.query.id;
  const newStatus = req.query.status;

  // Perform the update operation based on the flightId and newStatus
  connection.query(
    "UPDATE flights SET status = ? WHERE id = ?",
    [newStatus, flightId],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update flight status" });
        return;
      }

      // Check the number of affected rows to determine if the update was successful
      if (results.affectedRows === 0) {
        res.status(404).json({ error: "Flight not found" });
        return;
      }

      // Return a response indicating the success of the update
      res.json({ message: "Flight status updated successfully" });
    }
  );
});

app.get("/Flights/getAllReservations", (req, res) => {
  const query = "SELECT * FROM f_reservations";

  // Execute the SQL query to fetch all reservations
  connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send(error.message);
      return;
    }

    // Send the retrieved reservations as a JSON response
    res.json(results);
  });
});

app.post("/Flights/createFlightReservation", (req, res) => {
  const parameters = req.query.id;
  const [flightId, reservationId] = parameters.split("-");
  clientReservations.createFlightReservation(
    { reservation_id: reservationId, flight_id: flightId },
    (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response);
      }
    }
  );
});

app.get("/Flights/getFlightReservation", (req, res) => {
  const reservationId = req.query.reservationId;
  // Assuming you have a gRPC client to communicate with the microservice
  clientReservations.getFlightReservation(
    { reservation_id: reservationId },
    (err, response) => {
      if (err) {
        console.error(err);
        res.status(500).send(err.message);
        return;
      }
      const flightReservation = response.reservation;
      res.render("flightReservation", { flightReservation });
    }
  );
});


/**Functions of generation */
// Function to generate a random airline
function generateRandomAirline() {
  const airlines = [
    "American Airlines",
    "Delta Air Lines",
    "United Airlines",
    "Southwest Airlines",
    "Air Canada",
    "Lufthansa",
    "British Airways",
    "Emirates",
    "Qatar Airways",
    "Singapore Airlines",
    "Cathay Pacific",
    "Air France",
    "KLM",
    "ANA - All Nippon Airways",
    "Japan Airlines",
    "Etihad Airways",
  ];
  const randomIndex = Math.floor(Math.random() * airlines.length);
  return airlines[randomIndex];
}
// Function to generate a random destination
function generateRandomDestination() {
  const destinations = [
    "New York",
    "London",
    "Paris",
    "Tokyo",
    "Los Angeles",
    "Sydney",
    "Dubai",
    "Rome",
    "Barcelona",
    "Singapore",
    "Amsterdam",
    "Hong Kong",
    "Munich",
    "Toronto",
    "Istanbul",
  ];
  const randomIndex = Math.floor(Math.random() * destinations.length);
  return destinations[randomIndex];
}

// Function to generate a random status
function generateRandomStatus() {
  const statuses = ["On Time", "Delayed", "Cancelled", "Boarding"];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
}

// Function to generate a random flightId
function generateRandomFlightId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 8;
  let flightId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    flightId += characters.charAt(randomIndex);
  }

  return flightId;
}

app.post("/Flights/createFlight", (req, res) => {
  const airline = generateRandomAirline();
  const destination = generateRandomDestination();
  const status = generateRandomStatus();
  const flightId = generateRandomFlightId();

  const insertQuery =
    "INSERT INTO flights (airline, destination, status, id) VALUES (?, ?, ?, ?)";

  connection.query(
    insertQuery,
    [airline, destination, status, flightId],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send(error.message);
        return;
      }

      const newFlightId = results.insertId;

      // Retrieve the newly created flight from the database
      const selectQuery = "SELECT * FROM flights WHERE id = ?";
      connection.query(selectQuery, [newFlightId], (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).send(error.message);
          return;
        }

        if (results.length === 0) {
          res.status(404).send("Failed to retrieve the newly created flight");
          return;
        }

        const createdFlight = results[0];

        // Return the created flight as the response
        res.json({
          flight: {
            id: createdFlight.id,
            airline: createdFlight.airline,
            destination: createdFlight.destination,
            status: createdFlight.status,
          },
        });
      });
    }
  );
});

app.get("/Flights/Hotels", (req, res) => {
  const destination = req.query.Distination;
  const [destinationToGo, reservationId] = destination.split("-"); // Extract the destination from the query parameter

  const selectQuery = "SELECT * FROM hotels WHERE location = ?";
  connection.query(selectQuery, [destinationToGo], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send(error.message);
      return;
    }

    // Render the hotels view with the retrieved hotels data
    res.render("hotels", { hotels: results, location:destinationToGo,reservationId:reservationId });
  });
  // console.log(destination);
});

app.delete("/Flights/Hotels/reservations/delete", (req, res) => {
  const reservationId = req.query.id;
  const deleteQuery = "DELETE FROM h_reservations WHERE id = ?";
  // console.log(reservationId);
  // Perform the deletion operation based on the reservationId
  connection.query(deleteQuery, [reservationId], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete reservation" });
      return;
    }

    // Check the number of affected rows to determine if the deletion was successful
    if (results.affectedRows === 0) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }

    // Return a response indicating the success of the deletion
    res.json({ message: "Reservation deleted successfully" });
  });
});

app.get("/Flights/Hotels/reservations", (req, res) => {
  const selectQuery = "SELECT * FROM h_reservations";
  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send(error.message);
      return;
    }

    // Render the hotels view with the retrieved hotels data
    res.render("reservations", { hotels: results});
  });
  // console.log(destination);
});


app.post("/Flights/Hotels/createHotelReservation", (req, res) => {
  const parameters = req.query.id;
  const [hotel_id, reservationId] = parameters.split("-");
  clientReservations.createHotelReservation(
    { reservation_id: reservationId, hotel_id: hotel_id },
    (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response);
      }
    }
  );
});

app.get("/oops", (req, res) => {
  res.render("oops");
});

app.use("/Flights/create", (req, res, next) => {
  req.headers["content-type"] = "application/json";
  next();
});

const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
