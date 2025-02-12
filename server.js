require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Add logging middleware for all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Request received`);
    next();
});

const PORT = process.env.PORT || 3000;
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

// Default route for checking if the server is up
app.get("/", (req, res) => {
    console.log("GET / request received");
    res.send("Welcome to the Replicate Demo API! Use the /predict endpoint.");
});

// Test endpoint to verify logging
app.get("/test-logs", (req, res) => {
    console.log("========== TEST LOGS ==========");
    console.log("1. Test log message");
    console.log("2. Environment variables present:", {
        PORT: !!process.env.PORT,
        REPLICATE_API_KEY: !!process.env.REPLICATE_API_KEY
    });
    console.log("========== END TEST LOGS ==========");
    res.json({ message: "Test logs have been written" });
});

// Endpoint to call Replicate API
app.post("/predict", async (req, res) => {
    try {
        console.log("========== START OF REQUEST ==========");
        console.log("1. Received POST request to /predict");
        console.log("2. Request body:", req.body);
        console.log("3. REPLICATE_API_KEY present:", !!REPLICATE_API_KEY);

        const input = {
            top_p: 1,
            prompt: req.body.prompt || "What is the speed of an unladen swallow?",
            max_tokens: 20480,
            temperature: 0.1,
            presence_penalty: 0,
            frequency_penalty: 0
        };

        console.log("4. Prepared input:", input);
        console.log("5. About to make API call to Replicate...");

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

        console.log("6. Received initial response from Replicate");
        console.log("7. Response status:", response.status);
        console.log("8. Initial response data:", response.data);

        // Get the prediction ID from the response
        const predictionId = response.data.id;
        console.log("9. Prediction ID:", predictionId);

        // Poll for the result
        let prediction = response.data;
        while (prediction.status !== "succeeded" && prediction.status !== "failed") {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            const pollResponse = await axios.get(
                `https://api.replicate.com/v1/predictions/${predictionId}`,
                {
                    headers: {
                        Authorization: `Token ${REPLICATE_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            prediction = pollResponse.data;
            console.log("10. Current status:", prediction.status);
        }

        if (prediction.status === "succeeded") {
            console.log("11. Generated text:", prediction.output);
        } else {
            console.log("11. Generation failed:", prediction.error);
        }

        console.log("========== END OF REQUEST ==========");
        
        res.json(prediction);
    } catch (error) {
        console.error("Error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            config: error.config
        });
        res.status(500).json({ 
            error: error.message,
            details: error.response?.data
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
