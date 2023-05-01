This repository contains a simple Node.js application that utilizes the Twilio API to create a voice call and gather user responses.
Setup

Before running the application, you'll need to do the following:

Clone the repository:

     git clone https://github.com/<username>/<repository>.git

Install the dependencies:

      yarn install

Create a .env file in the root directory with the following variables:

    TWILIO_ACCOUNT_SID - Your Twilio account SID.
    TWILIO_AUTH_TOKEN - Your Twilio auth token.
    TWILIO_NUMBER - Your Twilio phone number.
    PORT - The port number to run the server on (optional; default is 3001).

Start the server:

    yarn dev

Usage

Once the server is running, you can access the following endpoints:

    / - A simple welcome message.
    /calls?toNumber=<phone number> - Creates a voice call to the specified phone number and gathers user responses.
    /call - Web hook for gathering user responses.
    /voice - Responds to user's speech input.

Dependencies

This application uses the following dependencies:

    express - A web framework for Node.js.
    dotenv - A zero-dependency module that loads environment variables from a .env file into process.env.
    cors - A package for providing a Connect/Express middleware that can be used to enable CORS with various options.
    body-parser - A package for parsing incoming request bodies in a middleware before your handlers.
    twilio - A package for interacting with the Twilio REST API and generating TwiML.
