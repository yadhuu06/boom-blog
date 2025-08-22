from app.db.database import Base, engine
from app.models import user  # import all models here

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    init_db()
