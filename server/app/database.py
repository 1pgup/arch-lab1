from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import os
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv()

# Строка подключения к базе данных (возможно, её нужно будет изменить на основе конфигурации)
DATABASE_URL = os.getenv("DATABASE_URL")

# Настройка движка для SQLAlchemy
engine = create_engine(DATABASE_URL, poolclass=NullPool)

# Сессия для работы с базой данных
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для всех моделей
Base = declarative_base()

# Функция для получения сессии с базой данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
