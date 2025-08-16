import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db
from app.models.project_model import Project
from app.models.work_model import Work

class Object(db.Model):
    __tablename__ = "objects"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(255))

    project_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    project: so.Mapped["Project"] = so.relationship(back_populates="objects")

    works: so.WriteOnlyMapped["Work"] = so.relationship(back_populates="object")

    def __repr__(self):
        return f"<Object {self.name}>"