from flask import Flask


app = Flask(__name__)
app.config["DEBUG"] = True


@app.route("/")
def index():
    # fmt: off
    '''
    Objective: show one thing specific to the debugger that does not work well,
               which is due to a long-time bug in Flask

    When you run your application and something crashes,
    if you're running in debug mode, you get the debugger on the web browser.

    Since now we want to use the VS Code debugger,
    what we would like to do is that (instead of getting the Flask in-browser debugger)
    we would like the crash to be reported in the VS Code debugger.
    (That's actually what's broken and it's been broken for ages in Flask.)

    The reason: `flask run` does not properly tell an external debugger
                that there's been an error

    The resolution: switch to "the old way" of running Flask applications,
                    which is by using the `app.run()` method
                    (thus making the current module into an executable one
                    that will start the application when it's run from VS Code)
    '''
    # fmt: on
    a = 17 / 2
    a = b / 2  # Uncommenting this raises a NameError - in the VS Code debugger!
    return {"data": "Hello world!"}


if __name__ == "__main__":
    # Setting `passthrough_errors=True` causes errors to bubble up in an external
    # debugger.
    app.run(use_debugger=False, use_reloader=False, passthrough_errors=True)
