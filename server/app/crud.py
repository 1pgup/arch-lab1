from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

# Инициализация контекста для хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Функция для хеширования пароля
def hash_password(password: str):
    password = password[:72]  # Обрезаем пароль до 72 символов
    return pwd_context.hash(password)

# Функция для проверки пароля
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# Создание пользователя
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username, email=user.email, hashed_password=hash_password(user.password), role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Получение пользователя по имени
def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

# Создание задачи
def create_task(db: Session, task: schemas.TaskCreate, user_id: int):
    db_task = models.Task(**task.dict(), owner_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# Получение всех задач для пользователя
def get_tasks(db: Session, user: models.User):
    if user.role in ["moderator", "admin"]:
        return db.query(models.Task).all()
    return db.query(models.Task).filter(models.Task.owner_id == user.id).all()
