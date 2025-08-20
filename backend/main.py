import sqlalchemy as sa
import sqlalchemy.orm as so
from app import application, db
from app.models import User, Project, Work, Block, Floor, Object


@application.cli.group()
def db_commands():
    pass

@db_commands.command()
def create_all():
    with application.app_context():
        db.create_all()
        print("Database tables created.")

if __name__ == "__main__":
    application.run(host="0.0.0.0", port=80, debug=False)

@application.shell_context_processor
def make_shell_context():
    return {'sa': sa, 'so': so, 'db': db, 'User': User, 'Project': Project,
            'Work': Work,
            'Block': Block, 'Floor': Floor, 'Object': Object}