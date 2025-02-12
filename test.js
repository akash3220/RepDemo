const axios = require('axios');

async function testEndpoint() {
    try {
        console.log('Testing /predict endpoint...');
        const response = await axios.post('https://repdemo-1.onrender.com/predict', {
            prompt: 'Hello, how are you?'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testEndpoint();
