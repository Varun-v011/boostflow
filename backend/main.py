from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse 
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, relationship, DeclarativeBase
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from google import genai
import json
import PyPDF2
import io

load_dotenv()

# Supabase Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("DATABASE_URL not found in environment variables. Please check your .env file.")

# Google Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    print("✅ Gemini API configured")
else:
    print("⚠️  GEMINI_API_KEY not found - AI Assistant will be disabled")

# ✅ Initialize Email Sync Service
email_sync_service = None
if GEMINI_API_KEY:
    from email_sync import create_email_sync_service
    email_sync_service = create_email_sync_service(gemini_api_key=GEMINI_API_KEY)
    print("✅ Email sync service configured")
else:
    print("⚠️  Email sync disabled - GEMINI_API_KEY required")

# Create engine with Supabase-specific settings
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "connect_timeout": 10,
        "sslmode": "require"
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# SQLAlchemy 2.0 Base
class Base(DeclarativeBase):
    pass

# ==================== DATABASE MODELS ====================

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company = Column(String, index=True)
    position = Column(String)
    status = Column(String, default="Applied")
    date_applied = Column(DateTime, default=datetime.utcnow)
    salary = Column(String, nullable=True)
    location = Column(String, nullable=True)
    job_url = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    
    # ✅ Email sync fields
    email_message_id = Column(String, nullable=True, unique=True)
    auto_imported = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="applications")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(String, nullable=True)
    category = Column(String)
    priority = Column(String, default="medium")
    completed = Column(Boolean, default=False)
    points = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="tasks")

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(String)
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="achievements")

class UserStats(Base):
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    total_points = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    last_completed_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    content = Column(String)
    file_path = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    ats_score = Column(Integer, nullable=True)
    ats_feedback = Column(String, nullable=True) 
    
    user = relationship("User", back_populates="resumes")

# ✅ Email Sync Log Model
class EmailSyncLog(Base):
    __tablename__ = "email_sync_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    emails_processed = Column(Integer, default=0)
    applications_added = Column(Integer, default=0)
    applications_updated = Column(Integer, default=0)
    status = Column(String)  # 'success', 'partial', 'error'
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# ==================== PYDANTIC MODELS ====================

class ApplicationCreate(BaseModel):
    company: str
    position: str
    status: str = "Applied"
    date_applied: Optional[datetime] = None
    salary: Optional[str] = None
    location: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = None
    salary: Optional[str] = None
    location: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    company: str
    position: str
    status: str
    date_applied: datetime
    salary: Optional[str]
    location: Optional[str]
    job_url: Optional[str]
    notes: Optional[str]
    
    # ✅ Email sync fields
    email_message_id: Optional[str] = None
    auto_imported: bool = False
    
    created_at: datetime
    updated_at: datetime

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    priority: str = "medium"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    description: Optional[str]
    category: str
    priority: str
    completed: bool
    points: int
    created_at: datetime
    completed_at: Optional[datetime]

class StatsResponse(BaseModel):
    total_points: int
    current_streak: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    today_completed: int
    achievements_count: int

class AIMessageRequest(BaseModel):
    message: str
    tool_id: str
    conversation_history: Optional[List[dict]] = []

class AIMessageResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] = None

class ResumeCreate(BaseModel):
    filename: str
    content: str

class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    filename: str
    content: str
    uploaded_at: datetime
    is_active: bool
    ats_score: Optional[int] = None
    ats_feedback: Optional[str] = None

# ✅ Email Sync Request Model
class EmailSyncRequest(BaseModel):
    days_back: int = 30
    use_ai: bool = False

# ==================== CONSTANTS ====================

TASK_CATEGORIES = {
    "Resume Update": 10,
    "Cover Letter": 15,
    "Apply to Job": 20,
    "Follow Up": 10,
    "Interview Prep": 15,
    "Networking": 10,
    "Skill Building": 25,
    "Other": 5
}

ACHIEVEMENTS = {
    "first_task": {"name": "Getting Started", "description": "Complete your first task", "points": 50},
    "streak_3": {"name": "On a Roll", "description": "3-day streak", "points": 100},
    "streak_7": {"name": "Week Warrior", "description": "7-day streak", "points": 200},
    "points_100": {"name": "Century Club", "description": "Earn 100 points", "points": 50},
    "points_500": {"name": "High Achiever", "description": "Earn 500 points", "points": 100},
    "tasks_50": {"name": "Task Master", "description": "Complete 50 tasks", "points": 150},
    "daily_5": {"name": "Power User", "description": "Complete 5 tasks in one day", "points": 100}
}

