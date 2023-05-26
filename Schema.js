const { gql } = require('apollo-server');

const typeDefs = `#graphql
  type Flight {
    id: String!
    airline: String!
    destination: String!
    status: String!
  }

  type Hotel {
    id: String!
    name: String!
    location: String!
  }

  type GetFlightReservationResponse {
    flight: Flight
  }

  type GetHotelReservationResponse {
    hotel: Hotel
  }

  type SearchFlightsResponse {
    flights: [Flight]
  }

  type SearchHotelsResponse {
    hotels: [Hotel]
  }

  type CreateFlightReservationResponse {
    flight: Flight
  }

  type CreateHotelReservationResponse {
    hotel: Hotel
  }

  type Query {
    getFlightReservation(reservationId: String!): GetFlightReservationResponse!
    getHotelReservation(reservationId: String!): GetHotelReservationResponse!
    searchFlights(query: String!): SearchFlightsResponse!
    searchHotels(query: String!): SearchHotelsResponse!
  }

  type Mutation {
    createFlightReservation(reservationId: String!, flightId: String!): CreateFlightReservationResponse!
    createHotelReservation(reservationId: String!, hotelId: String!): CreateHotelReservationResponse!
    createFlight(id: String!, airline: String!, destination: String!, status: String!): Flight!
  }
`;

module.exports = typeDefs;
