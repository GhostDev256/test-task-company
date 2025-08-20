import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db
from typing import List

class Project(db.Model):
    __tablename__ = "projects"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    code: so.Mapped[str] = so.mapped_column(sa.String(64), unique=True, index=True)
    icon: so.Mapped[str] = so.mapped_column(sa.String(64), default="🏢")
    name: so.Mapped[str] = so.mapped_column(sa.String(255))
    description: so.Mapped[str] = so.mapped_column(sa.Text, nullable=True)
    client: so.Mapped[str] = so.mapped_column(sa.String(255), nullable=True)
    contractor: so.Mapped[str] = so.mapped_column(sa.String(255), nullable=True)
    address: so.Mapped[str] = so.mapped_column(sa.String(255), nullable=True)
    start_date: so.Mapped[sa.Date] = so.mapped_column(sa.Date, nullable=True)
    end_date: so.Mapped[sa.Date] = so.mapped_column(sa.Date, nullable=True)
    budget: so.Mapped[float] = so.mapped_column(sa.Float, nullable=True)

    objects: so.Mapped[List["Object"]] = so.relationship(
    back_populates="project", cascade="all, delete-orphan"
    )
    blocks: so.Mapped[List["Block"]] = so.relationship(
        back_populates="project", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Project {self.code} {self.name}>"