# ==================== LIFESPAN EVENTS ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Connected to Supabase PostgreSQL")
        print("✅ Database tables initialized")
        print(f"🚀 API running at http://localhost:8000")
        print(f"📚 API docs at http://localhost:8000/docs")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please check your DATABASE_URL in .env file")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down...")

# ==================== FASTAPI APP ====================

app = FastAPI(
    title="JobTracker API",
    version="1.0.0",
    description="Job application tracking with gamification and AI assistance",
    lifespan=lifespan
)

# CORS middleware
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== DEPENDENCIES ====================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

DEMO_USER_ID = 1

def get_or_create_demo_user(db: Session):
    user = db.query(User).filter(User.id == DEMO_USER_ID).first()
    if not user:
        user = User(
            id=DEMO_USER_ID,
            email="demo@jobtracker.com",
            username="demo_user",
            hashed_password="demo_hash"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def get_or_create_user_stats(db: Session, user_id: int):
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        stats = UserStats(user_id=user_id)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats

# ==================== AI ASSISTANT ROUTES ====================

AI_TOOL_PROMPTS = {
    "resume-match": """You are an expert resume analyzer. Analyze the resume and job description provided, 
    and give detailed feedback on:
    1. How well the resume matches the job requirements
    2. Key skills that are present/missing
    3. Specific suggestions for improvement
    4. A match percentage
    Be constructive and specific in your feedback.""",
    
    "cover-letter": """You are an expert cover letter writer. Create a professional, compelling cover letter 
    that:
    1. Addresses the specific job and company
    2. Highlights relevant experience and skills
    3. Shows enthusiasm and fit for the role
    4. Maintains a professional yet personable tone
    5. Is concise (around 250-300 words)""",
    
    "interview-prep": """You are an experienced interview coach. Help prepare for the interview by:
    1. Providing common interview questions for the role
    2. Suggesting strong example answers
    3. Giving tips for behavioral questions
    4. Offering company-specific insights
    5. Providing negotiation strategies""",
    
    "company-research": """You are a company research specialist. Provide comprehensive insights about the company:
    1. Company overview and culture
    2. Recent news and developments
    3. Products/services and market position
    4. Values and mission
    5. What interviewers look for in candidates""",
    
    "career-advice": """You are a career counselor providing personalized guidance. Offer advice on:
    1. Career development strategies
    2. Job search best practices
    3. Skill development recommendations
    4. Industry insights and trends
    5. Work-life balance and career satisfaction"""
}

@app.post("/api/ai/chat")
async def ai_chat(request: AIMessageRequest):
    """Handle AI assistant chat requests with STREAMING"""
    if not GEMINI_API_KEY:
        return AIMessageResponse(
            response="AI Assistant is not configured. Please add GEMINI_API_KEY to your environment variables.",
            success=False,
            error="API key not configured"
        )
    
    system_prompt = AI_TOOL_PROMPTS.get(
        request.tool_id, 
        "You are a helpful career assistant. Provide professional, detailed, and actionable advice."
    )
    
    COMPLEX_TASKS = ["resume-match", "company-research"]
    
    if request.tool_id in COMPLEX_TASKS:
        selected_model = "gemini-3-pro-preview"
        print(f"🧠 Using Gemini 3 Pro for complex reasoning: {request.tool_id}")
    else:
        selected_model = "gemini-3-flash-preview"
        print(f"⚡ Using Gemini 3 Flash for fast response: {request.tool_id}")
    
    full_prompt = f"{system_prompt}\n\nUser: {request.message}"
    
    if request.conversation_history:
        history_text = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
            for msg in request.conversation_history[-5:]
        ])
        full_prompt = f"{system_prompt}\n\nPrevious conversation:\n{history_text}\n\nUser: {request.message}"
    
    async def generate_stream():
        try:
            for chunk in client.models.generate_content_stream(
                model=selected_model,
                contents=full_prompt,
                config={
                    "max_output_tokens": 1000,
                    "temperature": 0.7
                }
            ):
                if chunk.text:
                    yield f"data: {json.dumps({'text': chunk.text})}\n\n"
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            error_msg = json.dumps({'error': str(e)})
            yield f"data: {error_msg}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/ai/status")
