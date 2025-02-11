require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json()); // Enable JSON body parsing
app.use(cors()); // Enable CORS

const PORT = process.env.PORT || 3000;
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY; // Store API key in .env

// Endpoint to call Replicate API
app.post("/predict", async (req, res) => {
    try {
        const input = {
            top_p: 1,
            prompt: req.body.prompt || "What is the speed of an unladen swallow?",
            max_tokens: 20480,
            temperature: 0.1,
            presence_penalty: 0,
            frequency_penalty: 0
        };

        const response = await axios.post(
            "https://api.replicate.com/v1/predictions",
            {
                version: "deepseek-ai/deepseek-r1", // Model ID
                input: input
            },
            {
                headers: {
                    Authorization: `Token ${REPLICATE_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Welcome to the Replicate Demo API! Use the /predict endpoint.");
});



