require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
const path = require('path');

// Load API key from .env
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
    console.error("Error: OPENAI_API_KEY is not set in the .env file.");
    process.exit(1);
}

// Initialize OpenAI API
const configuration = new Configuration({
    apiKey: openaiApiKey,
});
const openai = new OpenAIApi(configuration);

// Initialize Express
const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from "public" directory

// Endpoint for chat API
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).send({ error: 'Message is required' });
    }

    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [{ role: 'user', content: message }],
        });

        const reply = response.data.choices[0].message.content;
        res.send({ reply });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        res.status(500).send({ error: 'Failed to communicate with OpenAI API' });
    }
});

// Serve the chat HTML page
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`ChatGPT bot running on http://localhost:${PORT}`);
});
  
