import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db
from app.models.project_model import Project
from typing import List

class Block(db.Model):
    __tablename__ = "blocks"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64))

    project_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    project: so.Mapped["Project"] = so.relationship(back_populates="blocks")

    floors: so.Mapped[List["Floor"]] = so.relationship(
    back_populates="block", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Block {self.name} of Project {self.project_id}>"