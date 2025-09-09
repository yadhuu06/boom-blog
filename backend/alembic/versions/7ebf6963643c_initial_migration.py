"""Full initial migration

Revision ID: 7ebf6963643c
Revises: 
Create Date: 2025-09-09 09:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '7ebf6963643c'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create schema
    op.execute("CREATE SCHEMA IF NOT EXISTS boom_blog")

    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('username', sa.String(), nullable=False, unique=True),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_admin', sa.Boolean(), nullable=True),
        schema='boom_blog'
    )

    # Posts table
    op.create_table(
        'posts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('author_id', sa.Integer(), sa.ForeignKey('boom_blog.users.id'), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('like_count', sa.Integer(), nullable=True),
        sa.Column('view_count', sa.Integer(), nullable=True),
        schema='boom_blog'
    )

    # Comments table
    op.create_table(
        'comments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('is_approved', sa.Boolean(), nullable=True),
        sa.Column('post_id', sa.Integer(), sa.ForeignKey('boom_blog.posts.id'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('boom_blog.users.id'), nullable=True),
        schema='boom_blog'
    )

    # Likes table
    op.create_table(
        'likes',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('boom_blog.users.id'), primary_key=True),
        sa.Column('post_id', sa.Integer(), sa.ForeignKey('boom_blog.posts.id'), primary_key=True),
        schema='boom_blog'
    )

    # Views table
    op.create_table(
        'views',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('boom_blog.users.id'), primary_key=True),
        sa.Column('post_id', sa.Integer(), sa.ForeignKey('boom_blog.posts.id'), primary_key=True),
        schema='boom_blog'
    )


def downgrade() -> None:
    op.drop_table('views', schema='boom_blog')
    op.drop_table('likes', schema='boom_blog')
    op.drop_table('comments', schema='boom_blog')
    op.drop_table('posts', schema='boom_blog')
    op.drop_table('users', schema='boom_blog')
    op.execute("DROP SCHEMA IF EXISTS boom_blog")
