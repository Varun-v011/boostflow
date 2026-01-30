from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, relationship, DeclarativeBase
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("DATABASE_URL not found in environment variables. Please check your .env file.")

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
    
    # Shutdown (cleanup if needed)
    print("🛑 Shutting down...")

# ==================== FASTAPI APP ====================

app = FastAPI(
    title="JobTracker API",
    version="1.0.0",
    description="Job application tracking with gamification",
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
            hashed_password="demo"
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

# ==================== CONSTANTS ====================

TASK_CATEGORIES = {
    "APPLICATION": 10,
    "NETWORKING": 8,
    "SKILL_BUILDING": 15,
    "INTERVIEW_PREP": 12,
    "RESEARCH": 6,
    "RESUME": 10,
    "FOLLOW_UP": 5,
    "OTHER": 5
}

ACHIEVEMENTS = {
    "first_task": {"points": 0},
    "streak_3": {"points": 50},
    "streak_7": {"points": 100},
    "points_100": {"points": 0},
    "points_500": {"points": 0},
    "tasks_50": {"points": 50},
    "daily_5": {"points": 25}
}

# ==================== ROUTES ====================

@app.get("/")
def read_root():
    return {
        "message": "JobTracker API is running",
        "version": "1.0.0",
        "database": "Supabase PostgreSQL",
        "docs": "/docs"
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)