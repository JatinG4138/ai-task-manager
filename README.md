# AI Task Manager

## Overview
AI Task Manager is a web-based task management system built using FastAPI, PostgreSQL, Alembic, and React.js. The backend handles authentication, database interactions, and AI-powered features, while the frontend provides a user-friendly interface for managing tasks.

## Tech Stack
### Backend:
- **FastAPI**: High-performance web framework for the API.
- **PostgreSQL**: Relational database management system.
- **Alembic**: Database migration tool.
- **OAuth**: Authentication mechanism.
- **Socket Events**: Real-time updates via WebSockets.
- **OpenAI API**: AI-powered task enhancements.

### Frontend:
- **React.js**: JavaScript library for building UI components.
- **CSS**: Styling for the frontend.

## Project Structure
```
AI-TASK-MANAGER
│── backend
│   ├── env/                     # Environment variables
│   ├── models/                  # Database models
│   │   ├── migrations/          # Database migrations (Alembic)
│   │   ├── user.py              # User model
│   ├── schemas/                 # Pydantic schemas
│   │   ├── schema.py            # Data validation schemas
│   ├── services/                # Business logic and utilities
│   │   ├── database.py          # Database connection setup
│   │   ├── oauth.py             # Authentication handling
│   │   ├── openai.py            # AI integration
│   │   ├── socket_events.py     # WebSockets for real-time features
│   ├── main.py                  # FastAPI entry point
│   ├── utils.py                 # Utility functions
│   ├── requirements.txt         # Dependencies
│── frontend/ai_task_manager
│   ├── public/                  # Static assets
│   ├── src/                     # React source code
│   │   ├── components/          # UI components
│   │   ├── auth.js              # Authentication logic
│   │   ├── dashboard.js         # Dashboard view
│   │   ├── dashboard.css        # Styles for dashboard
│   │   ├── header.js            # Header component
│── .gitignore                   # Ignore unnecessary files
│── alembic.ini                  # Alembic configuration
```

## Setup Instructions

### Backend Setup
1. **Clone the repository:**
   ```sh
   git clone https://github.com/JatinG4138/ai-task-manager.git
   cd ai-task-manager/backend
   ```

2. **Create a virtual environment and activate it:**
   ```sh
   python -m venv env
   source env/bin/activate  # On Windows use `env\Scripts\activate`
   ```

3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   - Create a `.env` file in the `backend` directory with necessary configurations (database URL, API keys, etc.).

5. **Run database migrations:**
   ```sh
   alembic upgrade head
   ```

6. **Start the FastAPI server:**
   ```sh
   uvicorn main:app --reload
   ```

### Frontend Setup
1. **Navigate to the frontend directory:**
   ```sh
   cd ../frontend/ai_task_manager
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the React development server:**
   ```sh
   npm start
   ```

## API Endpoints
- `POST /auth/google` - User login
- `POST /auth/google/callback` - User registration
- `GET /user/me` - Get all tasks
- `GET /get_all_user` - Delete a task
- `GET /get_task` - Create a new task
- `GET /get_project` - Delete a task
- `POST /add_project` - Update a task

## Live Demo
- **Frontend:** [AI Task Manager Frontend](https://ai-task-manager-1-ohc5.onrender.com/)
- **Backend API Docs:** [FastAPI Swagger UI](https://ai-task-manager-2udz.onrender.com/docs)


## Features
- User authentication with Google
- Task management (CRUD operations) with socket
- AI-powered tag assignment (using GEMINI)
- Real-time task status updates using WebSockets

