from flask import Flask, render_template, jsonify
from markupsafe import escape

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')