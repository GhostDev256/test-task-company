import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db
from app.models.block_model import Block

class Floor(db.Model):
    __tablename__ = "floors"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    number: so.Mapped[int] = so.mapped_column(sa.Integer)

    block_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("blocks.id", ondelete="CASCADE"), index=True
    )
    block: so.Mapped["Block"] = so.relationship(back_populates="floors")

    works: so.WriteOnlyMapped["Work"] = so.relationship(
        back_populates="floor", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Floor {self.number} of Block {self.block_id}>"