async def ai_status():
    """Check if AI assistant is configured and available"""
    return {
        "available": GEMINI_API_KEY is not None,
        "models": ["gemini-3-pro-preview", "gemini-3-flash-preview"] if GEMINI_API_KEY else None,
        "message": "AI Assistant ready with intelligent model routing" if GEMINI_API_KEY else "GEMINI_API_KEY not configured"
    }

# ==================== ROOT ROUTE ====================

@app.get("/")
def root():
    return {
        "message": "JobTracker API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "database": "connected" if DATABASE_URL else "not configured",
        "ai_assistant": "enabled" if GEMINI_API_KEY else "disabled"
    }

# ========== APPLICATION ROUTES ==========

@app.get("/api/applications", response_model=List[ApplicationResponse])
def get_applications(db: Session = Depends(get_db)):
    get_or_create_demo_user(db)
    applications = db.query(Application).filter(
        Application.user_id == DEMO_USER_ID
    ).order_by(Application.created_at.desc()).all()
    return applications

@app.post("/api/applications", response_model=ApplicationResponse)
def create_application(application: ApplicationCreate, db: Session = Depends(get_db)):
    get_or_create_demo_user(db)
    db_application = Application(
        user_id=DEMO_USER_ID,
        **application.dict()
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@app.get("/api/applications/{application_id}", response_model=ApplicationResponse)
def get_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == DEMO_USER_ID
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@app.put("/api/applications/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    application_update: ApplicationUpdate,
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == DEMO_USER_ID
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    for key, value in application_update.dict(exclude_unset=True).items():
        setattr(application, key, value)
    
    db.commit()
    db.refresh(application)
    return application

@app.delete("/api/applications/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == DEMO_USER_ID
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(application)
    db.commit()
    return {"message": "Application deleted successfully"}

# ========== TASK ROUTES ==========

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    get_or_create_demo_user(db)
    tasks = db.query(Task).filter(
        Task.user_id == DEMO_USER_ID
    ).order_by(Task.created_at.desc()).all()
    return tasks

@app.post("/api/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    get_or_create_demo_user(db)
    points = TASK_CATEGORIES.get(task.category, 5)
    db_task = Task(
        user_id=DEMO_USER_ID,
        points=points,
        **task.dict()
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/api/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == DEMO_USER_ID
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task_update.completed is not None:
        was_completed = task.completed
        is_completing = task_update.completed and not was_completed
        is_uncompleting = not task_update.completed and was_completed
        
        stats = get_or_create_user_stats(db, DEMO_USER_ID)
        
        if is_completing:
            task.completed = True
            task.completed_at = datetime.utcnow()
            stats.total_points += task.points
            
            today = datetime.utcnow().date().isoformat()
            yesterday = (datetime.utcnow().date()).isoformat()
            
            if stats.last_completed_date != today:
                if stats.last_completed_date == yesterday:
                    stats.current_streak += 1
                else:
                    stats.current_streak = 1
                stats.last_completed_date = today
            
            stats.updated_at = datetime.utcnow()
            check_and_unlock_achievements(db, DEMO_USER_ID, stats)
            
        elif is_uncompleting:
            task.completed = False
            task.completed_at = None
            stats.total_points = max(0, stats.total_points - task.points)
            stats.updated_at = datetime.utcnow()
    
    for key, value in task_update.dict(exclude_unset=True, exclude={'completed'}).items():
        setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    return task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == DEMO_USER_ID
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.completed:
        stats = get_or_create_user_stats(db, DEMO_USER_ID)
        stats.total_points = max(0, stats.total_points - task.points)
        stats.updated_at = datetime.utcnow()
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

# ========== STATS & ACHIEVEMENTS ==========

@app.get("/api/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    get_or_create_demo_user(db)
    stats = get_or_create_user_stats(db, DEMO_USER_ID)
    
    all_tasks = db.query(Task).filter(Task.user_id == DEMO_USER_ID).all()
    completed_tasks = [t for t in all_tasks if t.completed]
    pending_tasks = [t for t in all_tasks if not t.completed]
    
    today = datetime.utcnow().date()
    today_completed = [t for t in completed_tasks if t.completed_at and t.completed_at.date() == today]
    
    achievements = db.query(UserAchievement).filter(UserAchievement.user_id == DEMO_USER_ID).all()
    
    return StatsResponse(
        total_points=stats.total_points,
        current_streak=stats.current_streak,
        total_tasks=len(all_tasks),
        completed_tasks=len(completed_tasks),
        pending_tasks=len(pending_tasks),
        today_completed=len(today_completed),
        achievements_count=len(achievements)
    )

@app.get("/api/achievements")
def get_achievements(db: Session = Depends(get_db)):
    get_or_create_demo_user(db)
    achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == DEMO_USER_ID
    ).all()
    return [{"achievement_id": a.achievement_id, "unlocked_at": a.unlocked_at} for a in achievements]

def check_and_unlock_achievements(db: Session, user_id: int, stats: UserStats):
    existing = db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    existing_ids = {a.achievement_id for a in existing}
    
    all_tasks = db.query(Task).filter(Task.user_id == user_id).all()
    completed_tasks = [t for t in all_tasks if t.completed]
    
    today = datetime.utcnow().date()
    today_completed = [t for t in completed_tasks if t.completed_at and t.completed_at.date() == today]
    
    new_achievements = []
    
    if len(completed_tasks) >= 1 and "first_task" not in existing_ids:
        new_achievements.append("first_task")
    if stats.current_streak >= 3 and "streak_3" not in existing_ids:
        new_achievements.append("streak_3")
    if stats.current_streak >= 7 and "streak_7" not in existing_ids:
        new_achievements.append("streak_7")
    if stats.total_points >= 100 and "points_100" not in existing_ids:
        new_achievements.append("points_100")
    if stats.total_points >= 500 and "points_500" not in existing_ids:
        new_achievements.append("points_500")
    if len(completed_tasks) >= 50 and "tasks_50" not in existing_ids:
        new_achievements.append("tasks_50")
    if len(today_completed) >= 5 and "daily_5" not in existing_ids:
        new_achievements.append("daily_5")
    
    for achievement_id in new_achievements:
        achievement = UserAchievement(user_id=user_id, achievement_id=achievement_id)
        db.add(achievement)
        bonus = ACHIEVEMENTS[achievement_id]["points"]
        stats.total_points += bonus
    
    if new_achievements:
        db.commit()
    
    return new_achievements

@app.post("/api/reset")
def reset_all_data(db: Session = Depends(get_db)):
    db.query(Task).filter(Task.user_id == DEMO_USER_ID).delete()
    db.query(Application).filter(Application.user_id == DEMO_USER_ID).delete()
    db.query(UserAchievement).filter(UserAchievement.user_id == DEMO_USER_ID).delete()
    db.query(UserStats).filter(UserStats.user_id == DEMO_USER_ID).delete()
    db.commit()
    return {"message": "All data reset successfully"}

# ========== RESUME ROUTES ==========

@app.post("/api/resumes/extract-text")
async def extract_text_from_file(file: UploadFile = File(...)):
    """Extract text from uploaded PDF, TXT, or DOCX file"""
    try:
        filename = file.filename.lower()
        content = await file.read()
        
        if filename.endswith('.txt'):
            text = content.decode('utf-8')
            return {
                "success": True,
                "text": text,
                "filename": file.filename
            }
        
        elif filename.endswith('.pdf'):
            pdf_file = io.BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            if not text.strip():
                return {
                    "success": False,
                    "error": "Could not extract text from PDF. The PDF might be an image or protected."
                }
            
            return {
                "success": True,
                "text": text.strip(),
                "filename": file.filename
            }
        
        elif filename.endswith('.docx') or filename.endswith('.doc'):
            return {
                "success": False,
                "error": "DOCX files are not yet supported. Please convert to PDF or copy-paste the text."
            }
        
        else:
            return {
                "success": False,
                "error": "Unsupported file type. Please use PDF or TXT files."
            }
    
    except Exception as e:
        print(f"Error extracting text: {e}")
        return {
            "success": False,
            "error": f"Failed to process file: {str(e)}"
        }

@app.get("/api/resumes", response_model=List[ResumeResponse])
def get_resumes(db: Session = Depends(get_db)):
    get_or_create_demo_user(db)
    resumes = db.query(Resume).filter(
        Resume.user_id == DEMO_USER_ID
    ).order_by(Resume.uploaded_at.desc()).all()
    return resumes

@app.post("/api/resumes", response_model=ResumeResponse)
def create_resume(resume: ResumeCreate, db: Session = Depends(get_db)):
    get_or_create_demo_user(db)
    
    db.query(Resume).filter(Resume.user_id == DEMO_USER_ID).update({"is_active": False})
    
    db_resume = Resume(
        user_id=DEMO_USER_ID,
        filename=resume.filename,
        content=resume.content,
        is_active=True
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume

@app.get("/api/resumes/active", response_model=ResumeResponse)
def get_active_resume(db: Session = Depends(get_db)):
    get_or_create_demo_user(db)
    resume = db.query(Resume).filter(
        Resume.user_id == DEMO_USER_ID,
        Resume.is_active == True
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="No active resume found")
    
    return resume

@app.put("/api/resumes/{resume_id}/activate")
def activate_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == DEMO_USER_ID
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    db.query(Resume).filter(Resume.user_id == DEMO_USER_ID).update({"is_active": False})
    
    resume.is_active = True
    db.commit()
    
    return {"message": "Resume activated successfully"}

@app.delete("/api/resumes/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == DEMO_USER_ID
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}

@app.post("/api/resumes/{resume_id}/analyze-ats")
async def analyze_resume_ats(resume_id: int, db: Session = Depends(get_db)):
    """Analyze resume using Gemini AI and calculate ATS score"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == DEMO_USER_ID
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    try:
        ats_prompt = f"""You are an ATS (Applicant Tracking System) analyzer. Analyze this resume and provide:
1. An ATS compatibility score from 0-100
2. Brief feedback on what makes it ATS-friendly or not

Consider:
- Keyword optimization
- Formatting (simple structure, no complex tables/graphics)
- Standard section headings (Experience, Education, Skills)
- Quantifiable achievements
- Industry-specific keywords
- Contact information clarity

Resume Content:
{resume.content}

Respond in this exact JSON format:
{{
  "score": <number between 0-100>,
  "feedback": "<2-3 sentence summary>"
}}
"""
        
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=ats_prompt,
            config={
                "temperature": 0.2,
                "max_output_tokens": 1000
            }
        )
        
        result_text = response.text.strip()
        print(f"🤖 Raw Gemini Response: {result_text}")
        
        if "```json" in result_text:
            result_text = result_text.split("```json").split("```").strip()[1]
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
     
        print(f"🧹 Cleaned Response: {result_text}") 
        result = json.loads(result_text)
        print(f"✅ Parsed Result: {result}")
        
        resume.ats_score = result.get("score", 0)
        resume.ats_feedback = result.get("feedback", "")
        
        print(f"💾 Saving: score={resume.ats_score}, feedback={resume.ats_feedback}") 
        db.commit()
        db.refresh(resume)
        print(f"✅ Database updated successfully!") 
        
        return {
            "success": True,
            "score": resume.ats_score,
            "feedback": resume.ats_feedback
        }
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response text: {response.text}")
        return {
            "success": False,
            "error": "Failed to parse AI response"
        }
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# ========== EMAIL SYNC ROUTES ==========

@app.post("/api/email/sync")
async def sync_emails(request: EmailSyncRequest, db: Session = Depends(get_db)):
    """Sync job emails from Gmail"""
    
    if not email_sync_service:
        raise HTTPException(
            status_code=503, 
            detail="Email sync not configured. Add GEMINI_API_KEY to .env"
        )
    
    get_or_create_demo_user(db)
    
    try:
        result = email_sync_service.sync_emails(
            db_session=db,
            user_id=DEMO_USER_ID,
            days_back=request.days_back,
            use_ai=request.use_ai,
            Application=Application,
            EmailSyncLog=EmailSyncLog
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/email/sync-status")
def get_sync_status(db: Session = Depends(get_db)):
    """Get last email sync status"""
    get_or_create_demo_user(db)
    
    last_sync = db.query(EmailSyncLog).filter(
        EmailSyncLog.user_id == DEMO_USER_ID
    ).order_by(EmailSyncLog.created_at.desc()).first()
    
    if not last_sync:
        return {"last_sync": None, "status": "never_synced"}
    
    return {
        "last_sync": last_sync.created_at,
        "emails_processed": last_sync.emails_processed,
        "applications_added": last_sync.applications_added,
        "applications_updated": last_sync.applications_updated,
        "status": last_sync.status
    }

# ==================== RUN SERVER ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
