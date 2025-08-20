import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db

from app.models.floor_model import Floor
from app.models.work_type_model import WorkType
from app.models.executor_model import Executor
from typing import List

class Work(db.Model):
    __tablename__ = "works"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)

    executor_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("executors.id", ondelete="CASCADE"), index=True
    )
    executor_rel: so.Mapped["Executor"] = so.relationship(back_populates="works")

    work_type_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("work_types.id", ondelete="CASCADE"), index=True
    )
    work_type_rel: so.Mapped["WorkType"] = so.relationship(back_populates="works")

    start_date: so.Mapped[sa.Date] = so.mapped_column(sa.Date)
    end_date: so.Mapped[sa.Date] = so.mapped_column(sa.Date)
    status: so.Mapped[str] = so.mapped_column(sa.String(64))
    priority: so.Mapped[int] = so.mapped_column(sa.Integer)
    progress: so.Mapped[int] = so.mapped_column(sa.Integer)
    note: so.Mapped[str] = so.mapped_column(sa.Text, nullable=True)

    floor_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("floors.id", ondelete="CASCADE"), index=True
    )
    floor: so.Mapped["Floor"] = so.relationship(back_populates="works")

    object_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("objects.id", ondelete="CASCADE"), index=True
    )
    object: so.Mapped["Object"] = so.relationship(back_populates="works")

    def __repr__(self):
        return f"<Work {self.work_type_rel.name} (Project: {self.floor.block.project.name})>"
