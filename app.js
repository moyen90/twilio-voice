const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors')
const urlencoded = require("body-parser").urlencoded;

dotenv.config()

const port = process.env.PORT || 3001
const app = express()
app.use(express.json())
app.use(cors())
app.use(urlencoded({ extended: false }))

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

app.get("/", (req, res) => {
    res.send("Welcome")
})

// create a voice call request
app.get("/calls", async (req, res) => {
    try {
        const { toNumber } = req.query;
        const call = await client.calls
            .create({
                url: "https://blue-good-salmon.cyclic.app/call",
                // its the web hook url that gather user responses.
                to: toNumber,
                from: process.env.TWILIO_NUMBER,
            });
        console.log(call.sid)
        res.status(200).json({ success: true, call })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
});

// web hook for gathering user responses
app.post("/call", (req, res) => {
    try {
        const twiml = new VoiceResponse();
        twiml.gather({
            input: "speech",
            timeout: "auto",   //you can set any specific time
            action: "/voice",
            language: "en-GB",
            speechModel: 'phone_call',
            hints: 'person, dream, vision'
        }).say("Hello Sir! Please say something about yourself!");

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (err) {
        console.log(err.message)
    }
})
// reply to the user
app.post("/voice", (req, res) => {
    try {
        const twiml = new VoiceResponse();
        const command = req.body.SpeechResult;

        twiml.say(`you said  ${command}`);

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (err) {
        console.log(err.message)
    }
})

app.listen(port, () => {
    console.log("listening on port", port)
})