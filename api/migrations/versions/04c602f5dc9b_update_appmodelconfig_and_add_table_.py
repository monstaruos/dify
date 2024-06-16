"""update AppModelConfig and add table TracingAppConfig

Revision ID: 04c602f5dc9b
Revises: 4e99a8df00ff
Create Date: 2024-06-12 07:49:07.666510

"""
import sqlalchemy as sa
from alembic import op

import models as models

# revision identifiers, used by Alembic.
revision = '04c602f5dc9b'
down_revision = '4e99a8df00ff'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('tracing_app_configs',
    sa.Column('id', models.StringUUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
    sa.Column('app_id', models.StringUUID(), nullable=False),
    sa.Column('tracing_provider', sa.String(length=255), nullable=True),
    sa.Column('tracing_config', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name='tracing_app_config_pkey')
    )
    with op.batch_alter_table('tracing_app_configs', schema=None) as batch_op:
        batch_op.create_index('tracing_app_config_app_id_idx', ['app_id'], unique=False)

    with op.batch_alter_table('app_model_configs', schema=None) as batch_op:
        batch_op.add_column(sa.Column('trace_config', sa.Text(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('app_model_configs', schema=None) as batch_op:
        batch_op.drop_column('trace_config')

    with op.batch_alter_table('tracing_app_configs', schema=None) as batch_op:
        batch_op.drop_index('tracing_app_config_app_id_idx')

    op.drop_table('tracing_app_configs')
    # ### end Alembic commands ###
