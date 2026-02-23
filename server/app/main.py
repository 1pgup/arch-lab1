from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from . import crud, models, schemas, auth
from .database import get_db, engine
from fastapi.middleware.cors import CORSMiddleware

# Создаём приложение FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы (GET, POST и т.д.)
    allow_headers=["*"],  # Разрешить все заголовки
)

# Подключаем маршруты для аутентификации
app.include_router(auth.router, prefix="/auth", tags=["auth"])

# Создаём все таблицы в базе данных
models.Base.metadata.create_all(bind=engine)

# OAuth2 схема для получения токена
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Главная страница для проверки работы сервера
@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

# Получение задач для авторизованного пользователя
@app.get("/tasks", response_model=List[schemas.Task], summary="Get all tasks for the current user", tags=["tasks"])
def get_user_tasks(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = auth.verify_token(token, db)
    tasks = crud.get_tasks(db, user)
    return tasks

@app.get("/tasks/{task_id}", response_model=schemas.Task, summary="Get a task by ID", tags=["tasks"])
def get_task(task_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = auth.verify_token(token, db)
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found or not authorized")
    
    if user.role not in ["moderator", "admin"] and db_task.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to update this task")

    return db_task

# Создание новой задачи для пользователя
@app.post("/tasks", response_model=schemas.Task, summary="Create a new task", tags=["tasks"])
def create_task(task: schemas.TaskCreate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = auth.verify_token(token, db)
    new_task = crud.create_task(db, task, user.id)
    return new_task


# Обновление задачи
@app.put("/tasks/{task_id}", response_model=schemas.Task, summary="Update a task", tags=["tasks"])
def update_task(task_id: int, task: schemas.TaskCreate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = auth.verify_token(token, db)
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found or not authorized")
    
    if user.role not in ["moderator", "admin"] and db_task.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to update this task")

    db_task.title = task.title
    db_task.description = task.description
    db_task.is_completed = task.is_completed
    db.commit()
    db.refresh(db_task)
    return db_task

# Удаление задачи
@app.delete("/tasks/{task_id}", summary="Delete a task", tags=["tasks"])
def delete_task(task_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = auth.verify_token(token, db)
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found or not authorized")
    
    if user.role not in ["moderator", "admin"] and db_task.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to update this task")

    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}

@app.get("/users", response_model=List[schemas.User], summary="Get list of users", tags=["admin"])
def get_users(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = auth.verify_token(token, db)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="You are not authorized to view users")

    return db.query(models.User).all()  # Получаем список всех пользователей

@app.delete("/users/{user_id}", summary="Delete a user", tags=["admin"])
def delete_user(user_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    admin = auth.verify_token(token, db)
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="You are not authorized to delete users")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.query(models.Task).filter(models.Task.owner_id == user_id).delete()
    db.commit()

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
