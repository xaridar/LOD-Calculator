from flask import Flask, render_template, jsonify, request, flash, redirect
from markupsafe import escape
from werkzeug.utils import secure_filename
import numpy as np
import pandas as pd

app = Flask(__name__)

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        print('No file')
        return redirect('/')
    file = request.files['file']
    if file.filename == '':
        print('No file')
        return redirect('/')
    filename = secure_filename(file.filename)
    csv_data = pd.read_csv(file.stream)
    labels = csv_data.x.values.tolist()
    values = csv_data.y.values.tolist()
    # for row in reader:
    #     print(row)
    # print(contents)
    return render_template('graph.html', name=filename, labels=labels, values=values)
    