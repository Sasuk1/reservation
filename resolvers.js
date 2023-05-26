const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
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
  getFlightReservation: (_, { reservationId }) => {
    const client = new reservationProto.ReservationService(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );
    return new Promise((resolve, reject) => {
      client.getFlightReservation(
        { reservation_id: reservationId },
        (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.flight);
          }
        }
      );
    });
  },
  getHotelReservation: (_, { reservationId }) => {
    const client = new reservationProto.ReservationService(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );
    return new Promise((resolve, reject) => {
      client.getHotelReservation(
        { reservation_id: reservationId },
        (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.hotel);
          }
        }
      );
    });
  },
  searchFlights: (_, { query }) => {
    const client = new reservationProto.ReservationService(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );
    return new Promise((resolve, reject) => {
      client.searchFlights({ query: query }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.flights);
        }
      });
    });
  },
  searchHotels: (_, { query }) => {
    const client = new reservationProto.ReservationService(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );
    return new Promise((resolve, reject) => {
      client.searchHotels({ query: query }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.hotels);
        }
      });
    });
  },
  createFlightReservation: (_, { reservationId, flightId }) => {
    const client = new reservationProto.ReservationService(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );
    return new Promise((resolve, reject) => {
      client.createFlightReservation(
        { reservation_id: reservationId, flight_id: flightId },
        (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.flight);
          }
        }
      );
    });
  },
  createHotelReservation: (_, { reservationId, hotelId }) => {
    const client = new reservationProto.ReservationService(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );
    return new Promise((resolve, reject) => {
      client.createHotelReservation(
        { reservation_id: reservationId, hotel_id: hotelId },
        (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.hotel);
          }
        }
      );
    });
  },    

  createFlight: (_, { id, airline, destination, status }) => {
    const client = new reservationProto.ReservationService(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );

    const flightInput = {
      airline,
      destination,
      status,
      id,
    };

    return new Promise((resolve, reject) => {
      client.createFlight({ flight: flightInput }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.flight);
        }
      });
    });
  },
};
const resolvers = {
  Query: {
    getFlightReservation: reservationService.getFlightReservation,
    getHotelReservation: reservationService.getHotelReservation,
    searchFlights: reservationService.searchFlights,
    searchHotels: reservationService.searchHotels,
  },
  Mutation: {
    createFlightReservation: reservationService.createFlightReservation,
    createHotelReservation: reservationService.createHotelReservation,
    createFlight: reservationService.createFlight,
  },
};
module.exports = resolvers;
