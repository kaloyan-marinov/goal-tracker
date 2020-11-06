"""goals table (related to the users table in a many-to-1 manner)

Revision ID: 15652658e0a6
Revises: fb08d20f689b
Create Date: 2020-11-03 06:19:24.615782

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "15652658e0a6"
down_revision = "fb08d20f689b"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "goals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=256), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"],),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("goals")
    # ### end Alembic commands ###
