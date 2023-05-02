const { Configuration, OpenAIApi } = require("openai");

require("dotenv").config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function completeChat({ model = "gpt-3.5-turbo", conversation }) {
    const completion = await openai.createChatCompletion({
        model,
        temperature: 0.5,
        messages: [
            {
                "role": "system",
                "content": conversation
            }
        ]
    });
    return completion.data.choices[0].message;
}

module.exports = {
    completeChat
};