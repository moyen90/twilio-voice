const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors')

dotenv.config()

const port = process.env.PORT || 3001
const app = express()
app.use(express.json())
app.use(cors())

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

app.get("/", (req, res) => {
    res.send("Welcome")
})

app.get("/call", async (req, res) => {
    try {
        const { toNumber } = req.query;
        const call = await client.calls
            .create({
                url: "http://demo.twilio.com/docs/voice.xml",
                to: toNumber,
                from: process.env.TWILIO_NUMBER,
            });
        console.log(call.sid)
        res.status(200).json({ success: true, call })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})
app.post("/voice", (req, res) => {
    try {
        const twiml = new VoiceResponse();
        twiml.say({ voice: 'alice' }, 'hello sir!. i hope you are doing well.');
        res.type('text/xml');
        res.send(twiml.toString());
    } catch (err) {
        console.log(err.message)
    }
})

app.listen(port, () => {
    console.log("listening on port", port)
})