# Clarivo Backend API

Backend server for the Clarivo speech therapy application.

## Features

- Express.js server
- RESTful API endpoints
- CORS enabled
- Environment variable configuration
- Health check endpoint
- Prepared for Azure Speech API integration

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (use `.env.example` as template):

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`

4. Start the server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Sessions

- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Create new session
- `DELETE /api/sessions/:id` - Delete session

### Speech Analysis (Placeholder for Azure Integration)

- `POST /api/speech/analyze` - Analyze speech audio
- `POST /api/speech/synthesize` - Text-to-speech synthesis

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `AZURE_SPEECH_KEY` - Azure Speech API key (for future integration)
- `AZURE_SPEECH_REGION` - Azure Speech API region

## Azure Speech API Integration

To integrate Azure Speech API:

1. Create an Azure Speech Service resource
2. Add your subscription key to `AZURE_SPEECH_KEY`
3. Add your region to `AZURE_SPEECH_REGION`
4. Implement the speech analysis logic in `src/routes/speech.js`

## Project Structure

```
Backend/
├── src/
│   ├── server.js          # Main server file
│   └── routes/
│       ├── index.js       # Route aggregator
│       ├── sessions.js    # Session management routes
│       └── speech.js      # Speech API routes
├── .env                   # Environment variables
├── .env.example          # Environment template
├── package.json
└── README.md
```
