# Notifications Application in NestJS
 
![NestJS](https://img.shields.io/badge/NestJS-7E22CE?style=for-the-badge&logo=nestjs&logoColor=white)
![NodeMailer](https://img.shields.io/badge/NodeMailer-green?style=for-the-badge)
![Twilio](https://img.shields.io/badge/Twilio-FF0000?style=for-the-badge&logo=twilio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Passport](https://img.shields.io/badge/Passport.js-34E27A?style=for-the-badge)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
 
This is a **NestJS**-based notifications service application that allows users to register and log in with JWT-based authentication. The application sends a success email, SMS notification, and push notification upon successful user registration. Users also receive a login success push notification upon their first login. Additionally, the service supports real-time notifications every 5 minutes. It also includes private and group chat functionality, with the ability to store and retrieve previous chat history for users.


## Features
 
- **User Registration**: Users can sign up and, upon successful registration, they will receive:
  - A success email (powered by **NodeMailer**).
  - An SMS notification (powered by **Twilio**).
  - A success notification via push notifications
- **User Login**: Users can log in securely with **JWT** token authentication and will receive:
  - A login success notification via push notifications.
- **Authentication**: JWT strategy implemented using **Passport.js**.
- **Real-Time Notifications**: Users receive real-time notifications through **WebSockets** for events occurring every 5 minutes.

## Technologies Used
- **NestJS**: A framework for building scalable Node.js server-side applications.
- **Mongoose**: For MongoDB database management and modeling.
- **NodeMailer**: A module for sending emails.
- **Twilio**: A service for sending SMS messages.
- **Passport.js**: Authentication middleware for Node.js.
- **Passport-JWT**: Passport strategy for authenticating with JSON Web Tokens (JWT).
- **Socket.IO**: Real-time, bidirectional, and event-based communication.
 
## APIs
 
### 1. **Register**
   - **Endpoint**: `/user/register`
   - **Method**: `POST`
   - **Request Body**: 
     ```json
     {
       "username": "John Doe",
       "email": "john@example.com",
       "password": "your_password",
       "phoneNumber": "your_phonenumber"
     }
     ```
   - **Description**: Registers a new user and sends email and SMS upon successful registration.
 
### 2. **Login**
   - **Endpoint**: `/user/login`
   - **Method**: `POST`
   - **Request Body**: 
     ```json
     {
       "email": "john@example.com",
       "password": "your_password"
     }
     ```
   - **Description**: Logs in an existing user and returns a JWT token.
 
### 3. **Profile**
   - **Endpoint**: `/user/profile`
   - **Method**: `GET`
   - **Headers**: 
     ```json
     {
       "Authorization": "Bearer <access_token>"
     }
     ```
   - **Description**: Retrieves the profile details of the logged-in user. You need to use the access token returned after a successful login and pass it in the `Authorization` header as a Bearer token to access this API.

 
## Installation
 
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd notifications-app
2. nstall the required dependencies:
   ```bash
   npm install
3. Set up environment variables by creating a .env file in the root directory with the following values:
   ```bash
   MAIL_HOST=<your_smtp_host>
   MAIL_PORT=<your_smtp_port>
   MAIL_USER=<your_email>
   MAIL_PASS=<your_email_password>
 
   TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
   TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
   TWILIO_PHONE_NUMBER=<your_twilio_phone_number>
 
   JWT_SECRET=<your_jwt_secret_key>
4. Run the application:
   ```bash
   npm run start
5. Open the app in your browser at http://localhost:3000.
 
## Running Tests
 
To run the tests for this application, use the following command:
 
```bash
npm run test
```
 
## Project Structure
 
```bash
src/
|-- auth/                # Authentication logic with Passport.js and JWT
|-- chat/                # Web Sockets emits and chats
|-- user/                # User management including registration and login
|-- app.module.ts        # Main application file
|-- main.ts              # Entry point of the application
|-- tests/               # Unit and integration tests
```
 
## License
 
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).