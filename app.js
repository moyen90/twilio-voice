const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors')
const urlencoded = require("body-parser").urlencoded;
const { completeChat } = require('./services/openai')
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const root = require("app-root-path")

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
        console.log(err)
        res.status(500).json({ success: false, message: err.message })
    }
});

// web hook for gathering user responses
app.post("/call", (req, res) => {
    try {
        const twiml = new VoiceResponse();
        twiml.gather({
            input: "speech",
            timeout: 5,   //you can set any specific time
            action: "/voice",
            language: "en-GB",
            speechModel: 'phone_call',
            hints: 'person, dream, vision'
        }).say("Hello Sir! Please ask me something!");

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (err) {
        console.log(err)
    }
})
// reply to the user
app.post("/voice", async (req, res) => {
    try {
        const twiml = new VoiceResponse();
        const command = req.body.SpeechResult;
        const response = await completeChat({ conversation: command });

        var data = JSON.stringify({
            "text": response.content,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0,
                "similarity_boost": 0
            }
        });

        var config = {
            method: 'post',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}`,
            headers: {
                'accept': 'audio/mpeg',
                'xi-api-key': process.env.ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            data: data
        };
        const voice = await axios(config);
        // console.log(voice.data)
        const audioData = 'data:audio/mpeg;base64,' + Buffer.from(voice.data, 'binary').toString('base64')
        const fileName = `audio-${Date.now()}.mp3`;
        const filePath = path.join(`${root}/audio`, fileName);

        saveAudioFromBase64(audioData, filePath);

        twiml.play({ url: audioData });
        res.type('text/xml');
        // res.status(200).json({ success: true, audio: data2 })
        res.send(twiml.toString())

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (err) {
        console.log(err)
    }
});

app.post('/test', async (req, res, next) => {
    try {
        const conversation = req.query.text;
        const voiceResponse = new VoiceResponse();

        const response = await completeChat({ conversation });

        var data = JSON.stringify({
            "text": response.content,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0,
                "similarity_boost": 0
            }
        });

        var config = {
            method: 'post',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}`,
            headers: {
                'accept': 'audio/mpeg',
                'xi-api-key': '7abd022fc43dc4b3858195b4da924fa8',
                'Content-Type': 'application/json'
            },
            data: data
        };
        const voice = await axios(config);
        // console.log(voice.data)
        const audioData = 'data:audio/mpeg;base64,' + Buffer.from(voice.data, 'binary').toString('base64')
        // const fileName = `audio-${Date.now()}.mp3`;
        // const filePath = path.join(`${root}/audio`, fileName);

        // saveAudioFromBase64(audioData, filePath);

        voiceResponse.play({ url: audioData });
        res.type('text/xml');
        // res.status(200).json({ success: true, audio: data2 })
        res.send(voiceResponse.toString())
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message })
    }
})

function saveAudioFromBase64(base64Audio, filePath) {
    const [header, encoded] = base64Audio.split(",", 2);
    const data = Buffer.from(encoded, "base64");
    fs.writeFileSync(filePath, data);
}

app.listen(port, () => {
    console.log("listening on port", port)
})