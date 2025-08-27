# Chat GPT UI

A web interface for interacting with various AI models including OpenAI, Groq, and Ollama.

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Copy `.env.sample` as a reference if needed

## Running the Application

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3111`

## Features

- Chat interface for multiple AI models
- Code highlighting for responses
- Conversation history
- Model switching
