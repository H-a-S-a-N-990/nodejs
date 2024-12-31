const OpenAI = require("openai");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

// Validate API key
if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY is not set in the .env file.");
    process.exit(1);
}

// Configure OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files

// API endpoint for chat
app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).send({ error: "Message is required" });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: message }],
        });

        const reply = response.choices[0].message.content;
        res.send({ reply });
    } catch (error) {
        console.error("Error communicating with OpenAI:", error.response?.data || error.message);
        res.status(500).send({ error: "Failed to communicate with OpenAI API" });
    }
});

// Serve chat HTML
app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "chat.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ChatGPT bot is running at http://localhost:${PORT}/chat`);
});
