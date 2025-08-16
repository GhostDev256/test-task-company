import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db
from app.models.floor_model import Floor
from app.models.object_model import Object

class Work(db.Model):
    __tablename__ = "works"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)

    category: so.Mapped[str] = so.mapped_column(sa.String(255))
    work_type: so.Mapped[str] = so.mapped_column(sa.String(255))
    executor: so.Mapped[str] = so.mapped_column(sa.String(255))
    start_date: so.Mapped[sa.Date] = so.mapped_column(sa.Date)
    end_date: so.Mapped[sa.Date] = so.mapped_column(sa.Date)
    status: so.Mapped[str] = so.mapped_column(sa.String(64))
    priority: so.Mapped[int] = so.mapped_column(sa.Integer)
    progress: so.Mapped[int] = so.mapped_column(sa.Integer)  # 0-100
    note: so.Mapped[str] = so.mapped_column(sa.Text)

    floor_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("floors.id", ondelete="CASCADE"), index=True
    )
    floor: so.Mapped["Floor"] = so.relationship(back_populates="works")

    object_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("objects.id", ondelete="CASCADE"), index=True
    )
    object: so.Mapped["Object"] = so.relationship(back_populates="works")

    def __repr__(self):
        return f"<Work {self.category} {self.status}>"