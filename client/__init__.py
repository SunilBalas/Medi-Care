from flask import Flask, render_template, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import current_user
from datetime import datetime
import re
import json
from main import predict

__disease = None
data = None


with open('symptoms.json') as f:
    symptoms = json.load(f)["data_columns"]

with open('config.json', 'r') as f:
    params = json.load(f)["params"]

local_server = True
app = Flask(__name__)


if(local_server):
    app.config['SQLALCHEMY_DATABASE_URI'] = params['local_uri']
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = params['prod_uri']

db = SQLAlchemy(app)


class Contacts(db.Model):
    sr_no = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(20), nullable=False)
    date = db.Column(db.String(12), nullable=True)
    subject = db.Column(db.String(50), nullable=False)
    addr = db.Column(db.String(80), nullable=False)


class Registration(db.Model):
    sr_no = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), nullable=False, unique=True)
    email = db.Column(db.String(20), nullable=False)
    date = db.Column(db.String(12), nullable=True)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(20), nullable=False)


def __init__(self, username, email, phone, password):
    self.username = username
    self.email = email
    self.phone = phone
    self.password = password


# class User(db.Model):
#     sr_no = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(30), nullable=False, unique=True)
#     email = db.Column(db.String(40), nullable=False)
#     date = db.Column(db.String(12), nullable=True)
#     image = db.Column(db.String(20), nullable=False, default='user.png')
#     phone = db.Column(db.String(30), nullable=False)


@app.route('/login', methods=['GET', 'POST'])
def login():
    global data
    """Login Form"""
    if request.method == 'GET':
        return render_template('login.html', params=params)
    else:
        uname = request.form['username']
        pwd = request.form['password']
        try:
            data = Registration.query.filter_by(
                username=uname, password=pwd).first()
            if data is not None:
                session['logged_in'] = True
                return render_template('index.html', params=params)
            else:
                return render_template('login.html', params=params)
        except:
            return render_template('register.html', params=params)


@app.route('/', methods=['GET', 'POST'])
def home():
    return render_template('index.html', params=params)


@app.route('/register', methods=['GET', 'POST'])
def register():
    """Register Form"""
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        phone = request.form['phone']
        password = request.form['password']

        new_user = Registration(username=username, email=email,
                                date=datetime.now(), phone=phone, password=password)
        db.session.add(new_user)
        db.session.commit()
        return render_template('login.html', params=params)
    return render_template('register.html', params=params)

@app.route('/account', methods=['GET', 'POST'])
def account():
    if session.get('logged_in'):
        user_id = data.sr_no
        user_data = Registration.query.filter_by(sr_no=user_id).first()
        uname = user_data.username
        email = user_data.email
        phone = user_data.phone
        old_password = user_data.password
        
        password_data = request.form.get('updatePassword')
        
        if password_data == "updatePassword":
            password = request.form['password']
            new_password = request.form['newPassword']
            confirm_password = request.form['confirmPassword']

            if old_password == password:
                if new_password == confirm_password:
                    rows_updated = Registration.query.filter_by(sr_no=user_id).update(dict(password=new_password))
                    db.session.commit()
                    return render_template('account.html', params=params, password=new_password)
                else:
                    print("Password is not correct")
                return render_template('account.html', params=params, uname=uname, email=email, phone=phone)
            else:
                print("Password is incorrect")
        elif password_data == "updateProfile":
            update_username = request.form['username']
            update_email = request.form['email']
            update_phone = request.form['phone']
                
            rows_updated = Registration.query.filter_by(sr_no=user_id).update(dict(username=update_username, email=update_email, phone=update_phone))
            db.session.commit()
            return render_template('account.html', params=params, uname=update_username, email=update_email, phone=update_phone)
        else:
            return render_template('account.html', params=params, uname=uname, email=email, phone=phone)
    else:
        return render_template('login.html', params= params)


@ app.route("/assessment", methods= ["GET", "POST"])
def assessment():
    global __disease
    if session.get('logged_in'):
        if request.method == 'POST':
            data = request.form.getlist("symptoms_values")
            __disease = predict(data)
            print(data)
            print(__disease)
        else:
            __disease = "no_disease"
        return render_template('assessment.html', params= params, symptoms = symptoms, symptoms_len = len(symptoms), __disease = __disease)
    else:
        return render_template('login.html', params= params)


@ app.route("/contacts", methods= ["GET", "POST"])
def contacts():
    if session.get('logged_in'):
        if request.method == 'POST':
            # Add entry to the database
            name = request.form['name']
            email = request.form['email']
            subject = request.form['subject']
            address = request.form['message']

            con_entry =Contacts(name = name, email = email,
                               date = datetime.now(), subject = subject, addr = address)
            db.session.add(con_entry)
            db.session.commit()
        return render_template('index.html', params= params)
    else:
        return render_template('login.html', params= params)


@ app.route("/logout")
def logout():
    """Logout Form"""
    session['logged_in'] = False
    return render_template('index.html', params= params)


if __name__ == '__main__':
    app.secret_key = 'this-is-secret-key'
    db.create_all()
    app.run(debug= True)
