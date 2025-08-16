import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db

class Project(db.Model):
    __tablename__ = "projects"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    code: so.Mapped[str] = so.mapped_column(sa.String(64), unique=True, index=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(255))
    description: so.Mapped[str] = so.mapped_column(sa.Text)
    customer: so.Mapped[str] = so.mapped_column(sa.String(255))
    contractor: so.Mapped[str] = so.mapped_column(sa.String(255))
    address: so.Mapped[str] = so.mapped_column(sa.String(255))
    start_date: so.Mapped[sa.Date] = so.mapped_column(sa.Date)
    end_date: so.Mapped[sa.Date] = so.mapped_column(sa.Date)
    budget: so.Mapped[float] = so.mapped_column(sa.Float)

    objects: so.WriteOnlyMapped["Object"] = so.relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    blocks: so.WriteOnlyMapped["Block"] = so.relationship(
        back_populates="project", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Project {self.code} {self.name}>"