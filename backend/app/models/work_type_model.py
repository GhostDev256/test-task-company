import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db
from typing import List

class WorkType(db.Model):
    __tablename__ = "work_types"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(255), unique=True, index=True)
    order: so.Mapped[int] = so.mapped_column(sa.Integer)
    color: so.Mapped[str] = so.mapped_column(sa.String(64))
    category: so.Mapped[str] = so.mapped_column(sa.String(255), index=True)

    works: so.Mapped[List["Work"]] = so.relationship(
        back_populates="work_type_rel", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<WorkType {self.name} ({self.category})>"
