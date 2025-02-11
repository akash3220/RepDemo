require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

// Default route for checking if the server is up
app.get("/", (req, res) => {
    console.log("GET / request received");
    res.send("Welcome to the Replicate Demo API! Use the /predict endpoint.");
});

// Endpoint to call Replicate API
app.post("/predict", async (req, res) => {
    try {
        console.log("POST /predict called with input:", req.body);

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
                version: "deepseek-ai/deepseek-r1",
                input: input
            },
            {
                headers: {
                    Authorization: `Token ${REPLICATE_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("API response:", response.data); // Log response
        res.json(response.data);
    } catch (error) {
        console.error("Error:", error.response?.data || error.message); // Log errors
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
