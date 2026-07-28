"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-07-28

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


scooter_status = postgresql.ENUM(
    "available", "in_use", "maintenance", "offline", name="scooter_status"
)
rental_status = postgresql.ENUM("active", "completed", name="rental_status")


def upgrade() -> None:
    # Enum types are created implicitly by op.create_table() below (each type
    # is only referenced by a single table here), so they must NOT also be
    # created manually up front -- doing both raises "type already exists".
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False, server_default="Administrator"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "scooters",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("number", sa.String(length=50), nullable=False),
        sa.Column("model", sa.String(length=100), nullable=False),
        sa.Column("status", scooter_status, nullable=False, server_default="available"),
        sa.Column("battery_level", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_scooters_number", "scooters", ["number"], unique=True)

    op.create_table(
        "customers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=False),
        sa.Column("balance", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_customers_phone", "customers", ["phone"], unique=True)

    op.create_table(
        "rentals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "scooter_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("scooters.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "customer_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("customers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("status", rental_status, nullable=False, server_default="active"),
        sa.Column("start_time", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cost", sa.Numeric(10, 2), nullable=True),
    )

    op.create_table(
        "app_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("price_per_minute", sa.Numeric(10, 2), nullable=False, server_default="5.0"),
    )


def downgrade() -> None:
    op.drop_table("app_settings")
    op.drop_table("rentals")
    op.drop_index("ix_customers_phone", table_name="customers")
    op.drop_table("customers")
    op.drop_index("ix_scooters_number", table_name="scooters")
    op.drop_table("scooters")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    rental_status.drop(op.get_bind(), checkfirst=True)
    scooter_status.drop(op.get_bind(), checkfirst=True)
