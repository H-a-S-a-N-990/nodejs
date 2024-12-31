const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const bodyParser = require("body-parser");
const path = require("path");

// Create a new Express app
const app = express();

// Middleware to parse incoming request bodies as JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up the OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Define a conversation context prompt
const conversationContextPrompt =
  "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?\nHuman: ";

// Define an endpoint to handle incoming requests
app.post("/api/chat", async (req, res) => {
  console.log("Received message:", req.body.message); // Log the incoming message
  try {
    const message = req.body.message;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: conversationContextPrompt + message,
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [" Human:", " AI:"],
    });

    console.log("OpenAI response:", response.data); // Log the OpenAI response
    res.json({ reply: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error("Error communicating with OpenAI:", error);
    res.status(500).json({ error: "An error occurred while communicating with the OpenAI API." });
  }
});

// Serve the chat.html file when the root URL is accessed
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Start the Express app and listen on port 3000
app.listen(3000, () => {
  console.log("Conversational AI assistant listening on port 3000!");
});
