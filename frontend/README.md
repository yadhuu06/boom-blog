# Boom-Blog

Boom-Blog is a modern blog platform built with **FastAPI** for the backend and **React** for the frontend.  
It features JWT authentication, PostgreSQL database integration, Cloudinary for media storage, and Alembic for database migrations.

---

## 🛠 Features

- User registration and login (JWT-based authentication)
- Admin panel for managing users
- CRUD operations for blog posts
- Cloudinary integration for media uploads
- FastAPI backend with Pydantic settings
- React frontend with interactive UI
- Database migrations using Alembic
- Users can be active/inactive and admin/non-admin

---

## 📁 Project Structure

Boom-Blog/
├── backend/ # FastAPI backend
│ ├── app/
│ │ ├── api/ # API routes
│ │ ├── core/ # Config & settings
│ │ ├── db/ # Database setup & models
│ │ ├── schemas/ # Pydantic models
│ │ ├── crud/ # CRUD operations
│ │ └── main.py # FastAPI app entry point
│ └── alembic/ # Alembic migrations
├── frontend/ # React frontend
│ ├── src/
│ └── package.json
├── .env # Environment variables
└── README.md

makefile


---

## ⚙️ Environment Variables

Create a `.env` file in the **project root** with the following structure:

```env
# ── App Config ──────────────────────────────
PROJECT_NAME=Boom-Blog
ENVIRONMENT=development

# ── Database ────────────────────────────────
DATABASE_URL=postgresql+psycopg2://<username>:<password>@localhost:5432/<database_name>
DB_SCHEMA=boom_blog

# ── Security / JWT ──────────────────────────
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ── Cloudinary ─────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=Boom
CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
Note: Replace placeholders with your actual credentials.

💾 Backend Setup (FastAPI)
Create a virtual environment:

python3 -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
Install dependencies:

pip install -r requirements.txt
Apply Alembic migrations:

alembic upgrade head
Run the backend:

uvicorn app.main:app --reload
Backend will be available at http://127.0.0.1:8000.

🌐 Frontend Setup (React)
Navigate to the frontend folder:

cd frontend
Install dependencies:

npm install
Start the development server:


npm start