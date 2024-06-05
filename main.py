from flask import Flask, render_template, jsonify, request, flash, redirect
from markupsafe import escape
from werkzeug.utils import secure_filename

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        print(request.files)
        if 'file' not in request.files:
            print('No file')
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            print('No file')
            return redirect(request.url)
        filename = secure_filename(file.filename)
        return jsonify({'name': filename, 'mimetype': file.mimetype, 'params': file.mimetype_params})
    