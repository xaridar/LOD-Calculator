from flask import Flask, redirect, render_template

app = Flask(__name__)

@app.route('/')
@app.route('/index')
def index():
    return redirect('/graph')

@app.route('/graph')
def graph():
    return render_template('index.html', render='graph')

@app.route('/calc')
def calc():
    return render_template('index.html', render='calc')