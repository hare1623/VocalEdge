const { Configuration, OpenAIApi } = require("openai");

// Load environment variables
require("dotenv").config();

// OpenAI Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = openai;
