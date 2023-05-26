# reservation
# Flight and Hotel Reservation API Gateway

This project is an API Gateway built using Express.js and Apollo Server. It serves as a central entry point for handling flight and hotel reservations. The API Gateway communicates with a MySQL database and a gRPC microservice for reservation-related operations.

## Features

- Retrieve flights and hotels information
- Create flight and hotel reservations
- Get details of a specific flight reservation
- Delete hotel reservations

## Requirements

- Node.js (version >= 12.0.0)
- MySQL database
- gRPC microservice (ReservationService)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Install the dependencies:

```bash
cd flight-hotel-api-gateway
npm install
```

3. Configure the MySQL database connection:
   - Open `app.js` file.
   - Update the `connection` object with your MySQL database connection details (host, user, password, database).

4. Configure the gRPC microservice connection:
   - Ensure that the `reservation.proto` file is available and up-to-date.
   - Open `app.js` file.
   - Update the gRPC client configuration in the `clientReservations` instantiation, providing the correct microservice address and credentials if required.

5. Start the API Gateway:

```bash
npm start
```

The API Gateway will be running at `http://localhost:3000`.

## API Endpoints

### Flights

- **GET /Flights**: Retrieve flights information.
- **GET /Flights/getAllReservations**: Retrieve all flight reservations.
- **POST /Flights/createFlightReservation?id=:flightId-:reservationId**: Create a flight reservation.
- **GET /Flights/getFlightReservation?reservationId=:reservationId**: Get details of a specific flight reservation.
- **POST /Flights/createFlight**: Create a new flight.

### Hotels

- **GET /Flights/Hotels?Distination=:destination-:reservationId**: Retrieve hotels information for a specific destination.
- **DELETE /Flights/Hotels/reservations/delete?id=:reservationId**: Delete a hotel reservation.
- **GET /Flights/Hotels/reservations**: Retrieve all hotel reservations.
- **POST /Flights/Hotels/createHotelReservation?id=:hotelId-:reservationId**: Create a hotel reservation.

### Error Handling

- If an error occurs during the API requests, the API Gateway will respond with an appropriate error message and status code.

## Development and Customization

- You can customize the API Gateway according to your requirements by modifying the code in the respective route handlers and helper functions.
- The templates used for rendering the responses (`flights`, `hotels`, `flightReservation`, `reservations`, `oops`) can be modified or extended as needed. They are written using the EJS templating engine.

## Contributing

Contributions to this project are welcome. You can contribute by opening issues for bug reports or feature requests, and by submitting pull requests to propose changes or additions to the codebase.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- This project utilizes various open-source libraries and frameworks, including Express.js, Apollo Server, gRPC, and MySQL.
- Special thanks to the contributors and maintainers of these libraries for their valuable work.

Feel free to customize this README file based on your specific project requirements and add any additional sections or information that may be relevant.
