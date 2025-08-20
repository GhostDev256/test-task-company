import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db
from typing import List

class Executor(db.Model):
    __tablename__ = "executors"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(255), unique=True, index=True)

    works: so.Mapped[List["Work"]] = so.relationship(
        back_populates="executor_rel", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Executor {self.name}>"
