import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db
from typing import List

class Object(db.Model):
    __tablename__ = "objects"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(255))

    project_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    project: so.Mapped["Project"] = so.relationship(back_populates="objects")

    works: so.Mapped[List["Work"]] = so.relationship(
        back_populates="object", 
        cascade="all, delete-orphan", 
        passive_deletes=True
    )

    def __repr__(self):
        return f"<Object {self.name}>"