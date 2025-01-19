require("dotenv").config();
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const docxParser = require("docx-parser");

const app = express();
const port = 3000;

// Set up OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Set up file upload using Multer
const upload = multer({ dest: "uploads/" });

// Serve static files (HTML, CSS)
app.use(express.static("public"));
app.use(express.json());

// Route to handle file upload and analysis
app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.file.filename);
  let fileContent = "";

  // Read file based on type
  try {
    if (req.file.mimetype === "application/pdf") {
      const data = await pdfParse(fs.readFileSync(filePath));
      fileContent = data.text;
    } else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const docxData = await docxParser.parseDocx(filePath);
      fileContent = docxData;
    } else if (req.file.mimetype === "text/plain") {
      fileContent = fs.readFileSync(filePath, "utf8");
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Get ChatGPT's response
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: `Analyze the following text: ${fileContent}` }],
    });

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Error processing file or OpenAI API:", error);
    res.status(500).json({ error: "An error occurred while processing the file" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
