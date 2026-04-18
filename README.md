# Multi Agent System

A research-focused multi-agent application with a React frontend and a FastAPI backend. The system uses LangChain agents, Mistral AI for language generation, and Tavily for web search and scraping.

## Project Structure

- `client/` - React + Vite frontend
- `Server/` - FastAPI backend with LangChain agents and research pipeline

## Features

- Search agent that finds recent and reliable information
- Reader agent that scrapes a selected URL for deeper content
- Writer chain that generates a structured research report
- Critic chain that evaluates the generated report
- React UI for submitting topics and viewing generated research

## Backend

The backend is implemented with FastAPI in `Server/server.py`.
It exposes a single endpoint:

- `POST /research` - accepts JSON with a `topic` field and returns the research pipeline result

The research pipeline is defined in `Server/pipeline.py` and uses:

- `Server/agents.py` to build LangChain agents and prompt chains
- `Server/tools.py` for web search and URL scraping utilities

### Backend Dependencies

- FastAPI
- LangChain
- langchain-mistralai
- tavily-python
- requests
- beautifulsoup4
- pydantic
- python-dotenv
- aiohttp
- tenacity
- rich

## Frontend

The frontend is a React application powered by Vite.
It is configured in `client/package.json` with dependencies such as:

- `react`
- `react-dom`
- `axios`
- `react-hot-toast`
- `react-markdown`
- `react-syntax-highlighter`
- `remark-gfm`

## Setup

### Backend

1. Open a terminal in `Server/`
2. Create and activate a virtual environment
3. Install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

4. Create a `.env` file in `Server/` with the required API keys:

```env
TAVILY_API_KEY=your_tavily_api_key
MISTRALAI_API_KEY=your_mistralai_api_key
```

> The backend loads environment variables with `python-dotenv` in `Server/tools.py` and `Server/agents.py`.

### Frontend

1. Open a terminal in `client/`
2. Install dependencies:

```powershell
npm install
```

3. Start the development server:

```powershell
npm run dev
```

## Running the Project

### Start backend

From `Server/`:

```powershell
uvicorn server:app --reload
```

### Start frontend

From `client/`:

```powershell
npm run dev
```

### Use the API

Send a POST request to the backend:

```http
POST http://localhost:8000/research
Content-Type: application/json

{
  "topic": "Artificial intelligence in healthcare"
}
```

## Notes

- CORS is enabled for development in `Server/server.py`
- The backend uses a Mistral model (`mistral-medium`) and Tavily search
- The report generation chain includes an introduction, key findings, conclusion, and sources

## License

This project does not include a license file by default. Add one if you want to publish or share this repository publicly.
