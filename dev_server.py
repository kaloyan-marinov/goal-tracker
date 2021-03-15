import subprocess
import sys

from goal_tracker import create_app


app = create_app()


print(
    f"dev_server.py - app.config['SQLALCHEMY_DATABASE_URI']={app.config['SQLALCHEMY_DATABASE_URI']}"
)


@app.cli.command()
def test():
    """Run unit tests."""
    tests = subprocess.call(["python", "-c", "import tests; tests.run()"])
    sys.exit(tests)


if __name__ == "__main__":
    app.run(use_debugger=False, use_reloader=False, passthrough_errors=True)
