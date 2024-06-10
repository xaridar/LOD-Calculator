from flask import Flask, render_template, jsonify, request
from markupsafe import escape
import numpy as np
from werkzeug.utils import secure_filename
import pandas as pd

from lod import calc_lod

app = Flask(__name__)

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')